const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

const declared = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  'react', 'react-native', 'expo', 'path', 'fs', 'crypto', 'os', 'http', 'https', 'stream', 'events', 'util', 'buffer'
]);

const imported = new Map();

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (['node_modules', '.git', '.agents', 'android', 'scratch', 'design-concepts', 'coverage'].includes(f)) continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scan(full);
    } else if (/\.(ts|tsx|js|jsx)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/from\s+['"]([^'"]+)['"]/) || line.match(/require\(['"]([^'"]+)['"]\)/);
        if (match) {
          const mod = match[1];
          if (!mod.startsWith('.') && !mod.startsWith('/')) {
            const rootMod = mod.startsWith('@') ? mod.split('/').slice(0, 2).join('/') : mod.split('/')[0];
            if (!imported.has(rootMod)) imported.set(rootMod, []);
            imported.get(rootMod).push(path.relative(projectRoot, full) + ':' + (i + 1));
          }
        }
      }
    }
  }
}

scan(projectRoot);

console.log('=== IMPORTED MODULES VS DECLARED IN PACKAGE.JSON ===');
let hasMissing = false;
for (const [mod, locations] of imported.entries()) {
  const isDeclared = declared.has(mod);
  console.log((isDeclared ? '[OK]      ' : '[MISSING] ') + mod + ' (used in ' + locations.length + ' places)');
  if (!isDeclared) {
    hasMissing = true;
    locations.forEach(loc => console.log('   -> ' + loc));
  }
}

if (hasMissing) {
  console.log('\n⚠️ FOUND MISSING PACKAGES IN PACKAGE.JSON!');
} else {
  console.log('\n✅ All imported third-party packages are declared in package.json.');
}
