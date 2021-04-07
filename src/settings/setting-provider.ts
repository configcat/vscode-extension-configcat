import { CreateSettingModel } from 'configcat-publicapi-node-client';
import * as vscode from 'vscode';
import { AuthenticationProvider } from '../authentication/authentication-provider';
import { SettingInput } from '../inputs/setting-input';
import { PublicApiConfiguration } from '../public-api/public-api-configuration';
import { PublicApiService } from '../public-api/public-api.service';
import { ConfigCatWorkspaceConfiguration } from './workspace-configuration';
import { WorkspaceConfigurationProvider } from './workspace-configuration-provider';

export class SettingProvider implements vscode.TreeDataProvider<Resource> {

    treeView: vscode.TreeView<Resource> | null = null;

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
                this.setMessage(undefined);
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
                        this.setMessage('Could not find any Settings.');
                    }
                    statusBar.hide();
                    return items;
                }, (error) => {
                    vscode.window.showWarningMessage('Could not load Settings. Error: ' + error);
                    statusBar.hide();
                    this.setMessage('Could not load Settings.');
                    return [];
                });
            },
            () => {
                return [];
            });
    }

    async addSetting() {

        let publicApiConfiguration: PublicApiConfiguration | null;
        let workspaceConfiguration: ConfigCatWorkspaceConfiguration | null;
        try {
            publicApiConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
            workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
        } catch (error) {
            return;
        }

        if (!publicApiConfiguration || !workspaceConfiguration) {
            return;
        }

        let setting: CreateSettingModel;
        try {
            setting = await SettingInput.settingInput();
        } catch (error) {
            return;
        }
        if (!setting) {
            return;
        }

        const statusBar = vscode.window.createStatusBarItem();
        statusBar.text = 'ConfigCat - Creating Feature Flag...';
        statusBar.show();

        const settingsService = new PublicApiService().createSettingsService(publicApiConfiguration);
        try {
            await settingsService.createSetting(workspaceConfiguration.configId, setting);
            this.refresh();
            statusBar.hide();
        } catch (error) {
            console.log(error);
            vscode.window.showWarningMessage('Could not create Feature Flag. Error: ' + error + (error?.response ?? '') + (error?.body ?? ''));
            statusBar.hide();
        }
    }

    setMessage(message: string | undefined) {
        if (!this.treeView) {
            return;
        }
        this.treeView.message = message;
    }

    setDescription(description: string | undefined) {
        if (!this.treeView) {
            return;
        }
        this.treeView.description = description;
    }

    registerProviders() {
        this.treeView = vscode.window.createTreeView('configcat.settings', {
            treeDataProvider: this,
            showCollapseAll: true
        });
        this.context.subscriptions.push(this.treeView);
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.settings.refresh',
            () => this.refresh()));
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.settings.copyToClipboard',
            (resource: Resource) => vscode.env.clipboard.writeText(resource.key)));
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.settings.findUsages',
            (resource: Resource) => vscode.commands.executeCommand('search.action.openNewEditor', { query: resource.label })));

        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.settings.add',
            async () => await this.addSetting()));
        this.context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(async e => {
                if (e.affectsConfiguration(WorkspaceConfigurationProvider.configurationKey)) {
                    await this.refresh();
                }
            })
        );

        this.context.subscriptions.push(
            this.context.secrets.onDidChange(async e => {
                if (e.key === AuthenticationProvider.secretKey) {
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