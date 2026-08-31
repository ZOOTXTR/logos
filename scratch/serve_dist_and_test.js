const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DIST_DIR = 'C:\\Users\\mhmto\\.gemini\\antigravity\\scratch\\gemquest52\\dist';
const ARTIFACT_DIR = 'C:\\Users\\mhmto\\.gemini\\antigravity\\brain\\f8d2c3f7-1899-4358-93f7-5d1804bb3c5a';
const PORT = 8085;

function MIME_TYPES(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.ico': return 'image/x-icon';
    default: return 'application/octet-stream';
  }
}

// 1. Simple static HTTP server for SPA
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html'); // SPA fallback
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES(filePath) });
      res.end(data);
    }
  });
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runE2ETests() {
  console.log('🚀 Starting Static Web Server on port ' + PORT);
  await new Promise(resolve => server.listen(PORT, resolve));

  console.log('🌐 Server running at http://localhost:' + PORT);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 390, height: 844 } // Mobile Viewport
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[Page Error] ${err.toString()}`);
  });

  page.on('requestfailed', req => {
    networkErrors.push(`[Network Error] ${req.url()} - ${req.failure()?.errorText}`);
  });

  const testRoutes = [
    { name: '01_main_menu', path: '/' },
    { name: '02_blitz_mode', path: '/blitz' },
    { name: '03_anagram_mode', path: '/anagram' },
    { name: '04_wordconnect_mode', path: '/wordconnect' },
    { name: '05_wordchain_mode', path: '/chain' },
    { name: '06_dordle_mode', path: '/dordle' },
    { name: '07_duel_mode', path: '/duel' },
    { name: '08_profile_tab', path: '/profile' },
    { name: '09_leaderboard_tab', path: '/leaderboard' },
    { name: '10_settings_tab', path: '/settings' },
  ];

  const results = [];

  for (const route of testRoutes) {
    console.log(`\n🔍 Testing route: ${route.path} (${route.name})`);
    const initialErrorCount = consoleErrors.length;
    let status = 'PASSED';

    try {
      await page.goto(`http://localhost:${PORT}${route.path}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await sleep(2000);

      // Check if page loaded
      const bodyText = await page.evaluate(() => document.body.innerText);
      const isBlank = !bodyText || bodyText.trim().length === 0;

      if (isBlank) {
        status = 'FAILED (Blank Page)';
      } else if (consoleErrors.length > initialErrorCount) {
        status = 'WARNING (Console Errors)';
      }

      const screenshotPath = path.join(ARTIFACT_DIR, `e2e_${route.name}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`  📸 Saved screenshot: e2e_${route.name}.png`);
      console.log(`  Result: ${status}`);

    } catch (e) {
      status = `FAILED (${e.message})`;
      console.log(`  ❌ Route failed: ${e.message}`);
    }

    results.push({ route: route.path, name: route.name, status });
  }

  // Interactive UI Test in Blitz Mode
  console.log('\n🎮 Testing interactive inputs in Blitz mode...');
  try {
    await page.goto(`http://localhost:${PORT}/blitz`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Try typing letters
    await page.keyboard.press('a');
    await sleep(200);
    await page.keyboard.press('r');
    await sleep(200);
    await page.keyboard.press('a');
    await sleep(200);
    await page.keyboard.press('Enter');
    await sleep(500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_interactive_blitz.png') });
    console.log('  ✅ Interactive typing test completed in Blitz mode');
  } catch (e) {
    console.log(`  ⚠️ Interactive test warning: ${e.message}`);
  }

  console.log('\n========================================');
  console.log('📊 E2E AUTOMATED TEST RESULTS SUMMARY');
  console.log('========================================');
  results.forEach(r => console.log(`- ${r.name} (${r.route}): ${r.status}`));

  console.log(`\nTotal Console Errors Caught: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('\nTop Console Errors:');
    consoleErrors.slice(0, 10).forEach(e => console.log(`  ${e}`));
  }

  await browser.close();
  server.close();
  console.log('\n🏁 Server closed. Automated E2E test finished.');
}

runE2ETests().catch(e => {
  console.error('Fatal error during E2E run:', e);
  server.close();
  process.exit(1);
});
