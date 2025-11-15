import { chromium } from 'playwright';

async function captureScreenshots() {
  console.log('📸 Starting screenshot capture...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    // Navigate to the app
    console.log('🌐 Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit for everything to load
    await page.waitForTimeout(2000);

    // Take full page screenshot
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({
      path: 'screenshots/full-page.png',
      fullPage: true
    });
    console.log('✅ Saved: screenshots/full-page.png');

    // Take viewport screenshot
    console.log('📸 Taking viewport screenshot...');
    await page.screenshot({
      path: 'screenshots/viewport.png',
      fullPage: false
    });
    console.log('✅ Saved: screenshots/viewport.png');

    // Check if we need authentication
    const url = page.url();
    console.log('Current URL:', url);

    if (url.includes('/auth')) {
      console.log('📸 Taking auth page screenshot...');
      await page.screenshot({
        path: 'screenshots/auth-page.png',
        fullPage: true
      });
      console.log('✅ Saved: screenshots/auth-page.png');
      console.log('⚠️  Note: Authentication required. Screenshots show auth page.');
    } else {
      // Try to find and screenshot specific elements
      console.log('📸 Looking for form elements...');

      // Try to screenshot the PDF viewer area
      const pdfArea = await page.$('[class*="pdf"], [class*="viewer"], .react-pdf__Page');
      if (pdfArea) {
        console.log('📸 Taking PDF viewer screenshot...');
        await pdfArea.screenshot({
          path: 'screenshots/pdf-viewer.png'
        });
        console.log('✅ Saved: screenshots/pdf-viewer.png');
      }

      // Try to screenshot the navigation panel
      const navPanel = await page.$('[class*="navigation"], [class*="panel"]');
      if (navPanel) {
        console.log('📸 Taking navigation panel screenshot...');
        await navPanel.screenshot({
          path: 'screenshots/navigation-panel.png'
        });
        console.log('✅ Saved: screenshots/navigation-panel.png');
      }

      // Count form fields
      const inputs = await page.$$('input');
      const textareas = await page.$$('textarea');
      const checkboxes = await page.$$('input[type="checkbox"]');

      console.log(`\n📊 Form Elements Found:`);
      console.log(`   Inputs: ${inputs.length}`);
      console.log(`   Textareas: ${textareas.length}`);
      console.log(`   Checkboxes: ${checkboxes.length}`);
    }

    console.log('\n✅ Screenshot capture complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);

    // Try to take error screenshot
    try {
      const page = await browser.newPage();
      await page.screenshot({
        path: 'screenshots/error.png',
        fullPage: true
      });
      console.log('📸 Error screenshot saved: screenshots/error.png');
    } catch (e) {
      console.error('Could not save error screenshot:', e.message);
    }
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
import { mkdir } from 'fs/promises';
await mkdir('screenshots', { recursive: true });

// Run capture
captureScreenshots().catch(console.error);
