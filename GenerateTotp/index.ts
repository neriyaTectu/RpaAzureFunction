import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as speakeasy from 'speakeasy';
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";



const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('start GenerateTotp function.');
    
    const secretValue = await getSecretFromKeyVault();

    if (!secretValue) {
        context.res = { status: 500, body: "Failed to retrieve secret from Key Vault." };
        return;
    }

    const totpCode = generateTOTP(secretValue);
    console.log('Generated TOTP code:', totpCode);
    
    const responseMessage = `Generated TOTP code: ${totpCode}`;

    context.res = {
        body: responseMessage
    };

};

function generateTOTP(secretKey: string ) {
    const time = Math.floor(Date.now() / 1000); 
    const totpCode = speakeasy.totp({
        secret: secretKey,
        encoding: 'base32',
        time,
        step: 30 
    });
    return totpCode;
}

async function getSecretFromKeyVault(): Promise<string | undefined> {
    const secretName = "PeleSecret";
    console.log('getSecretFromKeyVault');

    const client = new SecretClient(`https://PazgasElectricityVault.vault.azure.net`, new DefaultAzureCredential());
    
    try {
        console.log('try to get secret: '+secretName);
        const secret = await client.getSecret(secretName);
        return secret.value;
    } catch (error) {
        console.error("Error retrieving secret from Key Vault:", error);
        return undefined;
    }
}

export default httpTrigger;