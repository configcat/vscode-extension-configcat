import * as vscode from 'vscode';
import { ConfigModel } from "configcat-publicapi-node-client";
import { PublicApiConfiguration } from '../public-api/public-api-configuration';
import { PublicApiService } from '../public-api/public-api.service';

export class AuthInput {

    static async getAuthParameters(): Promise<PublicApiConfiguration> {

        const basicAuthUsername = await vscode.window.showInputBox({
            prompt: 'To use ConfigCat VSCode extension, you should authenticate with your Public API credentials. Please enter your Basic Auth UserName.',
            placeHolder: 'Basic auth username',
            validateInput: this.requiredValidator,
            ignoreFocusOut: true,
        });
        if (!basicAuthUsername) {
            return Promise.reject();
        }

        const basicAuthPassword = await vscode.window.showInputBox({
            prompt: 'Basic auth password',
            placeHolder: 'Basic auth password',
            validateInput: this.requiredValidator,
            ignoreFocusOut: true,
            password: true,
        });
        if (!basicAuthPassword) {
            return Promise.reject();
        }

        let basePath = await vscode.window.showInputBox({
            prompt: 'API base URL',
            placeHolder: `Leave blank for default (${PublicApiService.defaultBasePath})`,
            ignoreFocusOut: true
        });
        if (basePath === undefined) {
            return Promise.reject();
        }
        if (!basePath) {
            basePath = PublicApiService.defaultBasePath;
        }

        return { basePath, basicAuthPassword, basicAuthUsername };
    }

    static requiredValidator = (value: string) => {
        if (value) {
            return null;
        }
        return 'Field is required.';
    };
}