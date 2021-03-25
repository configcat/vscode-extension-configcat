import * as vscode from 'vscode';

export class HelpProvider implements vscode.TreeDataProvider<HelpItem> {

    constructor(private context: vscode.ExtensionContext) {
    }

    getTreeItem(element: HelpItem): HelpItem {
        return element;
    }

    getChildren(element?: HelpItem): Thenable<HelpItem[]> {

        if (!element) {
            const docsElement = new HelpItem('Docs', vscode.TreeItemCollapsibleState.None, vscode.Uri.parse('https://configcat.com/'));

            return Promise.resolve([docsElement]);
        }

        return Promise.resolve([]);
    }
}


export class HelpItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        resourceUri?: vscode.Uri
    ) {
        super(label, collapsibleState);
        super.resourceUri = resourceUri;
    }
}