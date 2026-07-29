import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CreateFeatureFlagComponent, DEFAULT_CUSTOMIZE_CREATE_FEATURE_FLAG, ICustomizeCreateFeatureFlag, LinkFeatureFlagParameters } from "ng-configcat-publicapi-ui";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-create-feature-flag",
  imports: [CreateFeatureFlagComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: "./create-feature-flag-setting.component.html",
})
export class CreateFeatureFlagSettingComponent {
  vscode = acquireVsCodeApi();

  appData = inject(AppData);

  createFeatureFlag(linkFeatureFlagParameters: LinkFeatureFlagParameters) {
    this.vscode.postMessage({
      command: "configcat-ff-create-success",
      settingId: linkFeatureFlagParameters.settingId,
    });
  }

  componentFailed(error: Error) {
    const errorMessage = error.message;
    let errorStatus: number | undefined;
    if (error instanceof HttpErrorResponse) {
      errorStatus = error.status;
    }
    this.vscode.postMessage({
      command: "configcat-ff-create-failed",
      error: { message: errorMessage, status: errorStatus },
    });
  }

  getCustomize(): ICustomizeCreateFeatureFlag {
    return {
      ...DEFAULT_CUSTOMIZE_CREATE_FEATURE_FLAG,
      hideLinkSection: true,
      targetSectionHeader: "Product and Config",
      targetSectionDescription: "The feature flag will be created under the following product and config in ConfigCat.",
    };
  }
}
