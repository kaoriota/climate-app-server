import * as Knex from "knex";

export interface ISystemProperties {
  APP_NAME: string;
  PORT: number;
  VERSION: string;
  ROOT_PREFIX: string;
  REQUEST_LOG: string;
  LOG_LEVEL: string;
  LOG_ES_ENABLED: boolean;
  LOG_ES_ENDPOINT: string;
  LOG_ES_PREFIX: string;
  LOG_LOGSTASH_ENABLED: boolean;
  LOG_LOGSTASH_HOST: string;
  LOG_LOGSTASH_PORT: number;
  REPLICATION_FACTOR: number;
  SETTING_CACHE_TIMEOUT: number;

  BOOKSHELF_ENABLED: boolean;
  DATABASE: Knex.Config | Knex.MySqlConnectionConfig;
}

export interface ISettingProperties {
  [key: string]: {
    id: number,
    name: string,
    description: string,
    example: string,
    value: string,
    type: string,
    createAt: Date,
    updatedAt: Date
  };
}

export interface IConfiguration<TSystem extends ISystemProperties> {
  system: TSystem;
  setting: Promise<ISettingProperties>;

  loadSettings(): Promise<ISettingProperties>;
}