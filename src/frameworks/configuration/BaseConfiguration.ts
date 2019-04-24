import * as Knex from "knex";
import * as MemoryCache from "memory-cache";

import {
  IConfiguration,
  ISettingProperties,
  ISystemProperties
} from "app/frameworks/configuration/ConfigurationInterfaces";
import { ILogger, LoggerService } from "app/frameworks/services/Logger/ILogger";
import { Inject } from "typedi";

export abstract class BaseConfiguration<TSystem extends ISystemProperties>
  implements IConfiguration<TSystem> {

  private _system: TSystem;
  private _cache: MemoryCache.CacheClass<string, ISettingProperties>;
  @Inject(LoggerService)
  protected logger: ILogger;

  public get system(): TSystem {
    return this._system;
  }

  public get setting(): Promise<ISettingProperties> {
    return (async () => {
      if (!this._cache) {
        this._cache = new MemoryCache.Cache();
      }
      const settings = this._cache.get("setting");
      if (!settings) {
        const settingsFromLoad: ISettingProperties = await this.loadSettings();
        this._cache.put("setting", settingsFromLoad, this.system.SETTING_CACHE_TIMEOUT);

        return settingsFromLoad;
      }
      return settings;
    })();
  }

  constructor() {
    // tslint:disable-next-line:no-object-literal-type-assertion
    this._system = {
      APP_NAME: process.env.APP_NAME || "app",
      PORT: parseInt(process.env.PORT),
      VERSION: process.env.VERSION,
      ROOT_PREFIX: process.env.ROOT_PREFIX,
      REQUEST_LOG: process.env.REQUEST_LOG,
      LOG_LEVEL: process.env.LOG_LEVEL,
      LOG_ES_ENABLED: process.env.LOG_ES_ENABLED === "true",
      LOG_ES_ENDPOINT: process.env.LOG_ES_ENDPOINT,
      LOG_ES_PREFIX: process.env.LOG_ES_PREFIX,
      LOG_LOGSTASH_ENABLED: process.env.LOG_LOGSTASH_ENABLED === "true",
      LOG_LOGSTASH_HOST: process.env.LOG_LOGSTASH_HOST,
      LOG_LOGSTASH_PORT: parseInt(process.env.LOG_LOGSTASH_PORT),
      REPLICATION_FACTOR: parseInt(process.env.REPLICATION_FACTOR),
      SETTING_CACHE_TIMEOUT: parseInt(process.env.SETTING_CACHE_TIMEOUT),
      BOOKSHELF_ENABLED: "true" === process.env.BOOKSHELF_ENABLED,
      DATABASE: {
        client: process.env.DATABASE__DRIVER,
        connection: {
          host: process.env.DATABASE__HOST,
          port: (process.env.DATABASE__PORT) ? parseInt(process.env.DATABASE__PORT) : 3306,
          user: process.env.DATABASE__USER,
          password: process.env.DATABASE__PASSWORD,
          database: process.env.DATABASE__DATABASE
        },
        pool: {
          min: parseInt(process.env.DATABASE__POOL_MIN),
          max: parseInt(process.env.DATABASE__POOL_MAX)
        }
      }
    } as TSystem;
  }
  public abstract loadSettings(): Promise<ISettingProperties>;
}
