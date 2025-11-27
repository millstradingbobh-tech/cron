import puppeteer from 'puppeteer';
import Logger from '../utils/logging';

export async function openAndCloseBrowser(url: string, leaveItOn: number = 5000) {
    const browser = await puppeteer.connect({
        browserWSEndpoint: 'https://production-sfo.browserless.io/?token=2TOs3OZXUYFDxLcc9ccc02d0540702ff40956290a9d24325a',
    });

    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle0" });
        await new Promise(resolve => setTimeout(resolve, leaveItOn));

    } catch (error) {
        Logger.error('Error during browser operation:', error);
    } finally {
        await browser.close();
        Logger.info('Browser closed.');
    }
}

