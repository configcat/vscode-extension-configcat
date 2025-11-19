import * as vscode from "vscode";

export class HelpItem extends vscode.TreeItem {
  constructor(
    public override readonly label: string,
    public override readonly collapsibleState: vscode.TreeItemCollapsibleState,
    command?: vscode.Command,
    iconPath?: string
  ) {
    super(label, collapsibleState);
    this.command = command;
    this.iconPath = iconPath;
  }
}
