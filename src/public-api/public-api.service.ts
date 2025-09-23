import {
  ConfigsApi,
  Configuration,
  EnvironmentsApi,
  FeatureFlagsSettingsApi, MeApi,
  ProductsApi } from "configcat-publicapi-node-client";
import { PublicApiConfiguration } from "./public-api-configuration";

export class PublicApiService {

  public static defaultBasePath = "https://api.configcat.com";

  createMeService(publicApiConfiguration: PublicApiConfiguration, basePath: string) {
    const configuration = this.convertPublicApiConfigurationToConfiguration(publicApiConfiguration);
    return new MeApi(configuration, basePath ?? PublicApiService.defaultBasePath);
  }

  createProductsService(publicApiConfiguration: PublicApiConfiguration, basePath: string) {
    const configuration = this.convertPublicApiConfigurationToConfiguration(publicApiConfiguration);
    return new ProductsApi(configuration, basePath ?? PublicApiService.defaultBasePath);
  }

  createConfigsService(publicApiConfiguration: PublicApiConfiguration, basePath: string) {
    const configuration = this.convertPublicApiConfigurationToConfiguration(publicApiConfiguration);
    return new ConfigsApi(configuration, basePath ?? PublicApiService.defaultBasePath);
  }

  createEnvironmentsService(publicApiConfiguration: PublicApiConfiguration, basePath: string) {
    const configuration = this.convertPublicApiConfigurationToConfiguration(publicApiConfiguration);
    return new EnvironmentsApi(configuration, basePath ?? PublicApiService.defaultBasePath);
  }

  createSettingsService(publicApiConfiguration: PublicApiConfiguration, basePath: string) {
    const configuration = this.convertPublicApiConfigurationToConfiguration(publicApiConfiguration);
    return new FeatureFlagsSettingsApi(configuration, basePath ?? PublicApiService.defaultBasePath);
  }

  convertPublicApiConfigurationToConfiguration(publicApiConfiguration: PublicApiConfiguration): Configuration {
    return new Configuration({ username: publicApiConfiguration.basicAuthUsername, password: publicApiConfiguration.basicAuthPassword });
  }
}

