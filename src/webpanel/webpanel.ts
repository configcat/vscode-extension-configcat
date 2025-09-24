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
    environmentId: string, environmentName: string, settingId: number, settingKey: string, evaluationVersion: EvaluationVersion) {

    this.extensionUri = context.extensionUri;

    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, settingKey + " (" + environmentName + ")", vscode.ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "out", "dist"))],
    });
    this.panel.webview.html = this.getHtmlForWebview(publicApiConfiguration, workspaceConfiguration, environmentId, settingId, evaluationVersion);
    context.subscriptions.push(
      vscode.window.onDidChangeActiveColorTheme(async colorTheme => {
        const configCatTheme = this.getConfigCatTheme(colorTheme);
        await this.panel.webview.postMessage({ command: "themeChange", value: configCatTheme });
      })
    );
    context.subscriptions.push(this.panel);
  }

  /**
     * Returns html of the start page (index.html)
     */
  private getHtmlForWebview(publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
    environmentId: string, settingId: number, evaluationVersion: EvaluationVersion) {
    // path to dist folder
    const appDistPath = vscode.Uri.joinPath(this.extensionUri, "out", "dist");

    // path as uri
    const baseUri = this.panel.webview.asWebviewUri(appDistPath);

    // get path to index.html file from dist folder
    const indexPath = vscode.Uri.joinPath(appDistPath, "index.html");

    // read index file from file system
    let indexHtml = fs.readFileSync(indexPath.fsPath, { encoding: "utf8" });
    indexHtml = indexHtml.replace('<base href="/">', `<base href="${baseUri.toString()}/">`);

    const vsCodeTheme = this.getConfigCatTheme(vscode.window.activeColorTheme);
    // update the base URI tag
    const config = {
      publicApiBaseUrl: workspaceConfiguration.publicApiBaseUrl,
      basicAuthUsername: publicApiConfiguration.basicAuthUsername,
      basicAuthPassword: publicApiConfiguration.basicAuthPassword,
      dashboardBasePath: workspaceConfiguration.dashboardBaseUrl,
      productId: workspaceConfiguration.productId,
      configId: workspaceConfiguration.configId,
      environmentId: environmentId,
      settingId: settingId,
      evaluationVersion: evaluationVersion,
      vsCodeTheme: vsCodeTheme,
    };
    indexHtml = indexHtml.replace("window.CONFIGCAT_APPDATA = {};", "window.CONFIGCAT_APPDATA = " + JSON.stringify(config) + ";");

    return indexHtml;
  }

  private getConfigCatTheme(vsCodeColorTheme: vscode.ColorTheme): string {
    const vsCodeThemeKind = vsCodeColorTheme.kind.valueOf();
    return vsCodeThemeKind === 1 || vsCodeThemeKind === 4 ? "light" : "dark";
  }
}
