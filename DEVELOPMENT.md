# Development
## Modules
The code is splitted into 2 parts.

### Webpanel
The webpanel is an Angular project, which can show and update Feature Flag values.
Source: `./webpanel`
Build it with `npm run webpanel-build`

### VS Code extension
Source: `./src`
Build it with `npm run esbuild` or run it with hitting F5 in VSCode

## Packaging
To create a vsix package run `npm run package`. 
This package can be installed in VSCode/Extensions/... menu/Install from VSIX package.