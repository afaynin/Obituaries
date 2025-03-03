const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Use headless: true in production
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to search page...");
    await page.goto('https://www.legacy.com/obituaries/search', { waitUntil: 'domcontentloaded' });
    
    // Click "More Filters" button using evaluate for better reliability
    console.log("Clicking More Filters button...");
    await page.evaluate(() => {
      const moreFiltersButton = document.querySelector('[data-component="MoreFiltersButton"]');
      if (moreFiltersButton) moreFiltersButton.click();
    });
    
    // Wait a bit to ensure filters expand
    // await page.waitForTimeout(2000);
    
    // Click "Accordion" button using evaluate since direct click is failing
    console.log("Clicking Accordion button...");
    await page.evaluate(() => {
      const accordionButtons = document.querySelectorAll('[data-component="AccordionButton"]');
      // If there are multiple accordion buttons, click them all or the specific one needed
      if (accordionButtons.length > 0) {
        accordionButtons.forEach(button => button.click());
      }
    });
    
    // Wait for the accordion to expand
    // await page.waitForTimeout(2000);
    
    // Enter search keywords
    console.log("Entering search keywords...");
    await page.evaluate(() => {
      const keywordsInput = document.querySelector('[data-component="KeywordsInput"]');
      if (keywordsInput) {
        keywordsInput.value = 'age:30';
        keywordsInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // await page.waitForTimeout(2000);
    
    // Click "View Results" using evaluate
    console.log("Clicking View Results button...");
    await page.evaluate(() => {
      const viewResultsButton = document.querySelector('[data-component="ViewResultsButton"]');
      if (viewResultsButton) viewResultsButton.click();
    });
    
    // Wait for search results to load
    console.log("Waiting for search results...");
    await page.waitForSelector('[data-component="SearchPersonCardSnippet"]', { timeout: 15000 });
    
    // Set up listener for new page before clicking
    console.log("Setting up new page listener...");
    const popupPromise = new Promise(resolve => {
      browser.once('targetcreated', async target => {
        const newPage = await target.page();
        await newPage.waitForLoadState('domcontentloaded');
        resolve(newPage);
      });
    });
    
    // Click on the first search result - this will open a new page
    console.log("Clicking first search result...");
    await page.evaluate(() => {
      const searchResult = document.querySelector('[data-component="SearchPersonCardSnippet"]');
      if (searchResult && searchResult.children.length > 1) {
        searchResult.children[1].click();
      }
    });
    
    // Wait for the new page to open and load
    console.log("Waiting for new page to open...");
    const newPage = await popupPromise;
    
    // Now we're working with the new page
    console.log("Looking for source obituary link...");
    await newPage.waitForTimeout(3000); // Give the page time to fully load
    
    // Get the URL from the "Link to Source Obituary" button
    const sourceUrl = await newPage.evaluate(() => {
      const link = document.querySelector('[data-component="LinkToSourceObitUrl"]');
      return link ? link.href : null;
    });
    
    console.log("Source URL:", sourceUrl);
    
    // If there's a source URL, navigate to it
    let obituaryText = null;
    if (sourceUrl) {
      console.log("Navigating to source obituary...");
      await newPage.goto(sourceUrl, { waitUntil: 'domcontentloaded' });
      
      // Extract obituary text
      obituaryText = await newPage.evaluate(() => {
        const obitElement = document.querySelector('.obituary-text-main');
        return obitElement ? obitElement.innerText : null;
      });
    }
    
    console.log('Obituary Text:', obituaryText);
    
    return obituaryText;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await browser.close();
  }
})();