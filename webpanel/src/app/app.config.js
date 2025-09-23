"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
var http_1 = require("@angular/common/http");
var core_1 = require("@angular/core");
var core_2 = require("@angular/material/core");
var dialog_1 = require("@angular/material/dialog");
var router_1 = require("@angular/router");
var ng_configcat_publicapi_ui_1 = require("ng-configcat-publicapi-ui");
var app_routing_module_1 = require("./app-routing.module");
var app_data_1 = require("./app-data");
exports.appConfig = {
    providers: [
        (0, core_1.importProvidersFrom)(dialog_1.MatDialogModule, core_2.MatNativeDateModule),
        (0, core_1.provideZoneChangeDetection)({ eventCoalescing: true, runCoalescing: true }),
        (0, router_1.provideRouter)(app_routing_module_1.routes, (0, router_1.withInMemoryScrolling)({ scrollPositionRestoration: "enabled", anchorScrolling: "enabled" }), (0, router_1.withComponentInputBinding)(), (0, router_1.withRouterConfig)({ paramsInheritanceStrategy: "always" })),
        {
            provide: app_data_1.AppData,
            useValue: window.CONFIGCAT_APPDATA
        },
        (0, http_1.provideHttpClient)((0, http_1.withInterceptorsFromDi)()),
        {
            provide: ng_configcat_publicapi_ui_1.CONFIGCAT_PUBLICAPI_UI_CONFIGURATION,
            useValue: {
                basePath: window.CONFIGCAT_APPDATA.publicApiBaseUrl,
                dashboardBasePath: window.CONFIGCAT_APPDATA.dashboardBaseUrl,
                basicAuthUsername: window.CONFIGCAT_APPDATA.basicAuthUsername,
                basicAuthPassword: window.CONFIGCAT_APPDATA.basicAuthPassword
            },
        },
        (0, ng_configcat_publicapi_ui_1.provideConfigCatPublicApiUi)(),
    ],
};
