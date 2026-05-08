import * as path from "path";
import * as vscode from "vscode";
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
    productName: string, configName: string, readonly settingProvider: SettingProvider) {
    super(context);

    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, "Create Feature Flag", vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "dist"))],
    });

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

  listenWebViewCreateMessage = async (event: { command: string; settingId: number }): Promise<boolean> => {
    if (event.command === "configcat-ff-create-success") {
      vscode.window.showInformationMessage("Feature Flag succesfully created!");
      this.settingProvider.setSelectedSetting("" + event.settingId);
      await this.settingProvider.refresh();
      await this.settingProvider.openSettingPanel(event.settingId);
      this.panel?.dispose();
      return true;
    } else {
      console.log(event);
      return false;
    }
  };

}
