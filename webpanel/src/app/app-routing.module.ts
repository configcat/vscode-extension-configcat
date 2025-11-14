import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "**", loadComponent: () => import("./home/home.component").then(m => m.HomeComponent) },
  { path: "featureflagsetting", loadComponent: () => import("./feature-flag-setting/feature-flag-setting.component").then(m => m.FeatureFlagSettingComponent) },
  { path: "createfeatureflag", loadComponent: () => import("./create-feature-flag/create-feature-flag-setting.component").then(m => m.CreateFeatureFlagSettingComponent) },
];
