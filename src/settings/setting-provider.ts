import { ConfigModel, CreateSettingInitialValues, EvaluationVersion } from "configcat-publicapi-node-client";
import * as vscode from "vscode";
import { AuthenticationProvider } from "../authentication/authentication-provider";
import { handleError } from "../error-handler";
import { EnvironmentInput } from "../inputs/environment-input";
import { SettingInput } from "../inputs/setting-input";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { PublicApiService } from "../public-api/public-api.service";
import { WebPanel } from "../webpanel/webpanel";
import { ConfigCatWorkspaceConfiguration } from "./workspace-configuration";
import { WorkspaceConfigurationProvider } from "./workspace-configuration-provider";

export class SettingProvider implements vscode.TreeDataProvider<Resource> {

  treeView: vscode.TreeView<Resource> | null = null;

  constructor(private readonly context: vscode.ExtensionContext,
    private readonly authenticationProvider: AuthenticationProvider,
    private readonly publicApiService: PublicApiService,
    private readonly workspaceConfigurationProvider: WorkspaceConfigurationProvider) {
  }
  private readonly _onDidChangeTreeData: vscode.EventEmitter<Resource | undefined | void> = new vscode.EventEmitter<Resource | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Resource | undefined | void> = this._onDidChangeTreeData.event;

  async refresh(): Promise<void> {
    this.refreshSettings();
    await this.refreshHeader();
  }

  async refreshHeader(): Promise<void> {
    try {
      const publicApiConfiguration = await this.authenticationProvider.getAuthenticationConfiguration();
      const workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
      if (!publicApiConfiguration || !workspaceConfiguration?.publicApiBaseUrl || !workspaceConfiguration.configId) {
        this.setDescription(undefined);
        return;
      }
      const configsService = this.publicApiService.createConfigsService(publicApiConfiguration, workspaceConfiguration.publicApiBaseUrl);
      const config = await configsService.getConfig(workspaceConfiguration.configId);
      this.setDescription(config.data.name || "");
    } catch (error) {
      this.setDescription(undefined);
    }
  }

  refreshSettings(): void {
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
      this.workspaceConfigurationProvider.getWorkspaceConfiguration(),
    ]).then(
      values => {
        this.setMessage(undefined);
        const statusBar = vscode.window.createStatusBarItem();
        statusBar.text = "ConfigCat - Loading Settings...";
        statusBar.show();

        const publicApiConfiguration = values[0];
        const workspaceConfiguration = values[1];
        if (!publicApiConfiguration || !workspaceConfiguration?.publicApiBaseUrl || !workspaceConfiguration.configId) {
          statusBar.hide();
          return [];
        }

        const settingsService = this.publicApiService.createSettingsService(publicApiConfiguration, workspaceConfiguration.publicApiBaseUrl);
        return settingsService.getSettings(workspaceConfiguration.configId).then(settings => {
          const items = settings.data.map((s) => new Resource(String(s.settingId), s.key ?? "",
            s.name ?? "", s.hint ?? "",
            vscode.TreeItemCollapsibleState.None));
          statusBar.hide();
          return items;
        }, (error) => {
          handleError("Could not load Settings.", error);
          statusBar.hide();
          this.setMessage("Could not load Settings.");
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

    if (!publicApiConfiguration || !workspaceConfiguration?.publicApiBaseUrl || !workspaceConfiguration.configId) {
      return;
    }

    let setting: CreateSettingInitialValues;
    try {
      setting = await SettingInput.settingInput();
    } catch (error) {
      return;
    }
    if (!setting) {
      return;
    }

    const statusBar = vscode.window.createStatusBarItem();
    statusBar.text = "ConfigCat - Creating Feature Flag...";
    statusBar.show();

    const settingsService = new PublicApiService().createSettingsService(publicApiConfiguration, workspaceConfiguration.publicApiBaseUrl);
    try {
      await settingsService.createSetting(workspaceConfiguration.configId, setting);
      this.refreshSettings();
      statusBar.hide();
    } catch (error) {
      handleError("Could not create Feature Flag.", error);
      statusBar.hide();
    }
  }

  async openInDashboard() {
    let workspaceConfiguration: ConfigCatWorkspaceConfiguration | null;
    try {
      workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
    } catch (error) {
      return;
    }

    if (!workspaceConfiguration?.dashboardBaseUrl || !workspaceConfiguration.configId || !workspaceConfiguration.productId) {
      return;
    }

    return await vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(workspaceConfiguration.dashboardBaseUrl + "/"
            + workspaceConfiguration.productId + "/" + workspaceConfiguration.configId));
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
    } catch (error) {
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
    } catch (error) {
      return;
    }

    if (!environmentId) {
      return;
    }

    const environmentName = environments.data.filter(e => e.environmentId === environmentId)[0].name;

    const configsService = this.publicApiService.createConfigsService(authenticationConfiguration, workspaceConfiguration.publicApiBaseUrl);
    let configModel: ConfigModel | undefined;
    try {
      configModel = (await configsService.getConfig(workspaceConfiguration.configId)).data;
    } catch (error) {
      return;
    }
    const evaluationVersion = configModel?.evaluationVersion ? configModel?.evaluationVersion : EvaluationVersion.V1;
    new WebPanel(this.context, authenticationConfiguration, workspaceConfiguration, environmentId, environmentName || "", +resource.resourceId, resource.key, evaluationVersion);
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
    if (description) {
      this.treeView.title = description;
      this.treeView.description = "FEATURE FLAGS & SETTINGS";
    } else {
      this.treeView.title = "FEATURE FLAGS & SETTINGS";
      this.treeView.description = undefined;
    }
  }

  async registerProviders(): Promise<void> {
    this.treeView = vscode.window.createTreeView("configcat.settings", {
      treeDataProvider: this,
      showCollapseAll: true,
    });
    this.context.subscriptions.push(this.treeView);
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.refresh",
      async () => await this.refresh()));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.openInDashboard",
      async () => await this.openInDashboard()));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.copyToClipboard",
      (resource: Resource) => vscode.env.clipboard.writeText(resource.key)));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.findUsages",
      (resource: Resource) => vscode.commands.executeCommand("search.action.openNewEditor", { query: resource.label })));

    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.values",
      (resource: Resource) => this.openSettingPanel(resource)));

    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.settings.add",
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

    await this.refreshHeader();
  }
}

class Resource extends vscode.TreeItem {
  constructor(
    public resourceId: string,
    public readonly key: string,
    public readonly name: string,
    public readonly hint: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(key, collapsibleState);
    super.description = name;
    super.tooltip = hint;
    super.contextValue = "Setting";
  }
}
