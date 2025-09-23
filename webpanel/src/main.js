"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var environment_1 = require("./environments/environment");
var platform_browser_1 = require("@angular/platform-browser");
var app_component_1 = require("./app/app.component");
var app_config_1 = require("./app/app.config");
if (environment_1.environment.production) {
    (0, core_1.enableProdMode)();
}
(0, platform_browser_1.bootstrapApplication)(app_component_1.AppComponent, app_config_1.appConfig).catch(function (err) {
    console.error(err);
});
