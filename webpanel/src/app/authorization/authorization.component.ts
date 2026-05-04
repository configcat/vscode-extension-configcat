import { Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { AuthorizationComponent, AuthorizationModel } from "ng-configcat-publicapi-ui";
import { AppData } from "../app-data";

@Component({
  selector: "configcat-vscode-authorization",
  templateUrl: "./authorization.component.html",
  styleUrls: ["./authorization.component.scss"],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButton,
    AuthorizationComponent,
  ],
})
export class AuthComponent {
  vscode = acquireVsCodeApi();

  appData = inject(AppData);
  loading = true;

  login(authorizationParameters: AuthorizationModel) {
    this.vscode.postMessage({
      command: "configcat-login-success",
      authorizationParameters: authorizationParameters,
    });
  }

  unauthorize() {
    this.vscode.postMessage({
      command: "configcat-logout-success",
    });
  }

}
