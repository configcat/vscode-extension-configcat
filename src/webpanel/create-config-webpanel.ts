import { ProductModel } from "configcat-publicapi-node-client";
import * as path from "path";
import * as vscode from "vscode";
import { ConfigProvider } from "../configs/config-provider";
import { ConfigCatWorkspaceConfiguration } from "../configuration/workspace-configuration";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { WebPanel } from "./webpanel";

/**
 * Manages webview panels
 */
export class CreateConfigWebPanel extends WebPanel {

  private readonly productModel: ProductModel;

  constructor(context: vscode.ExtensionContext,
    publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    productModel: ProductModel, private readonly configProvider: ConfigProvider) {
    super(context);
    this.productModel = productModel;

    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, "Create Config", vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "dist"))],
    });

    const appData = {
      publicApiBaseUrl: workspaceConfiguration.publicApiBaseUrl,
      basicAuthUsername: publicApiConfiguration.basicAuthUsername,
      basicAuthPassword: publicApiConfiguration.basicAuthPassword,
      dashboardBasePath: workspaceConfiguration.dashboardBaseUrl,
      productId: productModel.productId,
      productName: productModel.name,
      configId: "",
      configName: "",
      environmentId: "",
      settingId: 0,
      evaluationVersion: "",
      isAuthorized: publicApiConfiguration.basicAuthUsername !== "" && publicApiConfiguration.basicAuthPassword !== "",
    };
    this.panel.webview.html = this.getHtmlForWebview(appData, "createconfig");
    this.panel.webview.options = this.getWebviewOptions();

    this.panel.webview.onDidReceiveMessage(
      this.listenWebViewCreateMessage,
      null,
      context.subscriptions
    );

    context.subscriptions.push(this.panel);
  }

  listenWebViewCreateMessage = async (event: { command: string; configId: number }): Promise<boolean> => {
    if (event.command === "configcat-config-create-success") {
      vscode.window.showInformationMessage("Config succesfully created!");
      const configId = "" + event.configId;
      this.configProvider.setSelectedConfig(configId);
      await this.configProvider.connectConfig(this.productModel.productId, configId);
      this.panel?.dispose();
      return true;
    } else {
      console.log(event);
      return false;
    }
  };

}
