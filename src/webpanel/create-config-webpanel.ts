import * as path from "path";
import * as vscode from "vscode";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { ConfigCatWorkspaceConfiguration } from "../settings/workspace-configuration";
import { WebPanel } from "./webpanel";

/**
 * Manages webview panels
 */
export class CreateConfigWebPanel extends WebPanel {

  constructor(context: vscode.ExtensionContext,
    publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    productName: string) {
    super(context);

    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, "Create Config", vscode.ViewColumn.One, {
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
      configId: "",
      configName: "",
      environmentId: "",
      settingId: 0,
      evaluationVersion: "",
    };
    this.panel.webview.html = this.getHtmlForWebview(appData, "createconfig");

    this.panel.webview.onDidReceiveMessage(
      this.listenWebViewCreateMessage,
      null,
      context.subscriptions
    );

    context.subscriptions.push(this.panel);
  }

  listenWebViewCreateMessage = (event: { command: string; configId: number }): boolean => {
    if (event.command === "configcat-config-create-success") {
      vscode.window.showInformationMessage("Config succesfully created!");
      vscode.commands.executeCommand("configcat.configs.refresh", "" + event.configId);
      this.panel?.dispose();
      return true;
    } else {
      console.log(event);
      return false;
    }
  };

}
