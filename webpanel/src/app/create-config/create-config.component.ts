import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { CreateConfigComponent } from "ng-configcat-publicapi-ui";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-create-config",
  imports: [CreateConfigComponent],
  templateUrl: "./create-config.component.html",
})
export class ConfigCreateComponent {
  vscode = acquireVsCodeApi();

  appData = inject(AppData);

  createConfig(configId: string) {
    this.vscode.postMessage({
      command: "configcat-config-create-success",
      configId: configId,
    });
  }

  componentFailed(error: Error) {
    const errorMessage = error.message;
    let errorStatus: number | undefined;
    if (error instanceof HttpErrorResponse) {
      errorStatus = error.status;
    }
    this.vscode.postMessage({
      command: "configcat-config-create-failed",
      error: { message: errorMessage, status: errorStatus },
    });
  }
}
