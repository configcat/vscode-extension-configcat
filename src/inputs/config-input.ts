import { ConfigModel, EvaluationVersion } from 'configcat-publicapi-node-client/dist/model';
import * as vscode from 'vscode';

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


    static async configInput(): Promise<string> {

        const name = await vscode.window.showInputBox({
            prompt: 'Please enter the name of the Config',
            placeHolder: 'Main Config',
            validateInput: this.requiredValidator,
            ignoreFocusOut: true,
        });
        if (!name) {
            return Promise.reject();
        }

        return Promise.resolve(name);
    }

    
    static async configVersionInput(): Promise<EvaluationVersion> {
        
        const pick = await vscode.window.showQuickPick(
            [{label:"V1", description:"V1"} ,{label: "V2 (Beta)", description: "V2"} ],
            {
                canPickMany: false,
                placeHolder: 'Select the config version'
            });
    
            if (!pick) {
                return Promise.reject();
            }
    
            return Promise.resolve(EvaluationVersion[pick.description]);
    }


    static async askConnect(): Promise<string> {

        const pick = await vscode.window.showQuickPick(['Yes', 'No'], {
            canPickMany: false,
            placeHolder: 'Config created successfully. Would you like to connect this Config to the current workspace?'
        });

        return Promise.resolve(pick || 'No');
    }


    static requiredValidator = (value: string) => {
        if (value) {
            return null;
        }
        return 'Field is required.';
    };
}