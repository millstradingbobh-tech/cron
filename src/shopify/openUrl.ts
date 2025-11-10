import puppeteer from 'puppeteer';

export async function openAndCloseBrowser(url: string, leaveItOn: number = 5000) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await page.goto(url);
        console.log(`Opened browser to: ${url}`);

        await new Promise(resolve => setTimeout(resolve, leaveItOn));

    } catch (error) {
        console.error('Error during browser operation:', error);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}
