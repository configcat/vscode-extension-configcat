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
        if (element) {
            return Promise.resolve([]);
        }

        return Promise.all([
            this.authenticationProvider.getAuthenticationConfiguration(),
            this.workspaceConfigurationProvider.getWorkspaceConfiguration()
        ]).then(
            values => {
                console.log(values);

                const statusBar = vscode.window.createStatusBarItem();
                statusBar.text = 'ConfigCat - Loading Settings...';
                statusBar.show();

                const publicApiConfiguration = values[0];
                const workspaceConfiguration = values[1];
                if (!publicApiConfiguration || !workspaceConfiguration) {
                    statusBar.hide();
                    return [];
                }

                const settingsService = this.publicApiService.createSettingsService(publicApiConfiguration);
                return settingsService.getSettings(workspaceConfiguration.configId).then(settings => {
                    const items = settings.body.map((s, index) => new Resource(String(s.settingId), s.key ?? '',
                        s.name ?? '', s.hint ?? '',
                        vscode.TreeItemCollapsibleState.None));
                    if (!items.length) {
                        items.push(new Resource('-1', 'Could not find any Settings.', '', '', vscode.TreeItemCollapsibleState.None));
                    }
                    statusBar.hide();
                    return items;
                }, (error) => {
                    vscode.window.showWarningMessage('Could not load Settings. Error: ' + error);
                    statusBar.hide();
                    return [new Resource('-1', 'Could not load Settings.', '', '', vscode.TreeItemCollapsibleState.None)];
                });
            },
            () => {
                return [];
            });
    }

    registerProviders() {
        const treeView = vscode.window.createTreeView('configcat.settings', {
            treeDataProvider: this,
            showCollapseAll: true
        });
        this.context.subscriptions.push(treeView);
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.refreshSettings', () => this.refresh()));
        this.context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(async e => {
                if (e.affectsConfiguration(WorkspaceConfigurationProvider.configurationKey)) {
                    await this.refresh();
                }
            })
        );
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
        super(key, collapsibleState);
        super.description = name;
        super.tooltip = hint;
        super.contextValue = 'Setting';
    }
}