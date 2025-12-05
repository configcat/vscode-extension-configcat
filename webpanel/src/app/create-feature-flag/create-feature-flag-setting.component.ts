import { Component, inject } from "@angular/core";
import { CreateFeatureFlagComponent, LinkFeatureFlagParameters } from "ng-configcat-publicapi-ui";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-create-feature-flag",
  imports: [CreateFeatureFlagComponent],
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
}
