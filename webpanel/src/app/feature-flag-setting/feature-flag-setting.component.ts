import { Component, inject} from "@angular/core";
import { EvaluationVersion } from "ng-configcat-publicapi";
import { FeatureFlagItemComponent, SettingItemComponent} from "ng-configcat-publicapi-ui";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-feature-flag-setting",
  imports: [SettingItemComponent, FeatureFlagItemComponent],
  templateUrl: "./feature-flag-setting.component.html",
})
export class FeatureFlagSettingComponent {
  vscode = acquireVsCodeApi();

  appData = inject(AppData);
  EvaluationVersion = EvaluationVersion;

  saveFailed() {
    this.vscode.postMessage({
      command: "configcat-ff-save-failed",
    });
  }
}
