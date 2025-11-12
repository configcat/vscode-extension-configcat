import * as fs from "fs";
import * as vscode from "vscode";

export class AppData {
  public publicApiBaseUrl = "";
  public basicAuthUsername = "";
  public basicAuthPassword = "";
  public dashboardBasePath = "";

  isCreate = false;

  productId = "";
  productName = "";
  configId = "";
  configName = "";
  environmentId = "";
  settingId = 0;
  evaluationVersion = "";
}

/**
 * Manages webview panels
 */
export abstract class WebPanel {
  /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
  public static readonly currentPanel: WebPanel | undefined;

  static readonly viewType = "angular";

  panel: vscode.WebviewPanel | undefined;
  readonly extensionUri: vscode.Uri;

  constructor(private readonly context: vscode.ExtensionContext) {

    this.extensionUri = context.extensionUri;

    context.subscriptions.push(
      vscode.window.onDidChangeActiveColorTheme(async colorTheme => {
        const configCatTheme = this.getConfigCatTheme(colorTheme);
        await this.panel!.webview.postMessage({ command: "themeChange", value: configCatTheme });
      })
    );
  }

  /**
     * Returns html of the start page (index.html)
     */
  getHtmlForWebview(appData: AppData): string {
    // path to dist folder
    const appDistPath = vscode.Uri.joinPath(this.extensionUri, "out", "dist");

    // path as uri
    const baseUri = this.panel!.webview.asWebviewUri(appDistPath);

    // get path to index.html file from dist folder
    const indexPath = vscode.Uri.joinPath(appDistPath, "index.html");

    // read index file from file system
    let indexHtml = fs.readFileSync(indexPath.fsPath, { encoding: "utf8" });
    indexHtml = indexHtml.replace('<base href="/">', `<base href="${baseUri.toString()}/">`);

    // update the base URI tag
    indexHtml = indexHtml.replace("window.CONFIGCAT_APPDATA = {};", "window.CONFIGCAT_APPDATA = " + JSON.stringify(appData) + ";");

    return indexHtml;
  }

  private getConfigCatTheme(vsCodeColorTheme: vscode.ColorTheme): string {
    const vsCodeThemeKind = vsCodeColorTheme.kind.valueOf();
    return vsCodeThemeKind === 1 || vsCodeThemeKind === 4 ? "light" : "dark";
  }
}
