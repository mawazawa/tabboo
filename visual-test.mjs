import { chromium } from 'playwright';

async function visualTest() {
  console.log('Starting visual regression test...');

  // Launch browser with sandbox disabled for testing environments
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for the auth page or main app to load
    await page.waitForTimeout(2000);

    // Check if we're on the auth page
    const isAuthPage = await page.url().includes('/auth');

    if (isAuthPage) {
      console.log('On auth page - need to sign in first');
      console.log('Current URL:', await page.url());

      // For testing purposes, let's see what's on the page
      const pageTitle = await page.title();
      console.log('Page title:', pageTitle);

      // Take screenshot of auth page
      await page.screenshot({
        path: 'screenshots/01-auth-page.png',
        fullPage: true
      });
      console.log('Screenshot saved: screenshots/01-auth-page.png');
    } else {
      console.log('Already on main app');
    }

    // Try to find form fields
    const inputs = await page.$$('input[placeholder]');
    console.log(`Found ${inputs.length} input fields`);

    // Take initial screenshot
    await page.screenshot({
      path: 'screenshots/02-initial-form.png',
      fullPage: true
    });
    console.log('Screenshot saved: screenshots/02-initial-form.png');

    // If we can access the form, fill it out
    if (inputs.length > 0) {
      console.log('Filling out form fields...');

      // Fill out test data
      const testData = {
        'NAME': 'Jane Smith',
        'STREET ADDRESS': '123 Main Street',
        'CITY': 'Los Angeles',
        'STATE': 'CA',
        'ZIP': '90001',
        'PHONE': '(555) 123-4567',
        'FAX': '(555) 123-4568',
        'EMAIL': 'jane.smith@example.com',
        'ATTORNEY FOR': 'Self-Represented',
        'BAR #': 'N/A',
        'COUNTY': 'Los Angeles',
        'PETITIONER': 'John Doe',
        'RESPONDENT': 'Jane Smith',
        'CASE #': 'FL12345678',
        'HEARING DATE': '12/15/2025',
        'HH:MM AM/PM': '9:00 AM',
        'Department': 'Family Law 3',
        'Room number': '301',
        'First child full name': 'Emily Smith',
        'MM/DD/YYYY': '03/15/2015',
        'Second child full name': 'Michael Smith',
        'Specify other orders': 'Temporary restraining order'
      };

      // Try to fill fields by placeholder
      for (const [placeholder, value] of Object.entries(testData)) {
        try {
          const input = await page.$(`input[placeholder="${placeholder}"]`);
          if (input) {
            await input.fill(value);
            console.log(`Filled: ${placeholder} = ${value}`);
          }
        } catch (err) {
          console.log(`Could not fill ${placeholder}:`, err.message);
        }
      }

      // Wait for fields to render
      await page.waitForTimeout(1000);

      // Take screenshot of filled form
      await page.screenshot({
        path: 'screenshots/03-filled-form.png',
        fullPage: true
      });
      console.log('Screenshot saved: screenshots/03-filled-form.png');

      // Also take a zoomed screenshot of the PDF area
      const pdfViewer = await page.$('.pdf-viewer, [role="document"]');
      if (pdfViewer) {
        await pdfViewer.screenshot({
          path: 'screenshots/04-pdf-viewer-close-up.png'
        });
        console.log('Screenshot saved: screenshots/04-pdf-viewer-close-up.png');
      }
    }

  } catch (error) {
    console.error('Error during visual test:', error);

    // Take error screenshot
    await page.screenshot({
      path: 'screenshots/99-error.png',
      fullPage: true
    });
    console.log('Error screenshot saved: screenshots/99-error.png');
  } finally {
    await browser.close();
    console.log('Visual test complete!');
  }
}

// Create screenshots directory
import { mkdir } from 'fs/promises';
await mkdir('screenshots', { recursive: true });

// Run the test
visualTest().catch(console.error);
