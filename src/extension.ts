import * as vscode from "vscode";
import { registerProviders } from "./providers";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  await vscode.commands.executeCommand("setContext", "configcat:initialized", false);
  await registerProviders(context);
  await vscode.commands.executeCommand("setContext", "configcat:initialized", true);
}

// this method is called when your extension is deactivated
export async function deactivate(): Promise<void> {
  await vscode.commands.executeCommand("setContext", "configcat:initialized", false);
}
