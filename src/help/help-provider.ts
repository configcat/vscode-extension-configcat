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
            const docsElement = new HelpItem('Docs', vscode.TreeItemCollapsibleState.None, { command: 'configcat.docs', title: 'Docs' });
            return Promise.resolve([docsElement]);
        }

        return Promise.resolve([]);
    }
}
