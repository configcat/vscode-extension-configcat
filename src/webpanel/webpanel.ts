import * as fs from "fs";
import * as vscode from "vscode";

export class AppData {
  public publicApiBaseUrl = "";
  public basicAuthUsername = "";
  public basicAuthPassword = "";
  public dashboardBasePath = "";

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
  getHtmlForWebview(appData: AppData, view: string): string {
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
    indexHtml = indexHtml.replace("window.CONFIGCAT_APP_VIEW = {};", "window.CONFIGCAT_APP_VIEW = " + JSON.stringify({ view: view }) + ";");

    return indexHtml;
  }

  /**
  * Returns the webview options.
  */
  getWebviewOptions(): vscode.WebviewOptions {
    // path to dist folder
    const appDistPath = vscode.Uri.joinPath(this.extensionUri, "out", "dist");

    return {
    // Enable javascript in the webview
      enableScripts: true,

      // And restrict the webview to only loading content from our extension's directory.
      localResourceRoots: [appDistPath, vscode.Uri.joinPath(appDistPath, "assets")],
    };
  }

  private getConfigCatTheme(vsCodeColorTheme: vscode.ColorTheme): string {
    const vsCodeThemeKind = vsCodeColorTheme.kind.valueOf();
    return vsCodeThemeKind === 1 || vsCodeThemeKind === 4 ? "light" : "dark";
  }
}
