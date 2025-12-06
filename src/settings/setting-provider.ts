import { ConfigModel, EvaluationVersion, ProductModel } from "configcat-publicapi-node-client";
import * as vscode from "vscode";
import { AuthenticationProvider } from "../authentication/authentication-provider";
import { handleError } from "../error-handler";
import { EnvironmentInput } from "../inputs/environment-input";
import { SettingSearchInput } from "../inputs/setting-search-input";
import { PublicApiService } from "../public-api/public-api.service";
import { CreateWebPanel } from "../webpanel/create-webpanel";
import { SettingWebPanel } from "../webpanel/setting-webpanel";
import { ConfigCatWorkspaceConfiguration } from "./workspace-configuration";
import { WorkspaceConfigurationProvider } from "./workspace-configuration-provider";

export class SettingProvider implements vscode.TreeDataProvider<Resource> {

  treeView: vscode.TreeView<Resource> | null = null;
  selectSettingAfterRefresh: string | null = null;

  constructor(private readonly context: vscode.ExtensionContext,
    private readonly authenticationProvider: AuthenticationProvider,
    private readonly publicApiService: PublicApiService,
    private readonly workspaceConfigurationProvider: WorkspaceConfigurationProvider) {
  }
  private readonly _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

  async refresh(settingId?: string): Promise<void> {
    if (settingId) {
      this.selectSettingAfterRefresh = settingId;
    }
    this.refreshSettings();
    await this.refreshHeader();
  }

  async refreshHeader(): Promise<void> {
    try {
      const publicApiConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
      const workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
      if (!publicApiConfiguration || !workspaceConfiguration?.publicApiBaseUrl || !workspaceConfiguration.configId) {
        this.setDescription("");
        return;
      }
      const configsService = this.publicApiService.createConfigsService(publicApiConfiguration, workspaceConfiguration.publicApiBaseUrl);
      const config = await configsService.getConfig(workspaceConfiguration.configId);
      this.setDescription(config.data.name || "");
    } catch (error: unknown) {
      console.log(error);
      this.setDescription("");
    }
  }

  refreshSettings(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Resource): vscode.TreeItem {
    return element;
  }

  // we have to implement a dummy getParent to user treeView.reval
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getParent(_element?: Resource): vscode.ProviderResult<Resource> {
    // eslint-disable-next-line no-undefined
    return undefined;
  }

  getChildren(element?: Resource): Thenable<Resource[]> {
    if (element) {
      this.selectSettingAfterRefresh = null;
      return Promise.resolve([]);
    }

    return Promise.all([
      this.authenticationProvider.getAuthenticationConfiguration(),
      this.workspaceConfigurationProvider.getWorkspaceConfiguration(),
    ]).then(
      values => {
        this.setMessage("");
        const statusBar = vscode.window.createStatusBarItem();
        statusBar.text = "ConfigCat - Loading Settings...";
        statusBar.show();

        const publicApiConfiguration = values[0];
        const workspaceConfiguration = values[1];
        if (!publicApiConfiguration || !workspaceConfiguration?.publicApiBaseUrl || !workspaceConfiguration.configId) {
          statusBar.hide();
          this.selectSettingAfterRefresh = null;
          return [];
        }

        const settingsService = this.publicApiService.createSettingsService(publicApiConfiguration, workspaceConfiguration.publicApiBaseUrl);
        return settingsService.getSettings(workspaceConfiguration.configId).then(settings => {
          const items = settings.data.map((s) => new Resource(String(s.settingId), s.key ?? "",
            s.name ?? "", s.hint ?? "",
            vscode.TreeItemCollapsibleState.None));
          statusBar.hide();
          if (this.selectSettingAfterRefresh) {
            const selectedResource = items.find(resource => resource?.resourceId === this.selectSettingAfterRefresh);
            if (selectedResource) {
              this.treeView?.reveal(selectedResource, { select: true, focus: true, expand: false });
            }
            this.selectSettingAfterRefresh = null;
          }
          return items;
        }, (error: unknown) => {
          void handleError("Could not load Settings.", error as Error);
          statusBar.hide();
          this.setMessage("Could not load Settings.");
          this.selectSettingAfterRefresh = null;
          return [];
        });
      },
      () => {
        this.selectSettingAfterRefresh = null;
        return [];
      });
  }

  async openInDashboard() {
    let workspaceConfiguration: ConfigCatWorkspaceConfiguration | null;
    try {
      workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
    } catch (error: unknown) {
      console.log(error);
      return;
    }

    if (!workspaceConfiguration?.dashboardBaseUrl || !workspaceConfiguration.configId || !workspaceConfiguration.productId) {
      return;
    }

    return await vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(workspaceConfiguration.dashboardBaseUrl + "/"
            + workspaceConfiguration.productId + "/" + workspaceConfiguration.configId));
  }

  async openCreatePanel() {
    let authenticationConfiguration = null;
    let workspaceConfiguration = null;
    try {
      authenticationConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
      workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
    } catch (error: unknown) {
      console.log(error);
      return;
    }
    if (!authenticationConfiguration
            || !workspaceConfiguration?.publicApiBaseUrl
            || !workspaceConfiguration.configId
            || !workspaceConfiguration.productId) {
      return;
    }

    const configsService = this.publicApiService.createConfigsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    let configModel: ConfigModel | undefined;
    try {
      configModel = (await configsService.getConfig(workspaceConfiguration.configId)).data;
    } catch (error: unknown) {
      console.log(error);
      return;
    }

    const productService = this.publicApiService.createProductsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    let productModel: ProductModel | undefined;
    try {
      productModel = (await productService.getProduct(workspaceConfiguration.productId)).data;
    } catch (error: unknown) {
      console.log(error);
      return;
    }
    return new CreateWebPanel(this.context, authenticationConfiguration, workspaceConfiguration, productModel.name, configModel.name);
  }

  async searchSettings() {
    let authenticationConfiguration = null;
    let workspaceConfiguration = null;
    try {
      authenticationConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
      workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
    } catch (error: unknown) {
      console.log(error);
      return;
    }
    if (!authenticationConfiguration
            || !workspaceConfiguration?.publicApiBaseUrl
            || !workspaceConfiguration.configId
            || !workspaceConfiguration.productId) {
      return;
    }

    const settingsService = this.publicApiService.createSettingsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    const settings = await settingsService.getSettings(workspaceConfiguration.configId);

    let settingId: number;
    try {
      settingId = await SettingSearchInput.searchSettings(settings.data);
    } catch (error: unknown) {
      console.log(error);
      return;
    }

    if (!settingId) {
      return;
    }

    vscode.commands.executeCommand("configcat.settings.refresh", "" + settingId);

  }

  async openSettingPanel(resource: Resource) {
    if (!resource) {
      return;
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
    if (!authenticationConfiguration
            || !workspaceConfiguration?.publicApiBaseUrl
            || !workspaceConfiguration.configId
            || !workspaceConfiguration.productId) {
      return;
    }

    const environmentsService = this.publicApiService.createEnvironmentsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    const environments = await environmentsService.getEnvironments(workspaceConfiguration.productId);

    let environmentId: string;
    try {
      environmentId = await EnvironmentInput.pickEnvironment(environments.data);
    } catch (error: unknown) {
      console.log(error);
      return;
    }

    if (!environmentId) {
      return;
    }

    const environmentName = environments.data.find(e => e.environmentId === environmentId)?.name;

    const configsService = this.publicApiService.createConfigsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    let configModel: ConfigModel | undefined;
    try {
      configModel = (await configsService.getConfig(workspaceConfiguration.configId)).data;
    } catch (error: unknown) {
      console.log(error);
      return;
    }
    const evaluationVersion = configModel?.evaluationVersion ? configModel?.evaluationVersion : EvaluationVersion.V1;
    return new SettingWebPanel(this.context, authenticationConfiguration, workspaceConfiguration, environmentId, environmentName || "", +resource.resourceId, resource.key, evaluationVersion);
  }

  setMessage(message: string) {
    if (!this.treeView) {
      return;
    }
    this.treeView.message = message;
  }

  setDescription(description: string) {
    if (!this.treeView) {
      return;
    }
    if (description) {
      this.treeView.title = description;
      this.treeView.description = "FEATURE FLAGS & SETTINGS";
    } else {
      this.treeView.title = "FEATURE FLAGS & SETTINGS";
      this.treeView.description = "";
    }
  }

  async registerProviders(): Promise<void> {
    this.treeView = vscode.window.createTreeView("configcat.settings", {
      treeDataProvider: this,
      showCollapseAll: true,
    });
    this.context.subscriptions.push(this.treeView);
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.refresh",
      async (selectedFlagKey: string) => {
        await this.refresh(selectedFlagKey);
      }));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.openInDashboard",
      async () => await this.openInDashboard()));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.copyToClipboard",
      (resource: Resource) => vscode.env.clipboard.writeText(resource.key)));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.findUsages",
      (resource: Resource) => vscode.commands.executeCommand("search.action.openNewEditor", { query: resource.label })));

    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.values",
      (resource: Resource) => this.openSettingPanel(resource)));

    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.add",
      async () => this.openCreatePanel()));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.search",
      async () => this.searchSettings()));
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

    await this.refreshHeader();
  }
}

class Resource extends vscode.TreeItem {
  constructor(
    public resourceId: string,
    public readonly key: string,
    public readonly name: string,
    public readonly hint: string,
    public override readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(key, collapsibleState);
    this.description = name;
    this.tooltip = hint;
    this.contextValue = "Setting";
  }
}
