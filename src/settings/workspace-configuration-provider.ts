import * as vscode from 'vscode';
import { ConfigCatWorkspaceConfiguration } from './workspace-configuration';

export class WorkspaceConfigurationProvider {

    public static configurationKey = 'configcat';
    public static connectedContextKey = 'configcat:connected';

    constructor(private context: vscode.ExtensionContext) {
    }

    async setConfiguration(productId: string, configId: string) {
        const config = vscode.workspace.getConfiguration(WorkspaceConfigurationProvider.configurationKey);
        await config.update('productid', productId);
        await config.update('configid', configId);
    }

    async checkConfiguration() {
        try {
            await this.getWorkspaceConfiguration();
            await vscode.commands.executeCommand('setContext', WorkspaceConfigurationProvider.connectedContextKey, true);
        } catch {
            await vscode.commands.executeCommand('setContext', WorkspaceConfigurationProvider.connectedContextKey, false);
        }
    }

    async getWorkspaceConfiguration(): Promise<ConfigCatWorkspaceConfiguration> {
        const config = vscode.workspace.getConfiguration(WorkspaceConfigurationProvider.configurationKey);
        const productId = config.get('productId');
        const configId = config.get('configId');
        if (productId && configId) {
            return Promise.resolve({ productId: String(productId), configId: String(configId) });
        }
        return Promise.reject();
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
