import * as vscode from "vscode";
import { handleError } from "../error-handler";
import { AuthInput } from "../inputs/auth-input";
import { PublicApiConfiguration } from "../public-api/public-api-configuration";
import { PublicApiService } from "../public-api/public-api.service";
import { ConfigCatWorkspaceConfiguration } from "../settings/workspace-configuration";
import { WorkspaceConfigurationProvider } from "../settings/workspace-configuration-provider";
import { AuthorizationWebPanel } from "../webpanel/authorization-webpanel";

export const contextIsAuthenticated = "configcat:authenticated";

export class AuthenticationProvider {

  public static readonly secretKey = "configcat:publicapi-credentials";
  public publicApiConfiguration: PublicApiConfiguration | null = null;

  constructor(private readonly context: vscode.ExtensionContext,
    private readonly publicApiService: PublicApiService,
    private readonly workspaceConfigurationProvider: WorkspaceConfigurationProvider) {
  }

  async checkAuthenticated(): Promise<void> {
    try {
      await this.getAuthenticationConfiguration();
      await vscode.commands.executeCommand("setContext", contextIsAuthenticated, true);
    } catch (error: unknown) {
      console.log(error);
      await this.clear();
    }
  }

  async getAuthenticationConfiguration(): Promise<PublicApiConfiguration | null> {
    const credentialsString = await this.context.secrets.get(AuthenticationProvider.secretKey);
    if (!credentialsString) {
      return Promise.reject(new Error("Missing credentials."));
    }

    const credentials = JSON.parse(credentialsString) as PublicApiConfiguration;
    if (!credentials?.basicAuthUsername || !credentials.basicAuthPassword) {
      return Promise.reject(new Error("Missing credentials."));
    }

    return Promise.resolve(credentials);
  }

  async authenticateWithAuthInput(): Promise<PublicApiConfiguration | null> {

    let configuration: PublicApiConfiguration;
    try {
      configuration = await AuthInput.getAuthParameters();
    } catch (error: unknown) {
      console.log(error);
      return null;
    }

    return this.authenticate(configuration);
  }

  async authenticate(configuration: PublicApiConfiguration): Promise<PublicApiConfiguration | null> {

    let workspaceConfiguration: ConfigCatWorkspaceConfiguration | null;

    try {
      workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
    } catch (error: unknown) {
      console.log(error);
      return null;
    }

    if (!workspaceConfiguration?.publicApiBaseUrl) {
      return null;
    }

    const meService = this.publicApiService.createMeService(configuration, workspaceConfiguration.publicApiBaseUrl);

    try {
      const me = await meService.getMe();
      await this.context.secrets.store(AuthenticationProvider.secretKey, JSON.stringify(configuration));
      vscode.window.showInformationMessage("Logged in to ConfigCat. Email: " + me.data.email);
      return configuration;
    } catch (error: unknown) {
      await handleError("Could not log in to ConfigCat.", error as Error);
      return null;
    }
  }

  async logout() {
    await this.clear();
    vscode.window.showInformationMessage("Logged out from ConfigCat");
  }

  private async clear() {
    await vscode.commands.executeCommand("setContext", contextIsAuthenticated, false);
    await this.context.secrets.delete(AuthenticationProvider.secretKey);
  }

  private async openAuthorizationWebPanel(workspaceConfiguration: ConfigCatWorkspaceConfiguration): Promise<void> {
    let publicApiConfiguration: PublicApiConfiguration = {
      basicAuthUsername: "",
      basicAuthPassword: "",
      email: "",
      fullName: "",
    };
    let isAuthorized = false;

    try {
      const authenticationConfiguration = await this.getAuthenticationConfiguration();
      if (authenticationConfiguration) {
        publicApiConfiguration = authenticationConfiguration;
        isAuthorized = true;
      }
    } catch {
      isAuthorized = false;
    }

    const webPanel = new AuthorizationWebPanel(this.context, publicApiConfiguration, workspaceConfiguration, isAuthorized, this);
    this.context.subscriptions.push(webPanel.panel!);
  }

  registerProviders() {
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.login", async () => {
      const workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
      if (workspaceConfiguration?.webAuthorizationEnabled) {
        await this.openAuthorizationWebPanel(workspaceConfiguration);
      } else {
        await this.authenticateWithAuthInput();
      }
    }));
    this.context.subscriptions.push(vscode.commands.registerCommand("configcat.logout", async () => {
      const workspaceConfiguration = await this.workspaceConfigurationProvider.getWorkspaceConfiguration();
      if (workspaceConfiguration?.webAuthorizationEnabled) {
        await this.openAuthorizationWebPanel(workspaceConfiguration);
      } else {
        await this.logout();
      }
    }));
    this.context.subscriptions.push(
      this.context.secrets.onDidChange(async e => {
        if (e.key === AuthenticationProvider.secretKey) {
          await this.checkAuthenticated();
        }
      })
    );
  }
}
