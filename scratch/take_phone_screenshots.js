const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DIST_DIR = 'C:\\Users\\mhmto\\.gemini\\antigravity\\scratch\\gemquest52\\dist';
const DEST_DIR = 'C:\\Users\\mhmto\\Desktop\\Logos_PlayStore_Assets';
const PORT = 8087;

function MIME_TYPES(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg': return 'image/jpeg';
    default: return 'application/octet-stream';
  }
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(500); res.end(); }
    else { res.writeHead(200, { 'Content-Type': MIME_TYPES(filePath) }); res.end(data); }
  });
});

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function takePhoneScreenshots() {
  await new Promise(res => server.listen(PORT, res));
  console.log('Server running on port ' + PORT);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3, // Output resolution 1170x2532 (Crisp HD Mobile)
      isMobile: true,
      hasTouch: true
    }
  });

  const page = await browser.newPage();

  // Emulate Android Mobile Chrome
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36');

  const screens = [
    { name: '03_Ekran_Goruntusu_Ana_Menu.png', url: '/' },
    { name: '04_Ekran_Goruntusu_Oyun_Ici.png', url: '/blitz' },
    { name: '05_Ekran_Goruntusu_Profil.png', url: '/profile' },
    { name: '06_Ekran_Goruntusu_Anagram.png', url: '/anagram' },
    { name: '07_Ekran_Goruntusu_KelimeBagi.png', url: '/wordconnect' },
    { name: '08_Ekran_Goruntusu_Ayarlar.png', url: '/settings' },
  ];

  for (const s of screens) {
    console.log(`📱 Capturing phone layout for ${s.name}...`);
    await page.goto(`http://localhost:${PORT}${s.url}`, { waitUntil: 'networkidle2' });
    await sleep(2000);

    // If on main page, click skip onboarding if present
    if (s.url === '/') {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('div[dir="auto"]'));
        const skip = btns.find(b => b.innerText === 'Geç' || b.innerText === 'Skip');
        if (skip) skip.click();
      });
      await sleep(1000);
    }

    const destPath = path.join(DEST_DIR, s.name);
    await page.screenshot({ path: destPath, fullPage: false });
    const stat = fs.statSync(destPath);
    console.log(`  📸 Saved Mobile Phone PNG: ${s.name} (${stat.size} bytes)`);
  }

  await browser.close();
  server.close();
  console.log('✅ All Mobile Phone screenshots updated successfully!');
}

takePhoneScreenshots().catch(e => {
  console.error('Error:', e);
  server.close();
});
