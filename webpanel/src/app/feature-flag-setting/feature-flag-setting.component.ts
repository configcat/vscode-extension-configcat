import { Component, inject, input} from "@angular/core";
import { EvaluationVersion } from "ng-configcat-publicapi";
import { FeatureFlagItemComponent, SettingItemComponent} from "ng-configcat-publicapi-ui";
import { WebviewApi } from "vscode-webview";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-feature-flag-setting",
  imports: [SettingItemComponent, FeatureFlagItemComponent],
  templateUrl: "./feature-flag-setting.component.html",
})
export class FeatureFlagSettingComponent {
  readonly vscode = input.required<WebviewApi<unknown>>();

  appData = inject(AppData);
  EvaluationVersion = EvaluationVersion;

  saveFailed() {
    this.vscode()?.postMessage({
      command: "configcat-ff-save-failed",
    });
  }
}
