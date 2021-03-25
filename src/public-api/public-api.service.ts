import {
    ConfigsApi,
    FeatureFlagsSettingsApi,
    MeApi, ProductsApi
} from 'configcat-publicapi-node-client';
import { PublicApiConfiguration } from './public-api-configuration';

export class PublicApiService {

    private defaultBasePath = 'https://api.configcat.com';

    createMeService(configuration: PublicApiConfiguration) {
        return new MeApi(configuration.basicAuthUsername, configuration.basicAuthPassword, configuration.basePath ?? this.defaultBasePath);
    }

    createProductsService(configuration: PublicApiConfiguration) {
        return new ProductsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, configuration.basePath ?? this.defaultBasePath);
    }

    createConfigsService(configuration: PublicApiConfiguration) {
        return new ConfigsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, configuration.basePath ?? this.defaultBasePath);
    }

    createSettingsService(configuration: PublicApiConfiguration) {
        return new FeatureFlagsSettingsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, configuration.basePath ?? this.defaultBasePath);
    }
}

