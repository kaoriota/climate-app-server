import { ISystemProperties } from "app/frameworks/configuration/ConfigurationInterfaces";

export interface IApiSystemProperties extends ISystemProperties {
  HTTP_POOL: number;
  ZOOKEEPER_HOST: string;
  KAFKA_HOST: string;
}
