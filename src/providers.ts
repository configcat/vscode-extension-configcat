import * as vscode from 'vscode';
import { AuthenticationProvider } from './authentication/authentication-provider';
import { HelpProvider } from './help/help-provider';
import { PublicApiService } from './public-api/public-api.service';

export async function registerProviders(context: vscode.ExtensionContext): Promise<void> {
    context.globalState.update('configcat.initializing', true);

    const publicApiService = new PublicApiService();
    const authenticationProvider = new AuthenticationProvider(context, publicApiService);
    const helpProvider = new HelpProvider(context);

    authenticationProvider.registerAuthenticationProviders();
    await authenticationProvider.reCheckAuthenticated();

    helpProvider.registerProviders();

    context.globalState.update('configcat.initializing', false);
}
