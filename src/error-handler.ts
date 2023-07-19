import * as vscode from 'vscode';

export async function handleError(errorTitle: string, error: any): Promise<void> {
    let errorDetails = '';
    if (error?.response?.body) {
        for (const [p, val] of Object.entries(error?.response?.body)) {
            errorDetails += `${p}: ${val}\n`;
        }
    }

    vscode.window.showWarningMessage(errorTitle + ' ' + error + '. ' + errorDetails);
}

