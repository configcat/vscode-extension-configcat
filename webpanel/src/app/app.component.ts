import { Component, DOCUMENT, inject, OnDestroy, OnInit } from "@angular/core";
import { EvaluationVersion } from "ng-configcat-publicapi";
import { CreateFeatureFlagComponent, FeatureFlagItemComponent, LinkFeatureFlagParameters, SettingItemComponent, Theme, ThemeService } from "ng-configcat-publicapi-ui";
import { AppData } from "./app-data";

@Component({
  selector: "configcat-vscode-root",
  templateUrl: "./app.component.html",
  styles: [],
  imports: [FeatureFlagItemComponent, SettingItemComponent, CreateFeatureFlagComponent],

})
export class AppComponent implements OnInit, OnDestroy {

  private readonly themeService = inject(ThemeService);
  vscode = acquireVsCodeApi();

  appData = inject(AppData);
  private readonly document = inject(DOCUMENT);

  title = "webpanel";
  EvaluationVersion = EvaluationVersion;

  postThemeChange = (event: MessageEvent<({ command: string; value: string })>) => {
    if (!event.origin.startsWith("vscode-webview"))
      return;
    const message = event.data; // The JSON data our extension sent
    if (message.command === "themeChange") {
      const turnOn = message.value === "dark";
      this.themeService.setTheme(turnOn ? Theme.Dark : Theme.Light);
    }

  };

  ngOnInit(): void {
    const vscodeThemeKind = this.document.body.getAttribute("data-vscode-theme-kind");
    if (vscodeThemeKind === "vscode-dark" || vscodeThemeKind === "vscode-high-contrast") {
      this.themeService.setTheme(Theme.Dark);
    }

    window.addEventListener("message", this.postThemeChange);
  }

  createFeatureFlag(linkFeatureFlagParameters: LinkFeatureFlagParameters) {
    console.log(linkFeatureFlagParameters);
    //TODO send info out for linking. env and setting id I guees
    this.vscode.postMessage({
      command: "configcat-ff-create",
      text: "success",
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener("message", this.postThemeChange);
  }
}
