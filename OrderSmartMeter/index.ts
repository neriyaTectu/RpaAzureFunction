import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { expect } from "@playwright/test";


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const { chromium } = require("playwright-chromium");

        const browser = await chromium.launch();
        const page = await browser.newPage();
     
        page.on("response", async (response) => {
            if (response.status() >= 400) {
                context.log.error(`Network error: ${response.status()} ${response.url()}`);
            }
        });

        assertRequiredParams(req.body, ['phoneNumber', 'id', 'firstName', 'lastName', 'email', 'contractNumber', 'city', 'street', 'homeNumber']);

        await page.goto('https://www.iec.co.il/interaction-form');
        await page.getByLabel('נושא הפנייה שלך').locator('div').nth(3).click();
        await page.getByText('מעבר בין מספקים ומידע על מונים חכמים').click();
        await page.getByRole('button', { name: 'המשך', exact: true }).click();
        await page.getByRole('textbox', { name: '* מספר תעודת זהות' }).click();
        await page.getByRole('textbox', { name: '* מספר תעודת זהות' }).fill(req.body.id);
        await page.getByLabel('שם פרטי').click();
        await page.getByLabel('שם פרטי').fill(req.body.firstName);
        await page.getByLabel('שם משפחה').click();
        await page.getByLabel('שם משפחה').fill(req.body.lastName);
        await page.getByLabel('מספר טלפון נייד').click();
        await page.getByLabel('מספר טלפון נייד').fill(req.body.phoneNumber);
        await page.getByLabel('כתובת מייל').click();
        await page.getByLabel('כתובת מייל').fill(req.body.email);
        await page.getByLabel('מספר חשבון חוזה').click();
        await page.getByLabel('מספר חשבון חוזה').fill(req.body.contractNumber);
        await page.getByLabel('י‌שוב').click();
        await page.getByLabel('י‌שוב').fill(req.body.city);
        await page.getByLabel('ר‌חוב').click();
        await page.getByLabel('ר‌חוב').fill(req.body.street);
        await page.getByLabel('מספר בית').click();
        await page.getByLabel('מספר בית').fill(req.body.homeNumber);
        await page.getByLabel('תוכן הפנייה  יש לפרט את סיבת הפנייה. אם המקום כאן לא מספיק, אפשר לצרף קבצים עם המידע הדרוש כדי שנוכל לעזור').click();
        await page.getByLabel('תוכן הפנייה  יש לפרט את סיבת הפנייה. אם המקום כאן לא מספיק, אפשר לצרף קבצים עם המידע הדרוש כדי שנוכל לעזור').fill('אני רוצה להזמין מונה חכם');

  await retryWithTimeout(context, async () => {
    await page.getByRole('button', { name: 'סיום ושליחה' }).click();
    await expect(page.getByText('תודה שפנית אלינוקיבלנו את הפנייה שלך ונבדוק אותה בהקדם. אם יהיה צורך בפרטים נוספ')).toBeVisible({timeout:5000});
    }, 10, 1000); 
       


        context.res = {
            body: `Smart meter was ordered to customer: ${req.body.firstName} ${req.body.lastName}, Phone: ${req.body.phoneNumber}, Email: ${req.body.email}`
        };
     }
     catch (error) {
        context.res = {
            status: 500,
            body: error.message,
        };  
    }
    };

    function assertRequiredParams(obj: any, requiredParams: string[]) {
        for (const param of requiredParams) {
            if (!obj.hasOwnProperty(param)) {
                throw new Error(`${param} is missing in the request body`);
            }
        }
    }

    async function retryWithTimeout(context: Context, action: () => Promise<void>, maxRetries: number, delayMs: number): Promise<void> {
        let retries = 0;
        
        while (retries < maxRetries) {
            try {
                await action();
                context.log(`send form was successful after ${retries} retries...`);
                return; 
            } catch (error) {
                context.log.error(`Retry ${retries + 1} failed: ${error.message}`);
                retries++;
                if (retries < maxRetries) {
                    context.log(`Retrying in ${delayMs} ms...`);
                    await new Promise(resolve => setTimeout(resolve, delayMs)); 
                }
            }
        }
                
        throw new Error(`Retry limit reached: ${maxRetries} retries`);
    }
 
    export default httpTrigger;

