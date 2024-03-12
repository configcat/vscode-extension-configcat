import * as vscode from 'vscode';
import { AuthenticationProvider } from '../authentication/authentication-provider';
import { ConfigInput } from '../inputs/config-input';
import { ProductInput } from '../inputs/product-input';
import { PublicApiService } from '../public-api/public-api.service';
import { WorkspaceConfigurationProvider } from '../settings/workspace-configuration-provider';
import { handleError } from '../error-handler';
import { EvaluationVersion } from 'configcat-publicapi-node-client';

export enum ResourceType {
    unknown = 'Unknown',
    product = 'Product',
    config = 'Config'
}
export class ConfigProvider implements vscode.TreeDataProvider<Resource> {

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

        if (!element) {
            return this.getProducts();
        }

        if (element.resourceType === ResourceType.product) {
            return this.getConfigs(element.resourceId);
        }

        return Promise.resolve([]);
    }

    getProducts(): Thenable<Resource[]> {

        return Promise.all([
            this.authenticationProvider.getAuthenticationConfiguration(),
            this.workspaceConfigurationProvider.getWorkspaceConfiguration()
        ]).then(values => {
            const publicApiConfiguration = values[0];
            const workspaceConfiguration = values[1];

            if (!publicApiConfiguration || !workspaceConfiguration || !workspaceConfiguration.publicApiBaseUrl) {
                return [];
            }
            const statusBar = vscode.window.createStatusBarItem();
            statusBar.text = 'ConfigCat - Loading Products...';
            statusBar.show();

            const productsService = this.publicApiService.createProductsService(publicApiConfiguration, workspaceConfiguration.publicApiBaseUrl);
            return productsService.getProducts().then(products => {
                const items = products.body.map((p, index) => new Resource(p.productId ?? '', '', p.name ?? '', ResourceType.product, index === 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed));
                statusBar.hide();
                if (!items.length) {
                    items.push(new Resource('-1', '', 'Could not find any Products.', ResourceType.unknown, vscode.TreeItemCollapsibleState.None));
                }
                return items;
            }, error => {
                handleError('Could not load Products.', error);
                statusBar.hide();
                return [new Resource('-1', '', 'Could not load Products.', ResourceType.unknown, vscode.TreeItemCollapsibleState.None)];
            });
        }, () => {
            return [];
        });
    }

    getConfigs(productId: string): Thenable<Resource[]> {

        return Promise.all([
            this.authenticationProvider.getAuthenticationConfiguration(),
            this.workspaceConfigurationProvider.getWorkspaceConfiguration()
        ]).then(values => {
            const publicApiConfiguration = values[0];
            const workspaceConfiguration = values[1];

            if (!publicApiConfiguration || !workspaceConfiguration || !workspaceConfiguration.publicApiBaseUrl) {
                return [];
            }

            const statusBar = vscode.window.createStatusBarItem();
            statusBar.text = 'ConfigCat - Loading Configs...';
            statusBar.show();

            const configsService = this.publicApiService.createConfigsService(publicApiConfiguration, workspaceConfiguration.publicApiBaseUrl);
            return configsService.getConfigs(productId).then(configs => {
                const items = configs.body.map(c => new Resource(c.configId ?? '', productId, c.name ?? '', ResourceType.config, vscode.TreeItemCollapsibleState.None));
                statusBar.hide();
                if (!items.length) {
                    items.push(new Resource('-1', '', 'Could not find any Configs.', ResourceType.unknown, vscode.TreeItemCollapsibleState.None));
                }
                return items;
            }, error => {
                handleError('Could not load Configs.', error);
                statusBar.hide();
                return [new Resource('-1', '', 'Could not load Configs.', ResourceType.unknown, vscode.TreeItemCollapsibleState.None)];
            });
        }, () => {
            return [];
        });
    }

    async connectConfig(resource: any): Promise<void> {
        if (resource && resource.parentResourceId && resource.resourceId) {
            return await this.workspaceConfigurationProvider.setConfiguration(resource.parentResourceId, resource.resourceId);
        }

        let authenticationConfiguration = null;
        let workspaceConfiguration = null;
        try {
            authenticationConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
            workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
        } catch (error) {
            return;
        }
        if (!authenticationConfiguration || !workspaceConfiguration || !workspaceConfiguration.publicApiBaseUrl) {
            return;
        }

        const productsService = this.publicApiService.createProductsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
        const products = await productsService.getProducts();

        let productId: string;
        try {
            productId = await ProductInput.pickProduct(products.body);
        } catch (error) {
            return;
        }

        if (!productId) {
            return;
        }

        const configsService = this.publicApiService.createConfigsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
        const configs = await configsService.getConfigs(productId);

        let configId: string;
        try {
            configId = await ConfigInput.pickConfig(configs.body);
        } catch (error) {
            return;
        }

        if (!configId) {
            return;
        }

        return await this.workspaceConfigurationProvider.setConfiguration(productId, configId);
    }

    async addConfig(resource: Resource | null | undefined) {

        let authenticationConfiguration = null;
        let workspaceConfiguration = null;
        try {
            authenticationConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
            workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
        } catch (error) {
            return;
        }
        if (!authenticationConfiguration || !workspaceConfiguration || !workspaceConfiguration.publicApiBaseUrl) {
            return;
        }

        let productId = '';
        if (resource?.resourceType !== ResourceType.product) {
            const productsService = this.publicApiService.createProductsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
            const products = await productsService.getProducts();
            productId = await ProductInput.pickProduct(products.body);
        } else {
            productId = resource.resourceId;
        }

        if (!productId) {
            return;
        }

        let configName: string;
        try {
            configName = await ConfigInput.configInput();
        } catch (error) {
            return;
        }
        if (!configName) {
            return;
        }

        let evaluationVersion: EvaluationVersion;

        try {
            evaluationVersion = await ConfigInput.configVersionInput();
        } catch (error) {
            return;
        }
        if (!evaluationVersion) {
            return;
        }

        const configsService = this.publicApiService.createConfigsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
        let config = null;
        try {
            config = await configsService.createConfig(productId, { name: configName, evaluationVersion: evaluationVersion });
        } catch (error) {
            handleError('Could not create Config.', error)
        }

        if (!config || !config.body.configId) {
            return;
        }

        const connect = await ConfigInput.askConnect();
        if (connect !== 'Yes') {
            return;
        }

        return await this.workspaceConfigurationProvider.setConfiguration(productId, config.body.configId);
    }


    async openInDashboard(resource: any): Promise<void> {

        let authenticationConfiguration = null;
        let workspaceConfiguration = null;
        try {
            authenticationConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
            workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
        } catch (error) {
            return;
        }
        if (!authenticationConfiguration || !workspaceConfiguration || !workspaceConfiguration.dashboardBaseUrl || !workspaceConfiguration.publicApiBaseUrl) {
            return;
        }

        if (resource && resource.parentResourceId && resource.resourceId) {
            return await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(workspaceConfiguration.dashboardBaseUrl + '/'
                + resource.parentResourceId + '/' + resource.resourceId));
        }

        const productsService = this.publicApiService.createProductsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
        const products = await productsService.getProducts();

        let productId: string;
        try {
            productId = await ProductInput.pickProduct(products.body);
        } catch (error) {
            return;
        }

        if (!productId) {
            return;
        }

        const configsService = this.publicApiService.createConfigsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
        const configs = await configsService.getConfigs(productId);

        let configId: string;
        try {
            configId = await ConfigInput.pickConfig(configs.body);
        } catch (error) {
            return;
        }

        if (!configId) {
            return;
        }

        return await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(workspaceConfiguration.dashboardBaseUrl + '/'
            + productId + '/' + configId));
    }


    registerProviders() {
        const treeView = vscode.window.createTreeView('configcat.configs', {
            treeDataProvider: this,
            showCollapseAll: true
        });
        this.context.subscriptions.push(treeView);
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.configs.refresh',
            () => this.refresh()));
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.configs.add',
            async (resource) => await this.addConfig(resource)));
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.configs.openInDashboard',
            async (resource) => await this.openInDashboard(resource)));
        this.context.subscriptions.push(vscode.commands.registerCommand('configcat.configs.connect',
            async (resource) => {
                await this.connectConfig(resource);
            }));
        this.context.subscriptions.push(this.context.secrets.onDidChange(e => {
            if (e.key === AuthenticationProvider.secretKey) {
                this.refresh();
            }
        }));
        this.context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(WorkspaceConfigurationProvider.configurationKey)) {
                    this.refresh();
                }
            })
        );
    }
}

class Resource extends vscode.TreeItem {
    constructor(
        public resourceId: string,
        public parentResourceId: string,
        public readonly label: string,
        public resourceType: ResourceType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);
        super.contextValue = resourceType;
    }
}