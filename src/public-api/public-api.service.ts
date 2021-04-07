import {
    ConfigsApi,
    FeatureFlagsSettingsApi,
    MeApi, ProductsApi
} from 'configcat-publicapi-node-client';
import { PublicApiConfiguration } from './public-api-configuration';

export class PublicApiService {

    public static defaultBasePath = 'https://api.configcat.com';

    createMeService(configuration: PublicApiConfiguration) {
        return new MeApi(configuration.basicAuthUsername, configuration.basicAuthPassword, configuration.basePath ?? PublicApiService.defaultBasePath);
    }

    createProductsService(configuration: PublicApiConfiguration) {
        return new ProductsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, configuration.basePath ?? PublicApiService.defaultBasePath);
    }

    createConfigsService(configuration: PublicApiConfiguration) {
        return new ConfigsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, configuration.basePath ?? PublicApiService.defaultBasePath);
    }

    createSettingsService(configuration: PublicApiConfiguration) {
        return new FeatureFlagsSettingsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, configuration.basePath ?? PublicApiService.defaultBasePath);
    }
}

