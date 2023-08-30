import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    
    try {
    const { chromium } = require("playwright-chromium");
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const phoneNumber = req.body.phoneNumber; 

    if (!phoneNumber) {
        context.res = {
            status: 400,
            body: "Phone number is missing in the request body",
        };
        return;
    }

    await page.goto('https://c.howazit.com/e/2278738457?abts=1690191051306');
    await page.frameLocator('#iframeMobile').getByRole('radio', { name: 'להמשך בדיקה הכוללת הזדהות' }).click();
    await page.frameLocator('#iframeMobile').getByRole('button', { name: 'הבא' }).click();
    await page.frameLocator('#iframeMobile').getByRole('textbox', { name: 'לחץ כאן להקלדה' }).click();
    await page.frameLocator('#iframeMobile').getByRole('textbox', { name: 'לחץ כאן להקלדה' }).fill(phoneNumber);
    await page.frameLocator('#iframeMobile').getByRole('button', { name: 'הבא' }).click();
    
    context.res = {
        body: "Otp message sent to customer" 
    };
 }
 catch (error) {
    context.res = {
        status: 500,
        body: error.message,
    };  
}
};

export default httpTrigger;