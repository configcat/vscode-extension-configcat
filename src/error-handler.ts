import * as vscode from 'vscode';

export async function handleError(errorTitle: string, error: any): Promise<void> {
    let errorDetails = '';
    if (error?.response?.data) {

        if (typeof error?.response?.data == "string") {
            errorDetails = error?.response?.data;
        } else {
            for (const [p, val] of Object.entries(error?.response?.data)) {
                errorDetails += `${p}: ${val}\n`;
            }
        }
    }

    vscode.window.showWarningMessage(errorTitle + ' ' + error + '. ' + errorDetails);
}

