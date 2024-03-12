import { Component } from '@angular/core';
import { AppData } from './app-data';
import { EvaluationVersion } from 'ng-configcat-publicapi';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent {
  title = 'webpanel';
  EvaluationVersion = EvaluationVersion;

  constructor(public appData: AppData) {
  }

}
