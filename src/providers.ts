import * as vscode from 'vscode';
import { AuthenticationProvider } from './authentication/authentication-provider';
import { ConfigProvider } from './configs/config-provider';
import { HelpProvider } from './help/help-provider';
import { PublicApiService } from './public-api/public-api.service';
import { SettingProvider } from './settings/setting-provider';
import { WorkspaceConfigurationProvider } from './settings/workspace-configuration-provider';

export async function registerProviders(context: vscode.ExtensionContext): Promise<void> {
    const workspaceConfigurationProvider = new WorkspaceConfigurationProvider(context);
    const publicApiService = new PublicApiService();
    const authenticationProvider = new AuthenticationProvider(context, publicApiService);
    await authenticationProvider.checkAuthenticated();
    await workspaceConfigurationProvider.checkConfiguration();
    const helpProvider = new HelpProvider(context);
    const configProvider = new ConfigProvider(context, authenticationProvider, publicApiService, workspaceConfigurationProvider);
    const settingProvider = new SettingProvider(context, authenticationProvider, publicApiService, workspaceConfigurationProvider);

    authenticationProvider.registerProviders();
    workspaceConfigurationProvider.registerProviders();
    configProvider.registerProviders();
    await settingProvider.registerProviders();
    helpProvider.registerProviders();
}
