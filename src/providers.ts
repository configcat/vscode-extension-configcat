import * as vscode from 'vscode';
import { AuthenticationProvider } from './authentication/authentication-provider';
import { registerHelpProviders } from './help/help-provider';
import { PublicApiService } from './public-api/public-api.service';

export async function registerProviders(context: vscode.ExtensionContext): Promise<void> {
    const publicApiService = new PublicApiService();
    const authenticationProvider = new AuthenticationProvider(context, publicApiService);
    context.globalState.update('configcat.initializing', true);
    context.globalState.update('configcat.authenticated', await authenticationProvider.isAuthenticated());

    await registerHelpProviders(context);
    context.globalState.update('configcat.initializing', false);
}
