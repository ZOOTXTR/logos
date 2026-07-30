const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://localhost:8081';
const outputDir = 'C:\\Users\\mhmto\\.gemini\\antigravity\\brain\\f8d2c3f7-1899-4358-93f7-5d1804bb3c5a';

(async () => {
  console.log('🚀 Launching automated browser tests via Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 420, height: 840 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Navigate to bypass onboarding first
  console.log('Navigating to game to set bypass cookies...');
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    localStorage.setItem('gq_onboarded', 'true');
    localStorage.setItem('gq_gems', '2220');
    localStorage.setItem('gq_premium', 'true');
  });

  // Reload to apply settings
  console.log('Reloading to load main menu...');
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 1: Main Menu
  console.log('Capturing Main Menu...');
  await page.screenshot({ path: path.join(outputDir, 'test_menu.png') });

  // Navigate to Profile page (last tab at the bottom)
  console.log('Clicking Profile Tab...');
  await page.mouse.click(380, 810);
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 2: Profile Dashboard
  console.log('Capturing Profile page with SVG charts...');
  await page.screenshot({ path: path.join(outputDir, 'test_profile.png') });

  // Click Sticker Album Card
  console.log('Clicking Sticker Album card...');
  await page.mouse.click(200, 240);
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 3: Sticker Album Modal
  console.log('Capturing Sticker Album View...');
  await page.screenshot({ path: path.join(outputDir, 'test_album.png') });

  // Click Buy Pack button "100 💎" (approx coordinates x: 340, y: 150)
  console.log('Purchasing Mystery Pack...');
  await page.mouse.click(340, 150);
  await new Promise(r => setTimeout(r, 2500)); // wait for roll animation

  // Screenshot 4: Unrevealed Cards Screen
  console.log('Capturing pack opening unrevealed cards...');
  await page.screenshot({ path: path.join(outputDir, 'test_pack_unrevealed.png') });

  // Click the 3 cards to flip them (approx coordinates: card 1: x: 100, card 2: x: 210, card 3: x: 320, all around y: 390)
  console.log('Flipping card 1...');
  await page.mouse.click(100, 390);
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Flipping card 2...');
  await page.mouse.click(210, 390);
  await new Promise(r => setTimeout(r, 1000));

  console.log('Flipping card 3...');
  await page.mouse.click(320, 390);
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 5: Revealed Cards Screen
  console.log('Capturing revealed sticker cards...');
  await page.screenshot({ path: path.join(outputDir, 'test_pack_revealed.png') });

  // Click Add to Album button (approx coordinates: x: 210, y: 550)
  console.log('Adding to album...');
  await page.mouse.click(210, 550);
  await new Promise(r => setTimeout(r, 1500));

  // Click Close Album Modal (approx coordinates x: 60, y: 40)
  console.log('Closing Album Modal...');
  await page.mouse.click(60, 40);
  await new Promise(r => setTimeout(r, 1500));

  // Click Cloud Sync Portal Card (approx coordinates x: 200, y: 310)
  console.log('Opening Cloud Sync modal...');
  await page.mouse.click(200, 310);
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 6: Cloud Sync Modal
  console.log('Capturing Cloud Backup Portal...');
  await page.screenshot({ path: path.join(outputDir, 'test_sync.png') });

  // Close Cloud Sync (approx x: 380, y: 340)
  console.log('Closing Cloud Sync modal...');
  await page.mouse.click(380, 340);
  await new Promise(r => setTimeout(r, 1500));

  // Click "Klasik" tab to start a game (x: 50, y: 810)
  console.log('Navigating to Game tab...');
  await page.mouse.click(50, 810);
  await new Promise(r => setTimeout(r, 2000));

  // Click "Karışık" button in menu to enter game board (approx x: 210, y: 430)
  console.log('Starting classic game...');
  await page.mouse.click(210, 430);
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 7: Active Game Board
  console.log('Capturing Game Board...');
  await page.screenshot({ path: path.join(outputDir, 'test_gameplay.png') });

  await browser.close();
  console.log('🎉 Automated browser tests completed! Screenshots saved to artifacts directory.');
})();
