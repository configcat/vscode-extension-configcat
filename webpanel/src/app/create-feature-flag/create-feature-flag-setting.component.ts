import { Component, inject } from "@angular/core";
import { CreateFeatureFlagComponent, LinkFeatureFlagParameters } from "ng-configcat-publicapi-ui";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-create-feature-flag",
  imports: [CreateFeatureFlagComponent],
  templateUrl: "./create-feature-flag-setting.component.html",
})
export class CreateFeatureFlagSettingComponent {

  appData = inject(AppData);
  vscode = acquireVsCodeApi();

  createFeatureFlag(linkFeatureFlagParameters: LinkFeatureFlagParameters) {
    console.log(linkFeatureFlagParameters);
    this.vscode.postMessage({
      command: "configcat-ff-create",
      text: "success",
    });
  }
}
