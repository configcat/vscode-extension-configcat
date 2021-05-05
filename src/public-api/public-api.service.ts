import {
    ConfigsApi,
    EnvironmentsApi,
    FeatureFlagsSettingsApi,
    MeApi, ProductsApi
} from 'configcat-publicapi-node-client';
import { PublicApiConfiguration } from './public-api-configuration';

export class PublicApiService {

    public static defaultBasePath = 'https://api.configcat.com';

    createMeService(configuration: PublicApiConfiguration, basePath: string) {
        return new MeApi(configuration.basicAuthUsername, configuration.basicAuthPassword, basePath ?? PublicApiService.defaultBasePath);
    }

    createProductsService(configuration: PublicApiConfiguration, basePath: string) {
        return new ProductsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, basePath ?? PublicApiService.defaultBasePath);
    }

    createConfigsService(configuration: PublicApiConfiguration, basePath: string) {
        return new ConfigsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, basePath ?? PublicApiService.defaultBasePath);
    }

    createEnvironmentsService(configuration: PublicApiConfiguration, basePath: string) {
        return new EnvironmentsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, basePath ?? PublicApiService.defaultBasePath);
    }

    createSettingsService(configuration: PublicApiConfiguration, basePath: string) {
        return new FeatureFlagsSettingsApi(configuration.basicAuthUsername, configuration.basicAuthPassword, basePath ?? PublicApiService.defaultBasePath);
    }
}

