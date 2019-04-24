import { Container } from "typedi";

import { Configuration } from "app/Configuration";
import { LoggerService } from "app/frameworks/services/Logger/ILogger";
import { WinstonElasticsearchLogger } from "app/frameworks/services/Logger/WinstonElasticsearchLogger";
import { WinstonLogger } from "app/frameworks/services/Logger/WinstonLogger";
import { WinstonLogstashLogger } from "./frameworks/services/Logger/WinstonLogstashLogger";

export async function registerDependencies() {
  Container.set(LoggerService, new WinstonLogger());
  console.log(Configuration.system.LOG_LOGSTASH_ENABLED);
  if (Configuration.system.LOG_ES_ENABLED) {
    console.log("Elasticsearch enabled");
    Container.set(LoggerService, new WinstonElasticsearchLogger({
      scope: Configuration.system.APP_NAME,
      endpoint: Configuration.system.LOG_ES_ENDPOINT,
      indexPrefix: Configuration.system.LOG_ES_PREFIX
    }));
  }
  if (Configuration.system.LOG_LOGSTASH_ENABLED) {
    console.log("Logstash enabled");
    Container.set(LoggerService, new WinstonLogstashLogger({
      scope: Configuration.system.APP_NAME,
      host: Configuration.system.LOG_LOGSTASH_HOST,
      port: Configuration.system.LOG_LOGSTASH_PORT
    }));
  }
}
