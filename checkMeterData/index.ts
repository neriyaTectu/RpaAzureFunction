import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { PageHandler } from '../helpers/PageHandler';

const pageHandler = new PageHandler();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const password = req.body.password;
        const customerId = req.body.customerId;

        if (!password) {
            context.res = {
                status: 400,
                body: "Password is missing in the request body",
            };
            return;
        }

        const result = pageHandler.checkMeterDetails(password, customerId);

        context.res = {
            body: {
                MeterId: (await result).meterNumber,
                IsMeterSmart: (await result).isMeterSmart,
            }
        };

    } catch (error) {
        context.res = {
            status: 500,
            body: error.message,
        };
    }

};

export default httpTrigger;