import * as vscode from 'vscode';
import { AuthInput } from '../inputs/auth-input';
import { PublicApiConfiguration } from '../public-api/public-api-configuration';
import { PublicApiService } from '../public-api/public-api.service';
import { ConfigCatWorkspaceConfiguration } from '../settings/workspace-configuration';
import { WorkspaceConfigurationProvider } from '../settings/workspace-configuration-provider';

export const contextIsAuthenticated = 'configcat:authenticated';

export class AuthenticationProvider {

    public static secretKey = 'configcat:publicapi-credentials';
    public publicApiConfiguration: PublicApiConfiguration | null = null;

    constructor(private context: vscode.ExtensionContext,
        private publicApiService: PublicApiService,
        private workspaceConfigurationProvider: WorkspaceConfigurationProvider) {
    }

    async checkAuthenticated(): Promise<void> {
        try {
            await this.getAuthenticationConfiguration();
            await vscode.commands.executeCommand('setContext', contextIsAuthenticated, true);
        } catch (error) {
            await this.clear();
        }
    }

    async getAuthenticationConfiguration(): Promise<PublicApiConfiguration | null> {
        const credentialsString = await this.context.secrets.get(AuthenticationProvider.secretKey);
        if (!credentialsString) {
            return Promise.reject();
        }

        const credentials: PublicApiConfiguration = JSON.parse(credentialsString);
        if (!credentials || !credentials.basicAuthUsername || !credentials.basicAuthPassword) {
            return Promise.reject();
        }

        return Promise.resolve(credentials);
    }

    async authenticate(): Promise<PublicApiConfiguration | null> {

        let configuration: PublicApiConfiguration;
        try {
            configuration = await AuthInput.getAuthParameters();
        } catch (error) {
            return null;
        }

        let workspaceConfiguration: ConfigCatWorkspaceConfiguration | null;
        try {
            workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
        } catch (error) {
            return null;
        }

        if (!workspaceConfiguration || !workspaceConfiguration.publicApiBaseUrl) {
            return null;
        }

        const meService = this.publicApiService.createMeService(configuration, workspaceConfiguration.publicApiBaseUrl);

        try {
            const me = await meService.getMe();
            await this.context.secrets.store(AuthenticationProvider.secretKey, JSON.stringify(configuration));
            await vscode.window.showInformationMessage('Logged in to ConfigCat. Email: ' + me.body.email);
            return configuration;
        } catch (error) {
            await vscode.window.showWarningMessage('Could not log in to ConfigCat');
            return null;
        }
    }

    async logout() {
        await this.clear();
        vscode.window.showInformationMessage('Logged out from ConfigCat');
    }

    private async clear() {
        await vscode.commands.executeCommand('setContext', contextIsAuthenticated, false);
        await this.context.secrets.delete(AuthenticationProvider.secretKey);
    }

    registerProviders() {
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.login', async () => {
            await this.authenticate();
        }));
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.logout', async () => {
            await this.logout();
        }));
        this.context.subscriptions.push(
            this.context.secrets.onDidChange(async e => {
                if (e.key === AuthenticationProvider.secretKey) {
                    await this.checkAuthenticated();
                }
            })
        );
    }
}