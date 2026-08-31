import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Navigate to dev server
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  const selector = 'div#root:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(5) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3)';
  
  // Wait, I am not logged in! The app requires login!
  // It redirects to AuthModal?
  // Let's just dump the body.
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log("BODY LEN:", html.length);
  
  const elHTML = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? el.outerHTML : "Not found";
  }, selector);
  
  console.log("SEL:", elHTML);
  
  await browser.close();
})();
