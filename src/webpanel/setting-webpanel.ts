import { EvaluationVersion } from "configcat-publicapi-node-client";
import * as path from "path";
import * as vscode from "vscode";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { ConfigCatWorkspaceConfiguration } from "../settings/workspace-configuration";
import { WebPanel } from "./webpanel";

/**
 * Manages webview panels
 */
export class SettingWebPanel extends WebPanel {

  constructor(context: vscode.ExtensionContext,
    publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    environmentId: string, environmentName: string, settingId: number, settingKey: string, evaluationVersion: EvaluationVersion) {

    super(context);

    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, settingKey + " (" + environmentName + ")", vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "dist"))],
    });

    const appData = {
      publicApiBaseUrl: workspaceConfiguration.publicApiBaseUrl,
      basicAuthUsername: publicApiConfiguration.basicAuthUsername,
      basicAuthPassword: publicApiConfiguration.basicAuthPassword,
      dashboardBasePath: workspaceConfiguration.dashboardBaseUrl,
      isCreate: false,
      productId: workspaceConfiguration.productId,
      productName: "",
      configId: workspaceConfiguration.configId,
      configName: "",
      environmentId: environmentId,
      settingId: settingId,
      evaluationVersion: evaluationVersion,
    };

    this.panel.webview.html = this.getHtmlForWebview(appData, "featureflagsetting");

    this.panel.webview.onDidReceiveMessage(
      this.listenWebViewSettingsMessage,
      null,
      context.subscriptions
    );

    context.subscriptions.push(this.panel);

  }

  listenWebViewSettingsMessage = (event: { command: string }): boolean => {
    if (event.command === "configcat-ff-save-failed") {
      vscode.commands.executeCommand("configcat.settings.refresh");
      this.panel?.dispose();
      return true;
    } else {
      console.log(event);
      return false;
    }
  };

}
