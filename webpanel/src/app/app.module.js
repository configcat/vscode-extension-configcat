"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const platform_browser_1 = require("@angular/platform-browser");
const ng_configcat_publicapi_ui_1 = require("ng-configcat-publicapi-ui");
const app_routing_module_1 = require("./app-routing.module");
const app_component_1 = require("./app.component");
const app_data_1 = require("./app-data");
let AppModule = class AppModule {
};
AppModule = __decorate([
    core_1.NgModule({
        declarations: [
            app_component_1.AppComponent
        ],
        imports: [
            platform_browser_1.BrowserModule,
            forms_1.FormsModule,
            forms_1.ReactiveFormsModule,
            app_routing_module_1.AppRoutingModule,
            ng_configcat_publicapi_ui_1.NgConfigCatPublicApiUIModule.forRoot(() => ({
                basePath: window.CONFIGCAT_APPDATA.publicApiBaseUrl,
                basicAuthUsername: window.CONFIGCAT_APPDATA.basicAuthUsername,
                basicAuthPassword: window.CONFIGCAT_APPDATA.basicAuthPassword
            }))
        ],
        providers: [app_data_1.AppData, {
                provide: app_data_1.AppData,
                useValue: window.CONFIGCAT_APPDATA
            }
        ],
        bootstrap: [app_component_1.AppComponent]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map