import * as _ from "lodash";
import { Service } from "typedi";
import * as winston from "winston";

// tslint:disable-next-line:no-require-imports
import Elasticsearch = require("winston-elasticsearch");

import { Configuration } from "app/Configuration";
import { DefaultMapping } from "app/frameworks/services/Logger/ElasticsearchMapping";
import { ILogger, LoggerService } from "app/frameworks/services/Logger/ILogger";
import { WinstonLogger } from "app/frameworks/services/Logger/WinstonLogger";

export const DEFAULT_SCOPE = "app";

@Service()
export class WinstonElasticsearchLogger extends WinstonLogger implements ILogger {

  // tslint:disable:unified-signatures
  constructor(scope: string);

  constructor(option: {
    scope?: string
    endpoint?: string,
    indexPrefix?: string
  });

  // tslint:disable:no-any
  constructor(scopeOrOptions?: any) {
    if (typeof (scopeOrOptions) === "string") {
      super(scopeOrOptions);
    } else {
      super(scopeOrOptions.scope);

      if (!scopeOrOptions.endpoint) {
        throw new Error("Elasticsearch endpoint not specified");
      }

      const esTransportOpts = {
        level: "",
        indexPrefix: scopeOrOptions.indexPrefix,
        messageType: "_doc",
        clientOpts: {
          host: scopeOrOptions.endpoint,
          apiVersion: "6.x"
        },
        mappingTemplate: DefaultMapping,
        transformer: (metadata: any) => {
          const transformed: any = {};
          transformed["@timestamp"] = metadata.timestamp ? metadata.timestamp : new Date().toISOString();
          transformed.message = metadata.message;
          transformed.severity = metadata.level;
          transformed.fields = metadata.meta;
          transformed.status = (metadata.meta) ? metadata.meta.status : undefined;
          transformed.requestId = (metadata.meta) ? metadata.meta.requestId : undefined;
          return transformed;
        }
      };

      const esLogger = new Elasticsearch(esTransportOpts);
      this.winston.add(esLogger, {}, true);

      this.info("Elasticsearch enabled");
    }
  }
}
