import { Component, inject, OnInit } from '@angular/core';
import { AppData } from './app-data';
import { EvaluationVersion } from 'ng-configcat-publicapi';
import { FeatureFlagItemComponent, SettingItemComponent, Theme, ThemeService } from 'ng-configcat-publicapi-ui';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styles: [],
    imports: [FeatureFlagItemComponent, SettingItemComponent],

})
export class AppComponent implements OnInit{

  private readonly themeService = inject(ThemeService);

  appData = inject(AppData);

  title = 'webpanel';
  EvaluationVersion = EvaluationVersion;

  ngOnInit(): void {

    if (this.appData.vsCodeTheme === "dark") {
      this.themeService.setTheme(Theme.Dark);
    } 

    window
      .addEventListener("message", (event: MessageEvent<({ command: string, value: string })>) => {
        const message = event.data; // The JSON data our extension sent
        if(message.command === "themeChange") {
          let turnOn = message.value === "dark";
          this.themeService.setTheme(turnOn ? Theme.Dark : Theme.Light);
        }
        
      });
  }
}
