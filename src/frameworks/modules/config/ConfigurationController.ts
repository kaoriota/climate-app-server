import * as MemoryCache from "memory-cache";
import { Delete, Get, JsonController, Param, Post } from "routing-controllers";
import { Inject } from "typedi";

import { BaseController } from "app/frameworks/controllers/BaseController";
import { ConfigurationFacade } from "app/frameworks/modules/config/ConfigurationFacade";

@JsonController("config")
export class ConfigurationController extends BaseController {

  private _cache: MemoryCache.CacheClass<string, string>;

  @Inject(type => ConfigurationFacade)
  private _configurationFacade: ConfigurationFacade;

  @Get("")
  public async index() {
    const response = await this._configurationFacade.getConfigurations();

    const requestMetadata = {
      response
    };

    this._logger.debug(
      "Configuration\n" + JSON.stringify(response, null, 4),
      requestMetadata
    );

    return {
      status: "OK"
    };
  }

  @Get("/system")
  public async getSystemConfiguration() {
    const response = await this._configurationFacade.getSystemConfiguration();

    const requestMetadata = {
      response
    };

    this._logger.debug(
      "System configuration\n" + JSON.stringify(response, null, 4),
      requestMetadata
    );

    return {
      status: "OK"
    };
  }

  @Get("/setting")
  public async getSettingConfiguration() {
    const response = await this._configurationFacade.getSettingConfiguration();

    const requestMetadata = {
      response
    };

    this._logger.debug(
      "Setting configuration\n" + JSON.stringify(response, null, 4),
      requestMetadata
    );
    
    return {
      status: "OK"
    };
  }

  @Delete("/setting")
  public async deleteSettingConfiguration() {
    this._cache.del("setting");
    
    return {
      status: "OK"
    };
  }
}