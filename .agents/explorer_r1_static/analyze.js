const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
console.log('Project Root:', rootDir);

const subdirs = ['app', 'components', 'hooks', 'services', 'store', 'constants', 'screens', 'config'];

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.git', '.expo', 'dist', 'coverage', '.agents', 'android'].includes(file)) {
        results = results.concat(getAllFiles(fullPath, exts));
      }
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const allSourceFiles = [];
subdirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    allSourceFiles.push(...getAllFiles(dirPath));
  }
});

console.log(`Found ${allSourceFiles.length} source files.`);

const findings = {
  explicitAny: [],
  unsafeCasts: [],
  nonNullAssertions: [],
  emptyCatchBlocks: [],
  silentCatches: [],
  consoleUsage: [],
  todoFixme: [],
  potentialLeaks: [],
  hookDependencyIssues: [],
  circularDeps: [],
  unhandledAsync: [],
  fileList: []
};

// Map of imports for circular dependency analysis
const importGraph = {};

allSourceFiles.forEach(file => {
  const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
  findings.fileList.push(relPath);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  importGraph[relPath] = [];

  // Parse imports
  const importRegex = /import\s+(?:(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\})|(?:\w+))\s+from\s+)?['"]([^'"]+)['"]/g;
  let impMatch;
  while ((impMatch = importRegex.exec(content)) !== null) {
    const impPath = impMatch[1];
    if (impPath.startsWith('.')) {
      // Resolve relative path
      const dir = path.dirname(file);
      let resolved = path.resolve(dir, impPath);
      let targetRel = path.relative(rootDir, resolved).replace(/\\/g, '/');
      // Check extensions
      ['.ts', '.tsx', '/index.ts', '/index.tsx', ''].forEach(ext => {
        const check = targetRel + ext;
        if (allSourceFiles.some(f => path.relative(rootDir, f).replace(/\\/g, '/') === check)) {
          targetRel = check;
        }
      });
      importGraph[relPath].push(targetRel);
    } else if (impPath.startsWith('@/')) {
      const targetRel = impPath.replace('@/', '');
      importGraph[relPath].push(targetRel);
    }
  }

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // 1. any usage
    if (/:\s*any\b/.test(line) || /\bas\s+any\b/.test(line) || /<any>/.test(line)) {
      findings.explicitAny.push({ file: relPath, line: lineNum, text: trimmed });
    }

    // 2. as unknown as
    if (/as\s+unknown\s+as/.test(line)) {
      findings.unsafeCasts.push({ file: relPath, line: lineNum, text: trimmed });
    }

    // 3. non-null assertion !. or !)
    if (/[a-zA-Z0-9_\)\]]\s*!\s*[\.\[\(\),]/.test(line) && !line.includes('!=') && !line.includes('!==') && !line.includes('!important')) {
      findings.nonNullAssertions.push({ file: relPath, line: lineNum, text: trimmed });
    }

    // 4. empty or silent catch
    if (/catch\s*\([^\)]*\)\s*\{\s*\}/.test(line) || /catch\s*\{\s*\}/.test(line)) {
      findings.emptyCatchBlocks.push({ file: relPath, line: lineNum, text: trimmed });
    }

    // 5. console usage
    if (/\bconsole\.(log|warn|error|info|debug)\(/.test(line)) {
      findings.consoleUsage.push({ file: relPath, line: lineNum, text: trimmed });
    }

    // 6. TODO / FIXME
    if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(line)) {
      findings.todoFixme.push({ file: relPath, line: lineNum, text: trimmed });
    }

    // 7. Potential interval / timeout leak (setInterval / setTimeout without clearTimeout)
    if (/setInterval\(|setTimeout\(|addEventListener\(|addListener\(/.test(line)) {
      findings.potentialLeaks.push({ file: relPath, line: lineNum, text: trimmed });
    }
  });

  // Multiline catch check for silent catches (catch with only comments or empty or only console.log)
  const multilineCatch = /catch\s*\(([^)]*)\)\s*\{([^}]*)\}/g;
  let mcMatch;
  while ((mcMatch = multilineCatch.exec(content)) !== null) {
    const body = mcMatch[2].trim();
    const lineNum = content.substring(0, mcMatch.index).split('\n').length;
    if (body === '' || body.startsWith('//') || body.startsWith('/*')) {
      if (!findings.emptyCatchBlocks.some(f => f.file === relPath && f.line === lineNum)) {
        findings.emptyCatchBlocks.push({ file: relPath, line: lineNum, text: mcMatch[0].replace(/\n\s*/g, ' ') });
      }
    } else if (!body.includes('throw') && !body.includes('reportError') && !body.includes('setError') && !body.includes('Alert.alert') && !body.includes('Sentry')) {
      findings.silentCatches.push({ file: relPath, line: lineNum, text: mcMatch[0].replace(/\n\s*/g, ' ').substring(0, 150) });
    }
  }
});

// Check circular dependencies via DFS
function findCycles(graph) {
  const cycles = [];
  const visited = {};
  const recStack = {};

  function dfs(node, pathArr) {
    visited[node] = true;
    recStack[node] = true;
    pathArr.push(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited[neighbor]) {
        dfs(neighbor, [...pathArr]);
      } else if (recStack[neighbor]) {
        const cyclePath = pathArr.slice(pathArr.indexOf(neighbor));
        cyclePath.push(neighbor);
        cycles.push(cyclePath);
      }
    }

    recStack[node] = false;
  }

  for (const node of Object.keys(graph)) {
    if (!visited[node]) {
      dfs(node, []);
    }
  }
  return cycles;
}

findings.circularDeps = findCycles(importGraph);

console.log('--- Summary of Static Patterns ---');
console.log('Source files checked:', allSourceFiles.length);
console.log('Explicit any / as any:', findings.explicitAny.length);
console.log('Unsafe casts (as unknown as):', findings.unsafeCasts.length);
console.log('Non-null assertions (!):', findings.nonNullAssertions.length);
console.log('Empty catch blocks:', findings.emptyCatchBlocks.length);
console.log('Silent / Non-reporting catch blocks:', findings.silentCatches.length);
console.log('Console usages:', findings.consoleUsage.length);
console.log('Potential timer/listener instances:', findings.potentialLeaks.length);
console.log('TODO/FIXME comments:', findings.todoFixme.length);
console.log('Circular dependencies detected:', findings.circularDeps.length);

fs.writeFileSync(path.join(__dirname, 'pattern_results.json'), JSON.stringify(findings, null, 2));
console.log('Results written to pattern_results.json');
