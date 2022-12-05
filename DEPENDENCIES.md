# How to update dependencies (security)

1. Update the `ng-configcat-publicapi` and `ng-configcat-publicapi-ui` packages if necessary (./webpanel/package.json)
1. `npm audit fix`
1. `cd webpanel` & `npm audit fix`
1. If there were fixes, create a pull request with the changes
1. If necessary, [Deploy](DEPLOY.md) a new version.