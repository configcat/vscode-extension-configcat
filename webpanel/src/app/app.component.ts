import { Component, inject, OnInit } from "@angular/core";
import { EvaluationVersion } from "ng-configcat-publicapi";
import { FeatureFlagItemComponent, SettingItemComponent, Theme, ThemeService } from "ng-configcat-publicapi-ui";
import { AppData } from "./app-data";

@Component({
  selector: "configcat-vscode-root",
  templateUrl: "./app.component.html",
  styles: [],
  imports: [FeatureFlagItemComponent, SettingItemComponent],

})
export class AppComponent implements OnInit {

  private readonly themeService = inject(ThemeService);

  appData = inject(AppData);

  title = "webpanel";
  EvaluationVersion = EvaluationVersion;

  ngOnInit(): void {

    if (this.appData.vsCodeTheme === "dark") {
      this.themeService.setTheme(Theme.Dark);
    }

    window
      .addEventListener("message", (event: MessageEvent<({ command: string; value: string })>) => {
        if (!event.origin.startsWith("vscode-webview"))
          return;
        const message = event.data; // The JSON data our extension sent
        if (message.command === "themeChange") {
          const turnOn = message.value === "dark";
          this.themeService.setTheme(turnOn ? Theme.Dark : Theme.Light);
        }

      });
  }
}
