import { EvaluationVersion } from "configcat-publicapi-node-client";
import * as path from "path";
import * as vscode from "vscode";
import { ConfigCatWorkspaceConfiguration } from "../configuration/workspace-configuration";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { SettingProvider } from "../settings/setting-provider";
import { WebPanel } from "./webpanel";

/**
 * Manages webview panels
 */
export class SettingWebPanel extends WebPanel {

  constructor(context: vscode.ExtensionContext,
    publicApiConfiguration: PublicApiConfiguration,
    workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    environmentId: string,
    environmentName: string,
    settingId: number,
    settingName: string,
    evaluationVersion: EvaluationVersion,
    readonly settingProvider: SettingProvider) {

    super(context);

    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, settingName + " (" + environmentName + ")", vscode.ViewColumn.One, {
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
      productName: "",
      configId: workspaceConfiguration.configId,
      configName: "",
      environmentId: environmentId,
      settingId: settingId,
      evaluationVersion: evaluationVersion,
      isAuthorized: publicApiConfiguration.basicAuthUsername !== "" && publicApiConfiguration.basicAuthPassword !== "",
    };

    this.panel.webview.html = this.getHtmlForWebview(appData, "featureflagsetting");
    this.panel.webview.options = this.getWebviewOptions();

    this.panel.webview.onDidReceiveMessage(
      this.listenWebViewSettingsMessage,
      null,
      context.subscriptions
    );

    context.subscriptions.push(this.panel);

  }

  listenWebViewSettingsMessage = async (event: { command: string }): Promise<boolean> => {
    if (event.command === "configcat-ff-save-failed") {
      await this.settingProvider.refresh();
      this.panel?.dispose();
      return true;
    } else {
      console.log(event);
      return false;
    }
  };

}
