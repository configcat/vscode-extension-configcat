import * as vscode from "vscode";

export class SettingInput {

  static async askConnect(): Promise<string> {
    const pick = await vscode.window.showQuickPick(["Yes", "No"], {
      canPickMany: false,
      placeHolder: "Feature Flag created successfully. Would you like to open this Feature Flag to edit?",
    });

    return Promise.resolve(pick || "No");
  }

}
