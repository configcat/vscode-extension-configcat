import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgConfigCatPublicApiUIModule } from 'ng-configcat-publicapi-ui';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppData } from './app-data';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgConfigCatPublicApiUIModule.forRoot(() => ({
      basePath: (window as any).CONFIGCAT_APPDATA.publicApiBaseUrl,
      basicAuthUsername: (window as any).CONFIGCAT_APPDATA.basicAuthUsername,
      basicAuthPassword: (window as any).CONFIGCAT_APPDATA.basicAuthPassword
    }))
  ],
  providers: [AppData,
    {
      provide: AppData,
      useValue: (window as any).CONFIGCAT_APPDATA
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
