import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";
import { CONFIGCAT_PUBLICAPI_UI_CONFIGURATION, provideConfigCatPublicApiUi } from "ng-configcat-publicapi-ui";
import { AppData } from "./app-data";

export class ViewData {
  public view: "none" | "featureflagsetting" | "createfeatureflag" = "none";
}

declare global {
  interface Window {
    CONFIGCAT_APPDATA: AppData;
    CONFIGCAT_APP_VIEW: ViewData;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      MatDialogModule,
      MatNativeDateModule
    ),
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    {
      provide: AppData,
      useValue: window["CONFIGCAT_APPDATA"],
    },
    {
      provide: ViewData,
      useValue: window["CONFIGCAT_APP_VIEW"],
    },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: CONFIGCAT_PUBLICAPI_UI_CONFIGURATION,
      useValue: {
        basePath: window["CONFIGCAT_APPDATA"].publicApiBaseUrl,
        dashboardBasePath: window["CONFIGCAT_APPDATA"].dashboardBasePath,
        basicAuthUsername: window["CONFIGCAT_APPDATA"].basicAuthUsername,
        basicAuthPassword: window["CONFIGCAT_APPDATA"].basicAuthPassword,
      },
    },
    provideConfigCatPublicApiUi(),
  ],
};
