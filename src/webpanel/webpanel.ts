import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { PublicApiConfiguration } from '../public-api/public-api-configuration';
import { ConfigCatWorkspaceConfiguration } from '../settings/workspace-configuration';

/**
 * Manages webview panels
 */
export class WebPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: WebPanel | undefined;

    private static readonly viewType = 'angular';

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionPath: string;
    private readonly builtAppFolder: string;

    constructor(private context: vscode.ExtensionContext,
        publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
        environmentId: string, environmentName: string, settingId: number, settingKey: string) {

        this.extensionPath = context.extensionPath;
        this.builtAppFolder = 'out\\dist';

        this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, settingKey + ' (' + environmentName + ')', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, this.builtAppFolder))]
        });
        this.panel.webview.html = this._getHtmlForWebview(publicApiConfiguration, workspaceConfiguration, environmentId, settingId);
        context.subscriptions.push(this.panel);
    }

    /**
     * Returns html of the start page (index.html)
     */
    private _getHtmlForWebview(publicApiConfiguration: PublicApiConfiguration, workspaceConfiguration: ConfigCatWorkspaceConfiguration,
        environmentId: string, settingId: number) {
        // path to dist folder
        const appDistPath = path.join(this.extensionPath, 'out', 'dist');
        const appDistPathUri = vscode.Uri.file(appDistPath);

        // path as uri
        const baseUri = this.panel.webview.asWebviewUri(appDistPathUri);

        // get path to index.html file from dist folder
        const indexPath = path.join(appDistPath, 'index.html');

        // read index file from file system
        let indexHtml = fs.readFileSync(indexPath, { encoding: 'utf8' });

        // update the base URI tag
        indexHtml = indexHtml.replace('<base href="/">', `<base href="${String(baseUri)}/">`);
        const config = {
            publicApiBaseUrl: workspaceConfiguration.publicApiBaseUrl,
            basicAuthUsername: publicApiConfiguration.basicAuthUsername,
            basicAuthPassword: publicApiConfiguration.basicAuthPassword,

            productId: workspaceConfiguration.productId,
            configId: workspaceConfiguration.configId,
            environmentId: environmentId,
            settingId: settingId
        };
        indexHtml = indexHtml.replace('window.CONFIGCAT_APPDATA = {};', 'window.CONFIGCAT_APPDATA = ' + JSON.stringify(config) + ';');

        return indexHtml;
    }
}
