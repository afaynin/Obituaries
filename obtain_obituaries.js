const puppeteer = require('puppeteer');

(async () => {
  // Launch the browser in headful mode for debugging.
  const browser = await puppeteer.launch({ headless: false});
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
);
await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false }); // Hide Puppeteer
});
  page.setDefaultTimeout(300000)
  await page.goto('https://www.legacy.com/obituaries/search', { waitUntil: 'domcontentloaded' });

  // --- STEP 1: Click "More Filters" Button ---
  await page.waitForSelector('[data-component="MoreFiltersButton"]');

  await page.click('[data-component="MoreFiltersButton"]');
  console.log('"More Filters" button clicked');


  buttonSelector = '[data-component="AccordionButton"]'
//   await new Promise(resolve => setTimeout(resolve, 1000));
await page.evaluate(() => {
  document.querySelector('[data-component="AccordionButton"]').click();
});
  // --- STEP 3: Enter Search Keywords ---
  await page.waitForSelector('[data-component="KeywordsInput"]');
  await page.focus('[data-component="KeywordsInput"]');
  await page.keyboard.type('age:30');
  console.log('Entered keywords "age:30"');

  // --- STEP 4: Click "View Results" Button ---
  await page.waitForSelector('[data-component="ViewResultsButton"]');
  await page.evaluate(() => {
    document.querySelector('[data-component="ViewResultsButton"]').click();
});
//   await page.click('[data-component="ViewResultsButton"]');
  console.log('"View Results" button clicked');

  // --- STEP 5: Wait for Search Results to Load ---
  await page.waitForSelector('[data-component="SearchPersonCardSnippet"]');
  await page.evaluate(() => {
    document.querySelector('[data-component="SearchPersonCardSnippet"]').click();
});
  console.log('Search results loaded');


  const [newPage] = await Promise.all([
    new Promise(resolve => page.once('popup', resolve)), // Wait for the new tab to open
    // page.click('[data-component="SearchPersonCardSnippet"] > :nth-child(1)') // Click the specific child element
  ]);
  if (!newPage) throw new Error("New tab did not open");
  console.log('New tab opened');
  // --- STEP 7: Wait for the New Tab Content to Load ---
  const obituaryElement = await newPage.waitForSelector('[data-component="ObituaryParagraph"]');
  const obituary = await newPage.evaluate(el => el.innerText, obituaryElement);
  console.log('New tab content loaded');

  console.log('Extracted Obituary:', obituary);
  await browser.close()
//   await newPage.close()
//   await page.close()
  // Optionally, close the browser.
  // await browser.close();
})();