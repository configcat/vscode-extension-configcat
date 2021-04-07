import * as vscode from 'vscode';
import { ConfigModel } from "configcat-publicapi-node-client";

export class ConfigInput {

    static async pickConfig(configs: ConfigModel[]): Promise<string> {

        const pickItems = configs.map(p => {
            return { label: p.name || '', description: p.configId };
        });

        const pick = await vscode.window.showQuickPick(pickItems, {
            canPickMany: false,
            placeHolder: 'Select a Config'
        });

        if (!pick?.description) {
            return Promise.reject();
        }

        return Promise.resolve(pick.description);
    }
}