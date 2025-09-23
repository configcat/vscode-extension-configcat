import * as vscode from "vscode";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";

export class AuthInput {

  static async getAuthParameters(): Promise<PublicApiConfiguration> {

    const basicAuthUsername = await vscode.window.showInputBox({
      prompt: "To use ConfigCat VSCode extension, you should authenticate with your Public API credentials. Please enter your Basic Auth UserName.",
      placeHolder: "Basic auth username",
      validateInput: this.requiredValidator,
      ignoreFocusOut: true,
    });
    if (!basicAuthUsername) {
      return Promise.reject();
    }

    const basicAuthPassword = await vscode.window.showInputBox({
      prompt: "Basic auth password",
      placeHolder: "Basic auth password",
      validateInput: this.requiredValidator,
      ignoreFocusOut: true,
      password: true,
    });
    if (!basicAuthPassword) {
      return Promise.reject();
    }

    return { basicAuthPassword, basicAuthUsername };
  }

  static requiredValidator = (value: string) => {
    if (value) {
      return null;
    }
    return "Field is required.";
  };
}
