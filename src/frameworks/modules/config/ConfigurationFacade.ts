import { Configuration } from "app/Configuration";
import { Inject, Service } from "typedi";

@Service()
export class ConfigurationFacade {

  public async getConfigurations() {
    const config = {
      system: Configuration.system,
      setting: await Configuration.setting
    };
    return config;
  }

  public async getSettingConfiguration() {
    return (await this.getConfigurations()).setting;
  }

  public async getSystemConfiguration() {
    return (await this.getConfigurations()).system;
  }
}