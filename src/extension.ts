import * as vscode from 'vscode';
import { registerProviders } from './provider-registration';

export async function activate(context: vscode.ExtensionContext) {

	await registerProviders(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
