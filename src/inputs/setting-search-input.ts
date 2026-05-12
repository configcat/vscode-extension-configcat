import { SettingModel } from "configcat-publicapi-node-client";
import * as vscode from "vscode";

export class SettingSearchInput {

  static async searchSettings(settings: SettingModel[]): Promise<SettingModel> {

    const pickItems = settings.map(p => {
      return { label: p.name || "", description: p.key, id: p.settingId };
    });

    const pick = await vscode.window.showQuickPick(pickItems, {
      canPickMany: false,
      placeHolder: "Search Feature Flag ",
      matchOnDescription: true,
    });

    if (!pick?.id) {
      return Promise.reject(new Error("No selected setting."));
    }
    const setting = settings.find(s => s.settingId === pick.id);
    if (!setting) {
      return Promise.reject(new Error("Selected setting not found."));
    }
    return Promise.resolve(setting);
  }
}
