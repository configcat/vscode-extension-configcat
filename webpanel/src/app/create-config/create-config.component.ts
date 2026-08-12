import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CreateConfigComponent, DEFAULT_CUSTOMIZE_CREATE_CONFIG, ICustomizeCreateConfig } from "ng-configcat-publicapi-ui";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-create-config",
  imports: [CreateConfigComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
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

  getCustomize(): ICustomizeCreateConfig {
    return { ...DEFAULT_CUSTOMIZE_CREATE_CONFIG, hideCancelButton: false, targetSectionHeader: "Product", targetSectionDescription: "The config will be created under the following product in ConfigCat." };
  }
}
