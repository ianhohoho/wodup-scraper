require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
  // Validate credentials
  if (!process.env.WODUP_USERNAME || !process.env.WODUP_PASSWORD) {
    console.error('Error: WODUP_USERNAME and WODUP_PASSWORD must be set in .env file');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false }); // Headless false to see what's happening
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('https://www.wodup.com/login', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');

    console.log('Waiting for email input...');
    // Wait for the input to be visible
    const emailInput = page.locator('input[name="username"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });

    console.log('Entering credentials...');
    await emailInput.fill(process.env.WODUP_USERNAME);
    await page.fill('input[type="password"]', process.env.WODUP_PASSWORD);

    console.log('Submitting login form...');
    // Press Enter to submit, which is often more reliable than clicking
    await page.keyboard.press('Enter');

    // Alternative: click the button if Enter doesn't work
    // await page.click('button[type="submit"]');

    console.log('Waiting for navigation...');
    try {
      // Wait for the URL to change to something other than login
      await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30000 });
      console.log('Successfully redirected to:', page.url());
    } catch (e) {
      console.log('Timed out waiting for URL change. Current URL:', page.url());
    }

    // Define date range (from July 1st)
    const endDate = new Date();
    const startDate = new Date('2025-07-01');

    const workouts = [];

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    console.log(`Starting scrape from ${formatDate(startDate)} to ${formatDate(endDate)}`);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d);
      const url = `https://www.wodup.com/timeline?date=${dateStr}`;

      console.log(`Scraping ${dateStr}...`);
      try {
        await page.goto(url, { timeout: 30000 });
        await page.waitForLoadState('networkidle');

        // Wait for cards to appear (or timeout if no workouts)
        try {
          await page.waitForSelector('.shadow-card', { timeout: 5000 });
        } catch (e) {
          console.log(`No workouts found for ${dateStr} (or timeout)`);
          continue;
        }
        // Expand "Show full workout" buttons
        // Use a while loop to handle DOM updates/refreshes after clicks
        try {
          await page.waitForTimeout(2000);

          let expandButton = await page.getByText('Show full workout').first();
          let safetyCounter = 0;

          while (await expandButton.count() > 0 && safetyCounter < 20) {
            if (await expandButton.isVisible()) {
              console.log(`Clicking expand button #${safetyCounter + 1}...`);
              await expandButton.scrollIntoViewIfNeeded();
              await expandButton.click({ force: true });
              await page.waitForTimeout(2000); // Wait for expansion
            }

            safetyCounter++;
            // Re-query for the next button
            expandButton = await page.getByText('Show full workout').first();
          }

          if (safetyCounter >= 20) {
            console.log('Hit safety limit for expand buttons.');
          }
        } catch (e) {
          console.log('Error processing expand buttons:', e.message);
        }
        // Scrape cards
        const cards = await page.locator('.shadow-card').all();

        for (const card of cards) {
          const text = await card.innerText();

          // Skip "Water Cooler"
          if (text.includes('Water Cooler')) continue;

          // Extract Program Name (rough heuristic)
          // The structure is complex, so we'll grab the full text for now and try to parse basic info
          // Or try to find specific elements

          let programName = 'Unknown Program';
          try {
            // Try to find the program title element
            // Based on HTML: <div class="flex-auto text-sm font-medium lg:text-base"><span> <span>BURN</span></span></div>
            const titleEl = card.locator('.flex-auto.text-sm.font-medium').first();
            if (await titleEl.count() > 0) {
              programName = await titleEl.innerText();
            }
          } catch (e) { }

          workouts.push({
            date: dateStr,
            program: programName.trim(),
            details: text // Capture full text for now to ensure we get everything
          });
        }

      } catch (err) {
        console.error(`Failed to scrape ${dateStr}:`, err);
      }
    }

    console.log(`Scraping complete. Found ${workouts.length} workouts.`);

    const fs = require('fs');
    fs.writeFileSync('workouts.json', JSON.stringify(workouts, null, 2));
    console.log('Saved workouts to workouts.json');

    // Keep browser open for a bit to inspect
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('An error occurred:', error);
    // Take a screenshot if possible
    try {
      await page.screenshot({ path: 'error_screenshot.png' });
      console.log('Saved error screenshot to error_screenshot.png');
    } catch (e) {
      console.error('Could not save screenshot');
    }
  } finally {
    await browser.close();
  }
})();
