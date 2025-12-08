
import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    try {
        console.log('Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

        // Slight delay to ensure animations/rendering settle
        await page.waitForTimeout(2000); // 2 seconds

        console.log('Taking screenshot...');
        await page.screenshot({ path: 'assets/app-screenshot.png' });
        console.log('Screenshot saved to assets/app-screenshot.png');
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
