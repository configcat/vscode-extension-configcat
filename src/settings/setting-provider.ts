import * as vscode from 'vscode';
import { AuthenticationProvider } from '../authentication/authentication-provider';
import { PublicApiConfiguration } from '../public-api/public-api-configuration';
import { PublicApiService } from '../public-api/public-api.service';
import { ConfigCatWorkspaceConfiguration } from './workspace-configuration';
import { WorkspaceConfigurationProvider } from './workspace-configuration-provider';

export class SettingProvider implements vscode.TreeDataProvider<Resource> {

    constructor(private context: vscode.ExtensionContext,
        private authenticationProvider: AuthenticationProvider,
        private publicApiService: PublicApiService,
        private workspaceConfigurationProvider: WorkspaceConfigurationProvider) {
    }
    private _onDidChangeTreeData: vscode.EventEmitter<Resource | undefined | void> = new vscode.EventEmitter<Resource | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Resource | undefined | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Resource): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Resource): Thenable<Resource[]> {

        if (element !== null) {
            return Promise.resolve([]);
        }

        return Promise.all([
            this.authenticationProvider.getAuthenticationConfiguration(),
            this.workspaceConfigurationProvider.getWorkspaceConfiguration()
        ]).then(
            (value) => {
                const publicApiConfiguration = value[0];
                const workspaceConfiguration = value[1];
                if (!publicApiConfiguration || !workspaceConfiguration) {
                    return [];
                }

                const settingsService = this.publicApiService.createSettingsService(publicApiConfiguration);
                return settingsService.getSettings(workspaceConfiguration.configId).then(settings => {
                    const items = settings.body.map((s, index) => new Resource(String(s.settingId), s.key ?? '',
                        s.name ?? '', s.hint ?? '',
                        vscode.TreeItemCollapsibleState.None));

                    return items;
                }, () => { return []; });
            },
            () => { return []; });
    }

    registerProviders() {
        const treeView = vscode.window.createTreeView('configcat.settings', {
            treeDataProvider: this,
            showCollapseAll: true
        });
        this.context.subscriptions.push(treeView);
    }
}

class Resource extends vscode.TreeItem {
    constructor(
        public resourceId: string,
        public readonly key: string,
        public readonly name: string,
        public readonly hint: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(`˙${key} (${name})`, collapsibleState);
        super.description = hint;
        super.contextValue = key;
    }
}