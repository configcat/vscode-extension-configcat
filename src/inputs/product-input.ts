import * as vscode from 'vscode';
import { ProductModel } from "configcat-publicapi-node-client";

export class ProductInput {
    static async pickProduct(products: ProductModel[]): Promise<string> {
        const pickItems = products.map(p => {
            return { label: p.name || '', description: p.productId };
        });

        const pick = await vscode.window.showQuickPick(pickItems, {
            canPickMany: false,
            placeHolder: 'Select a Product'
        });

        if (!pick?.description) {
            return Promise.reject();
        }

        return Promise.resolve(pick.description);
    }
}