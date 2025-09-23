import { Component, inject } from '@angular/core';
import { AppData } from './app-data';
import { EvaluationVersion } from 'ng-configcat-publicapi';
import { FeatureFlagItemComponent, SettingItemComponent } from 'ng-configcat-publicapi-ui';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styles: [],
    imports: [FeatureFlagItemComponent, SettingItemComponent],

})
export class AppComponent {
  appData = inject(AppData);

  title = 'webpanel';
  EvaluationVersion = EvaluationVersion;

}
