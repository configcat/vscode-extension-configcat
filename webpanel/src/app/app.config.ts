import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from "@angular/router";
import { CONFIGCAT_PUBLICAPI_UI_CONFIGURATION, provideConfigCatPublicApiUi } from "ng-configcat-publicapi-ui";
import { AppData } from "./app-data";
import { routes } from "./app-routing.module";

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      MatDialogModule,
      MatNativeDateModule
    ),
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: "enabled", anchorScrolling: "enabled" }),
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: "always" })
    ),
    {
      provide: AppData,
      useValue: (window as any).CONFIGCAT_APPDATA,
    },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: CONFIGCAT_PUBLICAPI_UI_CONFIGURATION,
      useValue: {
        basePath: (window as any).CONFIGCAT_APPDATA.publicApiBaseUrl,
        dashboardBasePath: (window as any).CONFIGCAT_APPDATA.dashboardBaseUrl,
        basicAuthUsername: (window as any).CONFIGCAT_APPDATA.basicAuthUsername,
        basicAuthPassword: (window as any).CONFIGCAT_APPDATA.basicAuthPassword,
      },
    },
    provideConfigCatPublicApiUi(),
  ],
};
