import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { EvaluationVersion } from "ng-configcat-publicapi";
import { FeatureFlagItemComponent, SettingItemComponent } from "ng-configcat-publicapi-ui";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-feature-flag-setting",
  imports: [SettingItemComponent, FeatureFlagItemComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: "./feature-flag-setting.component.html",
})
export class FeatureFlagSettingComponent {
  vscode = acquireVsCodeApi();

  appData = inject(AppData);
  EvaluationVersion = EvaluationVersion;

  componentFailed(error: Error) {
    const errorMessage = error.message;
    let errorStatus: number | undefined;
    if (error instanceof HttpErrorResponse) {
      errorStatus = error.status;
    }
    this.vscode.postMessage({
      command: "configcat-ff-save-failed",
      error: { message: errorMessage, status: errorStatus },
    });
  }
}
