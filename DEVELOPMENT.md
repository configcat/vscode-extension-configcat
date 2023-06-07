# Development
## Modules
The code is splitted into 2 parts.

### Webpanel
The webpanel is an Angular project, which can show and update Feature Flag values.
Source: `./webpanel`
Build it with `npm run webpanel-build`
 
#### Local cache
If the webpanel does not show changes made in the code or in the `ng-configcat-publicapi-ui` dependency the cache clean can help. In the webpanel folder use the following command: `ng cache clean`

### VS Code extension
Source: `./src`
Build it with `npm run esbuild` or run it with hitting F5 in VSCode

## Packaging
To create a vsix package run `npm run package`. 
This package can be installed in VSCode/Extensions/... menu/Install from VSIX package.