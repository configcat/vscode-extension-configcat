import { EvaluationVersion } from "configcat-publicapi-node-client";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { ConfigCatWorkspaceConfiguration } from "../settings/workspace-configuration";

/**
 * Manages webview panels
 */
export class WebPanel {
  /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
  public static readonly currentPanel: WebPanel | undefined;

  private static readonly viewType = "angular";

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;

  constructor(private readonly context: vscode.ExtensionContext,
    publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    environmentId: string, environmentName: string, settingId: number, settingKey: string, evaluationVersion: EvaluationVersion, isCreate: boolean) {

    this.extensionUri = context.extensionUri;

    // TODO title should be different for create
    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, settingKey + " (" + environmentName + ")", vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "dist"))],
    });

    this.panel.webview.html = this.getHtmlForWebview(publicApiConfiguration, workspaceConfiguration, environmentId, settingId, evaluationVersion, isCreate);

    this.panel.webview.onDidReceiveMessage(
      this.listenWebViewCreateMessage,
      null,
      context.subscriptions
    );
    // TODO if isCreate the  this.panel.webview.onDidReceiveMessage and call success
    // TODO call refresh on setting view?   this.context.subscriptions.push(vscode.commands.executeCommand("configcat.settings.refresh") ??
    // TODO call await vscode.window.showInformationMessage("Logged in to ConfigCat. Email: " + me.data.email);
    context.subscriptions.push(
      vscode.window.onDidChangeActiveColorTheme(async colorTheme => {
        const configCatTheme = this.getConfigCatTheme(colorTheme);
        await this.panel.webview.postMessage({ command: "themeChange", value: configCatTheme });
      })
    );
    context.subscriptions.push(this.panel);
  }

  listenWebViewCreateMessage = (event: { command: string; text: string }): boolean => {
    console.log(event);
    if (event.command === "configcat-ff-create" && event.text === "success") {
      vscode.commands.executeCommand("configcat.settings.refresh");
      vscode.window.showInformationMessage("Successfull feature flag creation!");
    }
    return true;
  };

  /**
     * Returns html of the start page (index.html)
     */
  private getHtmlForWebview(publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    environmentId: string, settingId: number, evaluationVersion: EvaluationVersion, isCreate: boolean) {
    // path to dist folder
    const appDistPath = vscode.Uri.joinPath(this.extensionUri, "out", "dist");

    // path as uri
    const baseUri = this.panel.webview.asWebviewUri(appDistPath);

    // get path to index.html file from dist folder
    const indexPath = vscode.Uri.joinPath(appDistPath, "index.html");

    // read index file from file system
    let indexHtml = fs.readFileSync(indexPath.fsPath, { encoding: "utf8" });
    indexHtml = indexHtml.replace('<base href="/">', `<base href="${baseUri.toString()}/">`);

    // update the base URI tag
    const config = {
      publicApiBaseUrl: workspaceConfiguration.publicApiBaseUrl,
      basicAuthUsername: publicApiConfiguration.basicAuthUsername,
      basicAuthPassword: publicApiConfiguration.basicAuthPassword,
      dashboardBasePath: workspaceConfiguration.dashboardBaseUrl,
      isCreate: isCreate,
      productId: workspaceConfiguration.productId,
      configId: workspaceConfiguration.configId,
      environmentId: environmentId,
      settingId: settingId,
      evaluationVersion: evaluationVersion,
    };
    indexHtml = indexHtml.replace("window.CONFIGCAT_APPDATA = {};", "window.CONFIGCAT_APPDATA = " + JSON.stringify(config) + ";");

    return indexHtml;
  }

  private getConfigCatTheme(vsCodeColorTheme: vscode.ColorTheme): string {
    const vsCodeThemeKind = vsCodeColorTheme.kind.valueOf();
    return vsCodeThemeKind === 1 || vsCodeThemeKind === 4 ? "light" : "dark";
  }
}
