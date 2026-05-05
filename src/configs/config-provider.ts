import { ProductModel } from "configcat-publicapi-node-client";
import * as vscode from "vscode";
import { AuthenticationProvider } from "../authentication/authentication-provider";
import { WorkspaceConfigurationProvider } from "../configuration/workspace-configuration-provider";
import { handleError } from "../error-handler";
import { ConfigInput } from "../inputs/config-input";
import { ProductInput } from "../inputs/product-input";
import { PublicApiService } from "../public-api/public-api.service";
import { CreateConfigWebPanel } from "../webpanel/create-config-webpanel";

export enum ResourceType {
  Unknown = "Unknown",
  Product = "Product",
  Config = "Config",
}
export class ConfigProvider implements vscode.TreeDataProvider<Resource> {

  constructor(private readonly context: vscode.ExtensionContext,
    private readonly authenticationProvider: AuthenticationProvider,
    private readonly publicApiService: PublicApiService,
    private readonly workspaceConfigurationProvider: WorkspaceConfigurationProvider) {
  }

  treeView: vscode.TreeView<Resource | undefined> | null = null;
  selectedConfig: string | null = null;

  private readonly _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

  selectConfig(configId: string): void {
    this.selectedConfig = configId;
  }

  refreshCommand(resource?: Resource): void {
    if (resource?.resourceId && resource.resourceType === ResourceType.Config) {
      this.selectedConfig = resource.resourceId;
    }
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Resource): vscode.TreeItem {
    return element;
  }

  getParent(_element?: Resource): vscode.ProviderResult<Resource> {
    if (_element?.resourceType === ResourceType.Config) {
      return new Resource(_element.parentResourceId, "", "", ResourceType.Product, vscode.TreeItemCollapsibleState.Expanded, "");
    }
    return null;
  }

  getChildren(element?: Resource): Thenable<Resource[]> {
    if (!element) {
      return this.getProducts();
    }
    if (element.resourceType === ResourceType.Product) {
      return this.getConfigs(element.resourceId);
    }
    return Promise.resolve([]);
  }

  getProducts(): Thenable<Resource[]> {

    return Promise.all([
      this.authenticationProvider.getAuthenticationConfiguration(),
      this.workspaceConfigurationProvider.getWorkspaceConfiguration(),
    ]).then(values => {
      const publicApiConfiguration = values[0];
      const workspaceConfiguration = values[1];

      if (!publicApiConfiguration || !workspaceConfiguration?.publicApiBaseUrl) {
        return [];
      }
      const statusBar = vscode.window.createStatusBarItem();
      statusBar.text = "ConfigCat - Loading Products...";
      statusBar.show();

      const productsService = this.publicApiService.createProductsService(publicApiConfiguration, workspaceConfiguration.publicApiBaseUrl);
      return productsService.getProducts().then(products => {
        const items = products.data.map((p, index) => new Resource(p.productId ?? "", "", p.name ?? "", ResourceType.Product, index === 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed, p.description ?? ""));
        statusBar.hide();
        if (!items.length) {
          items.push(new Resource("-1", "", "Could not find any Products.", ResourceType.Unknown, vscode.TreeItemCollapsibleState.None, ""));
        }
        return items;
      }, (error: unknown) => {
        void handleError("Could not load Products.", error as Error);
        statusBar.hide();
        return [new Resource("-1", "", "Could not load Products.", ResourceType.Unknown, vscode.TreeItemCollapsibleState.None, "")];
      });
    }, () => {
      return [];
    });
  }

  getConfigs(productId: string): Thenable<Resource[]> {

    return Promise.all([
      this.authenticationProvider.getAuthenticationConfiguration(),
      this.workspaceConfigurationProvider.getWorkspaceConfiguration(),
    ]).then(values => {
      const publicApiConfiguration = values[0];
      const workspaceConfiguration = values[1];

      if (!publicApiConfiguration || !workspaceConfiguration?.publicApiBaseUrl) {
        return [];
      }

      const statusBar = vscode.window.createStatusBarItem();
      statusBar.text = "ConfigCat - Loading Configs...";
      statusBar.show();

      const configsService = this.publicApiService.createConfigsService(publicApiConfiguration, workspaceConfiguration.publicApiBaseUrl);
      return configsService.getConfigs(productId).then(async configs => {
        const items = configs.data.map(c => new Resource(c.configId ?? "", productId, c.name ?? "", ResourceType.Config, vscode.TreeItemCollapsibleState.None, c.description ?? ""));
        statusBar.hide();
        if (!items.length) {
          items.push(new Resource("-1", "", "Could not find any Configs.", ResourceType.Unknown, vscode.TreeItemCollapsibleState.None, ""));
        }
        if (this.selectedConfig) {
          const selectedResource = items.find(resource => resource?.resourceId === this.selectedConfig);
          if (selectedResource) {
            this.treeView?.reveal(selectedResource, { select: true, focus: true, expand: false });
            this.selectedConfig = null;
          }
        }
        return items;
      }, (error: unknown) => {
        void handleError("Could not load Configs.", error as Error);
        this.selectedConfig = null;
        statusBar.hide();
        return [new Resource("-1", "", "Could not load Configs.", ResourceType.Unknown, vscode.TreeItemCollapsibleState.None, "")];
      });
    }, () => {
      return [];
    });
  }

  async connectConfig(productId?: string, configId?: string): Promise<void> {
    if (productId && configId) {
      return await this.workspaceConfigurationProvider.setConfiguration(productId, configId);
    }
    return;
  }

  async connectConfigCommand(resource?: Resource): Promise<void> {
    if (resource?.parentResourceId && resource.resourceId) {
      return this.connectConfig(resource.parentResourceId, resource.resourceId);
    }

    let authenticationConfiguration = null;
    let workspaceConfiguration = null;
    try {
      authenticationConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
      workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
    } catch (error: unknown) {
      console.log(error);
      return;
    }
    if (!authenticationConfiguration || !workspaceConfiguration?.publicApiBaseUrl) {
      return;
    }

    const productsService = this.publicApiService.createProductsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    const products = await productsService.getProducts();

    let productId: string;
    try {
      productId = await ProductInput.pickProduct(products.data);
    } catch (error: unknown) {
      console.log(error);
      return;
    }

    if (!productId) {
      return;
    }

    const configsService = this.publicApiService.createConfigsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    const configs = await configsService.getConfigs(productId);

    let configId: string;
    try {
      configId = await ConfigInput.pickConfig(configs.data);
    } catch (error: unknown) {
      console.log(error);
      return;
    }

    if (!configId) {
      return;
    }

    return this.connectConfig(productId, configId);
  }

  async openCreatePanelCommand(resource: Resource | null | undefined) {

    let authenticationConfiguration = null;
    let workspaceConfiguration = null;
    try {
      authenticationConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
      workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
    } catch (error: unknown) {
      console.log(error);
      return;
    }
    if (!authenticationConfiguration || !workspaceConfiguration?.publicApiBaseUrl) {
      return;
    }

    let productId = "";
    if (resource?.resourceType !== ResourceType.Product) {
      const productsService = this.publicApiService.createProductsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
      const products = await productsService.getProducts();
      productId = await ProductInput.pickProduct(products.data);
    } else {
      productId = resource.resourceId;
    }

    if (!productId) {
      return;
    }

    const productService = this.publicApiService.createProductsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    let productModel: ProductModel | undefined;
    try {
      productModel = (await productService.getProduct(productId)).data;
    } catch (error: unknown) {
      console.log(error);
      return;
    }
    return new CreateConfigWebPanel(this.context, authenticationConfiguration, workspaceConfiguration, productModel, this);
  }

  async openInDashboardCommand(resource: Resource): Promise<void> {

    let authenticationConfiguration = null;
    let workspaceConfiguration = null;
    try {
      authenticationConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
      workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
    } catch (error: unknown) {
      console.log(error);
      return;
    }
    if (!authenticationConfiguration || !workspaceConfiguration?.dashboardBaseUrl || !workspaceConfiguration.publicApiBaseUrl) {
      return;
    }

    if (resource?.parentResourceId && resource.resourceId) {
      return await vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(workspaceConfiguration.dashboardBaseUrl + "/"
                + resource.parentResourceId + "/" + resource.resourceId));
    }

    const productsService = this.publicApiService.createProductsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    const products = await productsService.getProducts();

    let productId: string;
    try {
      productId = await ProductInput.pickProduct(products.data);
    } catch (error: unknown) {
      console.log(error);
      return;
    }

    if (!productId) {
      return;
    }

    const configsService = this.publicApiService.createConfigsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    const configs = await configsService.getConfigs(productId);

    let configId: string;
    try {
      configId = await ConfigInput.pickConfig(configs.data);
    } catch (error: unknown) {
      console.log(error);
      return;
    }

    if (!configId) {
      return;
    }

    return await vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(workspaceConfiguration.dashboardBaseUrl + "/"
            + productId + "/" + configId));
  }

  registerProviders() {
    const newTreeView = vscode.window.createTreeView("configcat.configs", {
      treeDataProvider: this,
      showCollapseAll: true,
    });
    this.context.subscriptions.push(newTreeView);
    this.treeView = newTreeView;
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.configs.refresh",
      (resource: Resource) => {
        this.refreshCommand(resource);
      }));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.configs.add",
      async (resource: Resource) => await this.openCreatePanelCommand(resource)));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.configs.openInDashboard",
      async (resource: Resource) => await this.openInDashboardCommand(resource)));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.configs.connect",
      async (resource: Resource) => {
        await this.connectConfigCommand(resource);
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
    public override readonly label: string,
    public resourceType: ResourceType,
    public override readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public override readonly tooltip: string
  ) {
    super(label, collapsibleState);
    this.tooltip = tooltip;
    this.contextValue = resourceType;
  }
}
