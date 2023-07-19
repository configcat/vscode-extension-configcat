import * as vscode from 'vscode';
import { ConfigCatWorkspaceConfiguration } from './workspace-configuration';
import { handleError } from '../error-handler';

export class WorkspaceConfigurationProvider {

    public static configurationKey = 'configcat';
    public static connectedContextKey = 'configcat:connected';

    constructor(private context: vscode.ExtensionContext) {
    }

    async setConfiguration(productId: string, configId: string) {
        try {
            const config = vscode.workspace.getConfiguration(WorkspaceConfigurationProvider.configurationKey);
            await config.update('productId', productId);
            await config.update('configId', configId);
        } catch (error) {
            handleError('Workspace Configuration faild.', error);
        }
    }

    async checkConfiguration() {
        try {
            const configuration = await this.getWorkspaceConfiguration();

            await vscode.commands.executeCommand('setContext', WorkspaceConfigurationProvider.connectedContextKey,
                configuration?.configId && configuration?.productId && configuration?.publicApiBaseUrl && configuration?.dashboardBaseUrl);
        } catch {
            await vscode.commands.executeCommand('setContext', WorkspaceConfigurationProvider.connectedContextKey, false);
        }
    }

    getWorkspaceConfiguration(): Promise<ConfigCatWorkspaceConfiguration | null> {
        const config = vscode.workspace.getConfiguration(WorkspaceConfigurationProvider.configurationKey);
        const productId = config.get('productId');
        const configId = config.get('configId');
        const publicApiBaseUrl = config.get('publicApiBaseUrl');
        const dashboardBaseUrl = config.get('dashboardBaseUrl');

        return Promise.resolve({
            productId: String(productId),
            configId: String(configId),
            publicApiBaseUrl: String(publicApiBaseUrl),
            dashboardBaseUrl: String(dashboardBaseUrl),
        });
    }

    registerProviders() {
        this.context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(async e => {
                if (e.affectsConfiguration(WorkspaceConfigurationProvider.configurationKey)) {
                    await this.checkConfiguration();
                }
            })
        );
    }
}
