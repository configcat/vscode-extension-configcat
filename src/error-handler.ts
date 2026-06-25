import { AxiosError } from "axios";
import * as vscode from "vscode";
import { AuthenticationProvider } from "./authentication/authentication-provider";

export async function handleError(errorTitle: string, error: Error, authenticationProvider?: AuthenticationProvider): Promise<void> {
  let errorDetails = "";
  let isUnauthorizedError = false;

  if (error instanceof AxiosError) {
    isUnauthorizedError = error.response?.status === 401;

    if (isUnauthorizedError) {
      errorDetails = "Unauthorized access. Check your credentials and try again.";
    } else if (typeof error?.response?.data === "string") {
      errorDetails = error?.response?.data;
    } else {
      for (const [p, val] of Object.entries(error?.response?.data as Record<string, unknown>)) {
        errorDetails += `${p}: ${String(val)}\n`;
      }
    }
  }

  vscode.window.showWarningMessage(errorTitle + " " + error.message + " " + errorDetails);

  if (isUnauthorizedError && authenticationProvider) {
    await authenticationProvider.logout();
  }
}

