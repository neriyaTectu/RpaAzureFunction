export class PageHandler {
    public page: any | null = null;

    constructor() {
        this.page = null;
      }

    async initializePage() {
        const { chromium } = require("playwright-chromium");
        const browser = await chromium.launch();
        this.page = await browser.newPage();
        await this.page.goto('https://c.howazit.com/e/2278738457?abts=1690191051306');
    }

    async sendOtpToCutomer(phoneNumber: string) {
        
        if (!this.page) {
            throw new Error("Page is not initialized.");
        }

        await this.page.frameLocator('#iframeMobile').getByRole('radio', { name: 'להמשך בדיקה הכוללת הזדהות' }).click();
        await this.page.frameLocator('#iframeMobile').getByRole('button', { name: 'הבא' }).click();
        await this.page.frameLocator('#iframeMobile').getByRole('textbox', { name: 'לחץ כאן להקלדה' }).click();
        await this.page.frameLocator('#iframeMobile').getByRole('textbox', { name: 'לחץ כאן להקלדה' }).fill(phoneNumber);
        await this.page.frameLocator('#iframeMobile').getByRole('button', { name: 'הבא' }).click();
    }

    async checkMeterDetails(password: string, customerId: string) {
        
        if (!this.page) {
            throw new Error("Page is not initialized.");
        }

        await this.page.frameLocator('#iframeMobile').getByRole('radio', { name: 'קיבלתי, אפשר להתקדם' }).click();
        await this.page.frameLocator('#iframeMobile').getByRole('button', { name: 'הבא' }).click();
        await this.page.frameLocator('#iframeMobile').getByRole('textbox', { name: 'לחץ כאן להקלדה' }).fill(password);
        await this.page.frameLocator('#iframeMobile').getByRole('button', { name: 'הבא' }).click();
        await this.page.frameLocator('#iframeMobile').getByRole('radio', { name: 'מספר זיהוי + טלפון נייד' }).click();
        await this.page.frameLocator('#iframeMobile').getByRole('button', { name: 'הבא' }).click();
        await this.page.frameLocator('#iframeMobile').getByRole('textbox', { name: 'יש ללחוץ כאן להקלדה' }).fill(customerId);
        await this.page.frameLocator('#iframeMobile').getByRole('button', { name: 'הבא' }).click();
        
        const { extractedNumbers, extractedWords } = await extractDataFromTable(this.page);


        return {
            meterNumber: extractedNumbers[2],
            isMeterSmart: extractedWords[2] === 'כן'
        };
    }

    async closePage() {
        if (this.page) {
            await this.page.close();
            this.page = null;
        }
    }
}

async function extractDataFromTable(page) {
    const table = await page.frameLocator('#iframeMobile').getByRole('table');
    const rows = await table.locator('tbody tr');
    const texts = await rows.allTextContents();

    const extractedNumbers = texts.map(text => (text.match(/\d+/) || [])[0]);
    const extractedWords = texts.map(text => text.split(/\s+/)[2] || null);

    return { extractedNumbers, extractedWords };
}

export default PageHandler;
