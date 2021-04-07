import * as vscode from 'vscode';
import { AuthenticationProvider } from '../authentication/authentication-provider';
import { PublicApiService } from '../public-api/public-api.service';

export enum ResourceType {
    unknown = 'Unknown',
    product = 'Product',
    config = 'Config'
}
export class ConfigProvider implements vscode.TreeDataProvider<Resource> {

    constructor(private context: vscode.ExtensionContext,
        private authenticationProvider: AuthenticationProvider,
        private publicApiService: PublicApiService) {
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

        if (!element) {
            return this.getProducts();
        }

        if (element.resourceType === ResourceType.product) {
            return this.getConfigs(element.resourceId);
        }

        return Promise.resolve([]);
    }

    getProducts(): Thenable<Resource[]> {

        return this.authenticationProvider.getAuthenticationConfiguration().then(configuration => {
            if (!configuration) {
                return [];
            }
            const statusBar = vscode.window.createStatusBarItem();
            statusBar.text = 'ConfigCat - Loading Products...';
            statusBar.show();

            const productsService = this.publicApiService.createProductsService(configuration);
            return productsService.getProducts().then(products => {
                const items = products.body.map((p, index) => new Resource(p.productId ?? '', p.name ?? '', ResourceType.product, index === 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed));
                statusBar.hide();
                if (!items.length) {
                    items.push(new Resource('-1', 'Could not find any Products.', ResourceType.unknown, vscode.TreeItemCollapsibleState.None));
                }
                return items;
            }, error => {
                vscode.window.showWarningMessage('Could not load Products. Error: ' + error);
                statusBar.hide();
                return [new Resource('-1', 'Could not load Products.', ResourceType.unknown, vscode.TreeItemCollapsibleState.None)];
            });
        }, error => {
            return [];
        });
    }

    getConfigs(productId: string): Thenable<Resource[]> {

        return this.authenticationProvider.getAuthenticationConfiguration().then(configuration => {
            if (!configuration) {
                return [];
            }
            const statusBar = vscode.window.createStatusBarItem();
            statusBar.text = 'ConfigCat - Loading Configs...';
            statusBar.show();

            const configsService = this.publicApiService.createConfigsService(configuration);
            return configsService.getConfigs(productId).then(configs => {
                const items = configs.body.map(c => new Resource(c.configId ?? '', c.name ?? '', ResourceType.config, vscode.TreeItemCollapsibleState.None));
                statusBar.hide();
                if (!items.length) {
                    items.push(new Resource('-1', 'Could not find any Configs.', ResourceType.unknown, vscode.TreeItemCollapsibleState.None));
                }
                return items;
            }, error => {
                vscode.window.showWarningMessage('Could not load Configs. Error: ' + error);
                statusBar.hide();
                return [new Resource('-1', 'Could not load Configs.', ResourceType.unknown, vscode.TreeItemCollapsibleState.None)];
            });
        }, error => {
            return [];
        });
    }

    registerProviders() {
        const treeView = vscode.window.createTreeView('configcat.configs', {
            treeDataProvider: this,
            showCollapseAll: true
        });
        this.context.subscriptions.push(treeView);
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.configs.refresh', () => this.refresh()));
    }
}

class Resource extends vscode.TreeItem {
    constructor(
        public resourceId: string,
        public readonly label: string,
        public resourceType: ResourceType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);
        super.contextValue = resourceType;
    }
}