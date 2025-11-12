import * as path from "path";
import * as vscode from "vscode";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { ConfigCatWorkspaceConfiguration } from "../settings/workspace-configuration";
import { WebPanel } from "./webpanel";

/**
 * Manages webview panels
 */
export class CreateWebPanel extends WebPanel {

  constructor(context: vscode.ExtensionContext,
    publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    productName: string, configName: string) {
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
      isCreate: true,
      productId: workspaceConfiguration.productId,
      productName: productName,
      configId: workspaceConfiguration.configId,
      configName: configName,
      environmentId: "",
      settingId: 0,
      evaluationVersion: "",
    };
    this.panel.webview.html = this.getHtmlForWebview(appData);

    this.panel.webview.onDidReceiveMessage(
      this.listenWebViewCreateMessage,
      null,
      context.subscriptions
    );

    context.subscriptions.push(this.panel);
  }

  listenWebViewCreateMessage = (event: { command: string; text: string }): boolean => {
    console.log(event);
    if (event.command === "configcat-ff-create" && event.text === "success") {
      vscode.commands.executeCommand("configcat.settings.refresh");
      vscode.window.showInformationMessage("Successfull feature flag creation!");
      this.panel?.dispose();
    }
    return true;
  };

}
