import { SettingType } from 'configcat-publicapi-node-client';
import * as vscode from 'vscode';
import { AuthenticationProvider } from '../authentication/authentication-provider';
import { PublicApiConfiguration } from '../public-api/public-api-configuration';
import { PublicApiService } from '../public-api/public-api.service';
import { ConfigCatWorkspaceConfiguration } from './workspace-configuration';
import { WorkspaceConfigurationProvider } from './workspace-configuration-provider';

export class SettingProvider implements vscode.TreeDataProvider<Resource> {

    private booleanSettingDescription = 'Feature Flag';
    private textSettingDescription = 'Text';
    private wholeNumberSettingDescription = 'Whole number';
    private decimalNumberSettingDescription = 'Decimal number';

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

        const settingTypeString = await vscode.window.showQuickPick(
            [this.booleanSettingDescription, this.textSettingDescription, this.wholeNumberSettingDescription, this.decimalNumberSettingDescription],
            {
                canPickMany: false,
                placeHolder: 'Pick a setting type'
            });
        if (!settingTypeString) {
            return;
        }

        let settingType: SettingType;
        switch (settingTypeString) {
            case this.booleanSettingDescription:
                settingType = SettingType.Boolean;
                break;
            case this.textSettingDescription:
                settingType = SettingType.String;
                break;
            case this.wholeNumberSettingDescription:
                settingType = SettingType.Int;
                break;
            case this.decimalNumberSettingDescription:
                settingType = SettingType.Double;
                break;
            default:
                return;
        }

        const name = await vscode.window.showInputBox({
            prompt: 'Description',
            placeHolder: 'Is my awesome feature enabled',
            validateInput: this.requiredValidator
        });
        if (!name) {
            return;
        }
        const key = await vscode.window.showInputBox({
            prompt: 'Key',
            placeHolder: 'isMyAwesomeFeatureEnabled',
            validateInput: this.requiredValidator
        });
        if (!key) {
            return;
        }
        const hint = await vscode.window.showInputBox({
            prompt: 'Hint',
            placeHolder: '',
            value: ''
        });
        if (hint === undefined) {
            return;
        }

        const confirmText = await vscode.window.showQuickPick(['Yes', 'No'], {
            canPickMany: false,
            placeHolder: 'Clicking on Yes will create a ' + settingTypeString + ' setting. Key: ' + key + '. Description: ' + name + ' Hint: ' + hint
        });

        if (confirmText !== 'Yes') {
            return;
        }

        const statusBar = vscode.window.createStatusBarItem();
        statusBar.text = 'ConfigCat - Creating Feature Flag...';
        statusBar.show();

        const settingsService = new PublicApiService().createSettingsService(publicApiConfiguration);
        try {
            const setting = await settingsService.createSetting(workspaceConfiguration.configId, {
                key, name, hint, settingType
            });

            this.refresh();

            statusBar.hide();
        } catch (error) {
            console.log(error);
            vscode.window.showWarningMessage('Could not create Feature Flag. Error: ' + error + (error?.response ?? '') + (error?.body ?? ''));
            statusBar.hide();
        }
    }

    requiredValidator = (value: string) => {
        if (value) {
            return null;
        }
        return 'Field is required.';
    };

    registerProviders() {
        const treeView = vscode.window.createTreeView('configcat.settings', {
            treeDataProvider: this,
            showCollapseAll: true
        });
        this.context.subscriptions.push(treeView);
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.refreshSettings',
            () => this.refresh()));
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.copyToClipboard',
            (resource: Resource) => vscode.env.clipboard.writeText(resource.key)));
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.findUsages',
            (resource: Resource) => vscode.commands.executeCommand('search.action.openNewEditor', { query: resource.label })));

        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.addSetting',
            async () => await this.addSetting()));
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