import { EnvironmentModel } from 'configcat-publicapi-node-client/dist/model';
import * as vscode from 'vscode';

export class EnvironmentInput {

    static async pickEnvironment(environments: EnvironmentModel[]): Promise<string> {

        const pickItems = environments.map(p => {
            return { label: p.name || '', description: p.environmentId };
        });

        const pick = await vscode.window.showQuickPick(pickItems, {
            canPickMany: false,
            placeHolder: 'Select an Environment'
        });

        if (!pick?.description) {
            return Promise.reject();
        }

        return Promise.resolve(pick.description);
    }
}