import * as vscode from 'vscode';
import { PublicApiService } from './public-api/public-api.service';

export async function registerProviders(context: vscode.ExtensionContext) {
    const publicApiService = new PublicApiService();
}