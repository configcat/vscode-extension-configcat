import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgConfigCatPublicApiUIModule } from 'ng-configcat-publicapi-ui';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppData } from './app-data';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        NgConfigCatPublicApiUIModule.forRoot(() => ({
            basePath: (window as any).CONFIGCAT_APPDATA.publicApiBaseUrl,
            dashboardBasePath: (window as any).CONFIGCAT_APPDATA.dashboardBasePath,
            basicAuthUsername: (window as any).CONFIGCAT_APPDATA.basicAuthUsername,
            basicAuthPassword: (window as any).CONFIGCAT_APPDATA.basicAuthPassword
        }))], providers: [AppData,
        {
            provide: AppData,
            useValue: (window as any).CONFIGCAT_APPDATA
        }, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
