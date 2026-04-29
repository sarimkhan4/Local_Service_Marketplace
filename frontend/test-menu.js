import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting puppeteer...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.goto('http://localhost:4300/', { waitUntil: 'networkidle0' });
  console.log("Page loaded. Waiting for GSAP animation to complete...");
  
  // Wait for 5 seconds to let intro animation finish
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Clicking menu button...");
  await page.click('.hamburger-btn');
  
  // Wait for menu animation
  await new Promise(r => setTimeout(r, 1000));
  
  const menuVisible = await page.evaluate(() => {
    const menu = document.querySelector('.fullscreen-menu');
    if (!menu) return "Menu not found!";
    const style = window.getComputedStyle(menu);
    return `opacity: ${style.opacity}, visibility: ${style.visibility}, display: ${style.display}`;
  });
  
  console.log("Menu state after click:", menuVisible);
  
  await browser.close();
})();
