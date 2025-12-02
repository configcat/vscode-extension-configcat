import { Component, inject, input } from "@angular/core";
import { CreateFeatureFlagComponent, LinkFeatureFlagParameters } from "ng-configcat-publicapi-ui";
import { WebviewApi } from "vscode-webview";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-create-feature-flag",
  imports: [CreateFeatureFlagComponent],
  templateUrl: "./create-feature-flag-setting.component.html",
})
export class CreateFeatureFlagSettingComponent {
  readonly vscode = input.required<WebviewApi<unknown>>();

  appData = inject(AppData);

  createFeatureFlag(linkFeatureFlagParameters: LinkFeatureFlagParameters) {
    this.vscode()?.postMessage({
      command: "configcat-ff-create-success",
      settingId: linkFeatureFlagParameters.settingId,
    });
  }
}
