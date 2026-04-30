import * as path from "path";
import * as vscode from "vscode";
import { AuthenticationProvider } from "../authentication/authentication-provider";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { ConfigCatWorkspaceConfiguration } from "../settings/workspace-configuration";
import { WebPanel } from "./webpanel";

interface AuthorizationWebViewMessage {
  command: string;
  authorizationParameters?: PublicApiConfiguration | null;
}

/**
 * Manages authorization webview panel.
 */
export class AuthorizationWebPanel extends WebPanel {
  constructor(
    context: vscode.ExtensionContext,
    publicApiConfiguration: PublicApiConfiguration,
    workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    isAuthorized: boolean,
    private readonly authenticationProvider: AuthenticationProvider
  ) {
    super(context);

    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, "Authorization", vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "dist"))],
    });

    const appData = {
      publicApiBaseUrl: workspaceConfiguration.publicApiBaseUrl,
      basicAuthUsername: publicApiConfiguration.basicAuthUsername,
      basicAuthPassword: publicApiConfiguration.basicAuthPassword,
      dashboardBasePath: workspaceConfiguration.dashboardBaseUrl,
      isAuthorized: isAuthorized,
      productId: "",
      productName: "",
      configId: "",
      configName: "",
      environmentId: "",
      settingId: 0,
      evaluationVersion: "",
    };

    this.panel.webview.html = this.getHtmlForWebview(appData, "authorization");
    this.panel.webview.options = this.getWebviewOptions();

    this.panel.webview.onDidReceiveMessage(this.listenWebViewAuthorizationMessage, null, context.subscriptions);

    context.subscriptions.push(this.panel);
  }

  listenWebViewAuthorizationMessage = (event: AuthorizationWebViewMessage): Promise<boolean> => {
    if (event.command === "configcat-login-success" && event.authorizationParameters) {
      this.authenticationProvider.authenticate(event.authorizationParameters).then(() => {
        this.panel?.dispose();
        return true;
      }).catch(() => {
        this.panel?.dispose();
        return true;
      });
    }

    if (event.command === "configcat-logout-success") {
      this.authenticationProvider
        .logout()
        .then(() => {
          this.panel?.dispose();
          return true;
        })
        .catch(() => {
          this.panel?.dispose();
          return true;
        });
    }

    console.log(event);
    return Promise.resolve(false);
  };
}
