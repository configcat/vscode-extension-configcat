import * as vscode from 'vscode';
import { AuthenticationProvider } from './authentication/authentication-provider';
import { ConfigProvider } from './configs/config-provider';
import { HelpProvider } from './help/help-provider';
import { PublicApiService } from './public-api/public-api.service';

export async function registerProviders(context: vscode.ExtensionContext): Promise<void> {
    const publicApiService = new PublicApiService();
    const authenticationProvider = new AuthenticationProvider(context, publicApiService);
    await authenticationProvider.checkAuthenticated();
    const helpProvider = new HelpProvider(context);
    const configProvider = new ConfigProvider(context, authenticationProvider, publicApiService);

    authenticationProvider.registerProviders();
    configProvider.registerProviders();
    helpProvider.registerProviders();
}
