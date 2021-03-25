import * as vscode from 'vscode';
import { registerHelpProviders } from './help/help-provider';
import { PublicApiService } from './public-api/public-api.service';

export async function registerProviders(context: vscode.ExtensionContext): Promise<void> {
    const publicApiService = new PublicApiService();

    await registerHelpProviders(context);
}
