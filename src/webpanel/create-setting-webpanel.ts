import * as path from "path";
import * as vscode from "vscode";
import { AuthenticationProvider } from "../authentication/authentication-provider";
import { ConfigCatWorkspaceConfiguration } from "../configuration/workspace-configuration";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { SettingProvider } from "../settings/setting-provider";
import { WebPanel } from "./webpanel";

/**
 * Manages webview panels
 */
export class CreateSettingWebPanel extends WebPanel {

  constructor(context: vscode.ExtensionContext,
    publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    productName: string, configName: string, readonly settingProvider: SettingProvider,
    private readonly authenticationProvider: AuthenticationProvider) {
    super(context);

    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, "Create Feature Flag", vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "dist"))],
    });
    this.panel.iconPath = {
      light: vscode.Uri.file(path.join(context.extensionPath, "resources", "light", "cat.svg")),
      dark: vscode.Uri.file(path.join(context.extensionPath, "resources", "dark", "cat.svg")),
    };

    const appData = {
      publicApiBaseUrl: workspaceConfiguration.publicApiBaseUrl,
      basicAuthUsername: publicApiConfiguration.basicAuthUsername,
      basicAuthPassword: publicApiConfiguration.basicAuthPassword,
      dashboardBasePath: workspaceConfiguration.dashboardBaseUrl,
      productId: workspaceConfiguration.productId,
      productName: productName,
      configId: workspaceConfiguration.configId,
      configName: configName,
      environmentId: "",
      settingId: 0,
      evaluationVersion: "",
      isAuthorized: publicApiConfiguration.basicAuthUsername !== "" && publicApiConfiguration.basicAuthPassword !== "",
    };
    this.panel.webview.html = this.getHtmlForWebview(appData, "createfeatureflag");
    this.panel.webview.options = this.getWebviewOptions();

    this.panel.webview.onDidReceiveMessage(
      this.listenWebViewCreateMessage,
      null,
      context.subscriptions
    );

    context.subscriptions.push(this.panel);
  }

  listenWebViewCreateMessage = async (event: { command: string; settingId?: number; error?: { message?: string; status?: number } }): Promise<boolean> => {
    if (event.command === "configcat-ff-create-success") {
      vscode.window.showInformationMessage("Feature Flag succesfully created!");
      if (event.settingId) {
        this.settingProvider.setSelectedSetting("" + event.settingId);
        await this.settingProvider.refresh();
        await this.settingProvider.openSettingPanel(event.settingId);
      } else {
        await this.settingProvider.refresh();
      }
      this.panel?.dispose();
      return true;
    } else if (event.command === "configcat-ff-create-failed") {
      vscode.window.showErrorMessage("Could not create Feature Flag.");
      if (!event.error) {
        console.log(event);
      } else {
        console.log(event.error);
        if (event.error.status === 401) {
          await this.authenticationProvider.logout();
          this.panel?.dispose();
        }
      }
      return false;
    } else {
      console.log(event);
      return false;
    }
  };

}
