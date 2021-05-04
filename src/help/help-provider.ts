import * as vscode from 'vscode';
import { HelpItem } from './help-item';

export class HelpProvider implements vscode.TreeDataProvider<HelpItem> {

    constructor(private context: vscode.ExtensionContext) {
    }

    getTreeItem(element: HelpItem): HelpItem {
        return element;
    }

    getChildren(element?: HelpItem): Thenable<HelpItem[]> {
        if (!element) {
            const docsElement = new HelpItem('ConfigCat Docs', vscode.TreeItemCollapsibleState.None, {
                command: 'vscode.open', title: 'ConfigCat Docs',
                arguments: [vscode.Uri.parse('https://configcat.com/docs')]
            }, '$(info)');
            const issueElement = new HelpItem('Report issues', vscode.TreeItemCollapsibleState.None, {
                command: 'vscode.open', title: 'Github Issues',
                arguments: [vscode.Uri.parse('https://github.com/configcat/vscode-extension-configcat/issues')]
            }, '$(info)');
            const extensionDocsElement = new HelpItem('How to use the extension', vscode.TreeItemCollapsibleState.None, {
                command: 'vscode.open', title: 'How to use the extension',
                arguments: [vscode.Uri.parse('https://configcat.com/docs/integrations/vscode')]
            }, '$(info)');
            const dashboardElement = new HelpItem('ConfigCat Dashboard', vscode.TreeItemCollapsibleState.None, {
                command: 'vscode.open', title: 'ConfigCat Dashboard',
                arguments: [vscode.Uri.parse('https://app.configcat.com')]
            }, 'info');
            return Promise.resolve([docsElement, dashboardElement, extensionDocsElement, issueElement]);
        }

        return Promise.resolve([]);
    }

    registerProviders() {
        const help = vscode.window.createTreeView('configcat.help', {
            treeDataProvider: this
        });
        this.context.subscriptions.push(help);
    }
}