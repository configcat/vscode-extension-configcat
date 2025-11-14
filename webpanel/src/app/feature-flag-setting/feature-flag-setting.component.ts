import { Component, inject, OnInit } from "@angular/core";
import { EvaluationVersion } from "ng-configcat-publicapi";
import { FeatureFlagItemComponent, SettingItemComponent} from "ng-configcat-publicapi-ui";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-feature-flag-setting",
  imports: [SettingItemComponent, FeatureFlagItemComponent],
  templateUrl: "./feature-flag-setting.component.html",
})
export class FeatureFlagSettingComponent implements OnInit {

  ngOnInit(): void {
    console.log("FeatureFlagSettingComponent init.");
  }

  appData = inject(AppData);
  EvaluationVersion = EvaluationVersion;

}
