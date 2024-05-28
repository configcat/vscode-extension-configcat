# ConfigCat Feature Flags extension for Visual Studio Code
ConfigCat Visual Studio Code extension to manage feature flags from Visual Studio Code. 

Connect your Product and Config to your Workspace. Find your Feature Flag's usages in your code easily.
Turn features On / Off right from VSCode. You can also easily modify the linked flags to edit or add new Targeting or Percentage Rules.

## About ConfigCat
ConfigCat is a hosted feature flag service: https://configcat.com. Manage feature toggles across frontend, backend, mobile, and desktop apps. Alternative to LaunchDarkly. Management app + feature flag SDKs.

## Feature overview

- Turn features On / Off right from Visual Studio Code.
- Add Targeting or Percentage Rules from Visual Studio Code.
- Find Feature Flag usages in your code.
- Create Feature Flags within Visual Studio Code.
- Copy a Feature Flag's key to the clipboard.
- View your Products & Configs.
- Create Configs within Visual Studio Code.
- Connect a Config to your Workspace.
- Open a Config on ConfigCat Dashboard.

<img src="resources/help/ff_setting_view.gif" alt="Usage of ConfigCat Feature Flags Visual Studio Code Extension" width="100%"/>  

## Install extension
### Visual Studio Code Marketplace
1. Open [ConfigCat Feature Flags Extension](https://marketplace.visualstudio.com/items?itemName=ConfigCat.configcat-feature-flags) at Visual Studio Marketplace.
1. Click on the Install button.
1. Configure extension (see below)

### or within Visual Studio Code
1. Search for ConfigCat Feature Flags on the Extensions page.
1. Click on the Install button.
1. Configure extension (see below).

### or install from VSIX file
1. Open [ConfigCat Feature Flags Extension](https://marketplace.visualstudio.com/items?itemName=ConfigCat.configcat-feature-flags) at Visual Studio Marketplace.
1. Click on the Download Extension link.
1. Click on the More Actions icon on the Extensions page in Visual Studio Code and select Install from VSIX...
1. Configure extension (see below).

## Configure extension
### Authentication

1. Get your ConfigCat Public API credentials from [ConfigCat Dashboard/Public Management API credentials](https://app.configcat.com/my-account/public-api-credentials).
1. Authenticate ConfigCat in Visual Studio Code by
    - clicking on the ConfigCat Feature Flags icon on the Activity Bar and clicking on any of the Authenticate buttons.
    - or running the `ConfigCat - Log In` command from the Command Palette.

<img src="resources/help/auth.gif" alt="Installation of ConfigCat Feature Flags Visual Studio Code Extension"  width="100%"/>  


### Advanced
If you are trying to use the ConfigCat Feature Flags extension for Visual Studio Code with a `dedicated hosted`/[on-premise](https://configcat.com/on-premise/) ConfigCat instance. In that case, you can specify your custom URLs by executing the `Preferences: Open Workspace Settings` command from the Command Palette and searching for `Extensions/ConfigCat` or clicking the manage button on the ConfigCat Feature Flags extension's page. Important settings:
   - `Public Api Base URL`: the base URL for the ConfigCat Public Management API. Defaults to: https://api.configcat.com.
   - `Dashboard Base URL`: the base URL for ConfigCat Dashboard. Defaults to: https://app.configcat.com.

## Usage of ConfigCat Feature Flags Views
The ConfigCat Feature Flags Views can be opened by clicking the ConfigCat Feature Flags icon on the Activity Bar. There are three different views.

Check out the [documentation] (https://configcat.com/docs/integrations/vscode/) to learn more about the Views and the ConfigCat Visual Studio Code extension.


### Products & Configs View
On the Products & Configs View, you can: 
- View all of your Products & Configs.
- Create Configs under a Product.
- Connect a Config to your current Workspace.
- Open your Configs on the ConfigCat Dashboard.

<img src="resources/help/prod_config_view.gif" alt="Usage of ConfigCat Products & Configs View"  width="100%"/>  

### Feature Flags & Settings View
After you successfully connect a Config to your Workspace from the Feature Flags & Settings View, you can:
- Turn features On / Off right from Visual Studio Code.
- Add Targeting or Percentage Rules from Visual Studio Code.
- View or Update your Feature Flag's value.
- View the connected Config's Feature Flags.
- Create new Feature Flags.
- Copy a Feature Flag's key to the clipboard.
- Find your Feature Flag's usages in your code.

<img src="resources/help/ff_setting_view.gif" alt="Usage of ConfigCat Feature Flags and Settings View"  width="100%"/>  

### Help & Feedback View
The Help & Feedback view provides quick links to open ConfigCat's Documentation and Dashboard and allows you to report issues.

## License
[MIT](https://raw.githubusercontent.com/configcat/vscode-extension-configcat/main/LICENSE)

## Contribution
Contributions are welcome.

## Useful links
- [ConfigCat](https://configcat.com)
- [Github](https://github.com/configcat)
- [Documentation](https://configcat.com/docs)
- [Blog](https://configcat.com/blog)