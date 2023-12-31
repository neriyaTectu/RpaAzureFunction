import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { PageHandler } from '../helpers/PageHandler';

const pageHandler = new PageHandler();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    
    try {
        const phoneNumber = req.body.phoneNumber; 
    
        if (!phoneNumber) {
            context.res = {
                status: 400,
                body: "Phone number is missing in the request body",
            };
            return;
        }
        
        if (!pageHandler.page) {
            await pageHandler.initializePage();
        }
    
        pageHandler.sendOtpToCutomer(phoneNumber);
    
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