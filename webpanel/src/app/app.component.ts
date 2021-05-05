import { Component } from '@angular/core';
import { AppData } from './app-data';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent {
  title = 'webpanel';

  constructor(public appData: AppData) {
  }

}
