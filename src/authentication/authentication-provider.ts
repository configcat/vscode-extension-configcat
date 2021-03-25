import * as vscode from 'vscode';
import { PublicApiConfiguration } from '../public-api/public-api-configuration';
import { PublicApiService } from '../public-api/public-api.service';

export class AuthenticationProvider {

    private secretKey = 'configcat-publicapi-credentials';

    constructor(private context: vscode.ExtensionContext, private publicApiService: PublicApiService) {
    }

    async isAuthenticated(): Promise<boolean | null> {
        const configuration = await this.getAuthenticationConfiguration();
        return !!configuration;
    }

    async getAuthenticationConfiguration(): Promise<PublicApiConfiguration | null> {
        const credentialsString = await this.context.secrets.get(this.secretKey);
        if (!credentialsString) {
            return Promise.resolve(null);
        }

        const credentials: PublicApiConfiguration = JSON.parse(credentialsString);
        if (!credentials || !credentials.basePath || !credentials.basicAuthUsername || !credentials.basicAuthPassword) {
            return Promise.resolve(null);
        }

        return credentials;
    }

    async authenticate(): Promise<PublicApiConfiguration | null> {
        const basicAuthUsername = await vscode.window.showInputBox({
            prompt: 'To use ConfigCat VSCode extension, you should authenticate with your Public API credentials.',
            placeHolder: 'Basic auth username',
            validateInput: this.requiredValidator,
            ignoreFocusOut: true
        });
        if (!basicAuthUsername) {
            return null;
        }

        const basicAuthPassword = await vscode.window.showInputBox({
            prompt: 'Basic auth password',
            placeHolder: 'Basic auth password',
            validateInput: this.requiredValidator,
            ignoreFocusOut: true
        });
        if (!basicAuthPassword) {
            return null;
        }

        let basePath = await vscode.window.showInputBox({
            prompt: 'API base URL',
            placeHolder: 'Leave blank for default (https://api.configcat.com)',
            ignoreFocusOut: true
        });
        if (basePath == undefined) {
            return null;
        }
        if (!basePath) {
            basePath = 'https://api.configcat.com';
        }

        const configuration: PublicApiConfiguration = { basePath, basicAuthPassword, basicAuthUsername };

        const meService = this.publicApiService.createMeService(configuration);

        try {
            const me = await meService.getMe();
            this.context.globalState.update('configcat.email', me.body.email);
            this.context.globalState.update('configcat.fullName', me.body.fullName);
            this.context.globalState.update('configcat.authenticated', true);
            await this.context.secrets.store(this.secretKey, JSON.stringify(configuration));
            vscode.window.showInformationMessage('Logged in to ConfigCat with ' + me.body.email);
            return configuration;
        } catch (error) {
            vscode.window.showWarningMessage('Could not log in to ConfigCat');
            return null;
        }
    }

    async logout() {
        this.context.globalState.update('configcat.email', null);
        this.context.globalState.update('configcat.fullName', null);
        await this.context.secrets.delete(this.secretKey);
        this.context.globalState.update('configcat.authenticated', false);
        vscode.window.showInformationMessage('Logged out from ConfigCat');
    }

    requiredValidator = (value: string) => {
        if (value) {
            return null;
        }
        return 'Field is required.';
    }
}