import * as DotEnv from "dotenv";
import * as _ from "lodash";
import { Cache, CacheClass } from "memory-cache";
import { Inject, Service } from "typedi";

import { BaseConfiguration } from "app/frameworks/configuration/BaseConfiguration";
import {
  IConfiguration,
  ISettingProperties,
  ISystemProperties
} from "app/frameworks/configuration/ConfigurationInterfaces";

import { Database } from "app/frameworks/database/Database";
import { ILogger, LoggerService } from "app/frameworks/services/Logger/ILogger";
import { IApiSystemProperties } from "app/IApiSystemProperties";

DotEnv.config();

@Service()
export class AppConfiguration extends BaseConfiguration<IApiSystemProperties> {

  private static _instance: AppConfiguration;

  public static get instance(): AppConfiguration {
    if (!AppConfiguration._instance) {
      AppConfiguration._instance = new AppConfiguration();
    }

    return AppConfiguration._instance;
  }

  constructor() {
    super();
    this.system.HTTP_POOL = parseInt(process.env.HTTP_POOL) || 50;
    this.system.ZOOKEEPER_HOST = process.env.ZOOKEEPER_HOST;
    this.system.KAFKA_HOST = process.env.KAFKA_HOST;
  }

  public async loadSettings(): Promise<ISettingProperties> {
    const setting: ISettingProperties = {};
    const settingQuery = await Database.instance.knex
      .select()
      .from("configurations")
      .then((items) => {
        _.forEach(items, (item) => {
          setting[item.name] = item;
        });
      });
    return setting;
  }
}

export const Configuration = AppConfiguration.instance;