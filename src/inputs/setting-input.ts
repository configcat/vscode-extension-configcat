import { CreateSettingInitialValues, SettingType } from "configcat-publicapi-node-client";
import * as vscode from "vscode";

export class SettingInput {

  private static readonly booleanSettingDescription = "Feature Flag (boolean)";
  private static readonly textSettingDescription = "Text (string)";
  private static readonly wholeNumberSettingDescription = "Whole number (integer)";
  private static readonly decimalNumberSettingDescription = "Decimal number (double)";

  static async settingInput(): Promise<CreateSettingInitialValues> {
    const settingTypeString = await vscode.window.showQuickPick(
      [this.booleanSettingDescription, this.textSettingDescription, this.wholeNumberSettingDescription, this.decimalNumberSettingDescription],
      {
        canPickMany: false,
        placeHolder: "Pick a setting type",
      });
    if (!settingTypeString) {
      return Promise.reject();
    }

    let settingType: SettingType;
    switch (settingTypeString) {
      case this.booleanSettingDescription:
        settingType = SettingType.Boolean;
        break;
      case this.textSettingDescription:
        settingType = SettingType.String;
        break;
      case this.wholeNumberSettingDescription:
        settingType = SettingType.Int;
        break;
      case this.decimalNumberSettingDescription:
        settingType = SettingType.Double;
        break;
      default:
        return Promise.reject();
    }

    const name = await vscode.window.showInputBox({
      prompt: "Name for hoomans",
      placeHolder: "Is my awesome feature enabled",
      validateInput: this.requiredValidator,
    });
    if (!name) {
      return Promise.reject();
    }
    const key = await vscode.window.showInputBox({
      prompt: "Key for programs",
      placeHolder: "isMyAwesomeFeatureEnabled",
      validateInput: this.requiredValidator,
    });
    if (!key) {
      return Promise.reject();
    }
    const hint = await vscode.window.showInputBox({
      prompt: "Hint",
      placeHolder: "",
      value: "",
    });
    if (hint === undefined) {
      return Promise.reject();
    }

    const confirmText = await vscode.window.showQuickPick(["Yes", "No"], {
      canPickMany: false,
      placeHolder: "Clicking on Yes will create a " + settingTypeString + " setting. Key: " + key + ". Description: " + name + " Hint: " + hint,
    });

    if (confirmText !== "Yes") {
      return Promise.reject();
    }

    return Promise.resolve({ key, name, hint, settingType });
  }

  static requiredValidator = (value: string) => {
    if (value) {
      return null;
    }
    return "Field is required.";
  };
}
