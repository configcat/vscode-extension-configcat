import { SettingModel } from "configcat-publicapi-node-client";
import * as vscode from "vscode";

export class SettingSearchInput {

  static async searchSettings(settings: SettingModel[]): Promise<number> {

    const pickItems = settings.map(p => {
      return { label: p.key || "", description: p.name, id: p.settingId };
    });

    const pick = await vscode.window.showQuickPick(pickItems, {
      canPickMany: false,
      placeHolder: "Search Feature Flag ",
      matchOnDescription: true,
    });

    if (!pick?.id) {
      return Promise.reject(new Error("No selected enviroment."));
    }

    return Promise.resolve(pick.id);
  }
}
