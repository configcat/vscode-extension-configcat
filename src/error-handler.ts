import { AxiosError } from "axios";
import * as vscode from "vscode";

export async function handleError(errorTitle: string, error: Error): Promise<void> {
  let errorDetails = "";
  if (error instanceof AxiosError && error?.response?.data) {

    if (typeof error?.response?.data === "string") {
      errorDetails = error?.response?.data;
    } else {
      for (const [p, val] of Object.entries(error?.response?.data as string)) {
        errorDetails += `${p}: ${val}\n`;
      }
    }
  }

  await vscode.window.showWarningMessage(errorTitle + " " + error.message + ". " + errorDetails);
}

