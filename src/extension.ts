import * as vscode from 'vscode';
import { registerProviders } from './provider-registration';

export function activate(context: vscode.ExtensionContext) {

	registerProviders(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
