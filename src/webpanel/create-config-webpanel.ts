import { ProductModel } from "configcat-publicapi-node-client";
import * as path from "path";
import * as vscode from "vscode";
import { AuthenticationProvider } from "../authentication/authentication-provider";
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
    productModel: ProductModel, private readonly configProvider: ConfigProvider,
    private readonly authenticationProvider: AuthenticationProvider) {
    super(context);
    this.productModel = productModel;

    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, "Create Config", vscode.ViewColumn.One, {
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

  listenWebViewCreateMessage = async (event: { command: string; configId: number; error?: { message?: string; status?: number } }): Promise<boolean> => {
    if (event.command === "configcat-config-create-success") {
      vscode.window.showInformationMessage("Config succesfully created!");
      const configId = "" + event.configId;
      this.configProvider.setSelectedConfig(configId);
      await this.configProvider.connectConfig(this.productModel.productId, configId);
      this.panel?.dispose();
      return true;
    } else if (event.command === "configcat-config-create-failed") {
      vscode.window.showErrorMessage("Could not create Config.");
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
