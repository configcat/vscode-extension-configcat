import { SettingModel } from "configcat-publicapi-node-client";
import * as vscode from "vscode";

export class SettingSearchInput {

  static async searchSettings(settings: SettingModel[]): Promise<SettingModel> {

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

    return Promise.resolve(settings.find(s => s.settingId === pick.id)!);
  }
}
