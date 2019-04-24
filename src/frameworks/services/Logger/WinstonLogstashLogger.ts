import * as winston from "winston";
import * as WinstonLogstashTransporter from "winston-logstash-transport";

import { Configuration } from "app/Configuration";
import { WinstonLogger } from "app/frameworks/services/Logger/WinstonLogger";

// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
const LogStashUdpTransport = require("winston-logstash-udp").LogstashUDP;
require("winston-logstash");

export class WinstonLogstashLogger extends WinstonLogger {

  // tslint:disable:unified-signatures
  constructor(scope: string);

  constructor(option: {
    scope?: string
    host: string,
    port: number,
  });

  // tslint:disable:no-any
  constructor(scopeOrOptions?: any) {
    if (typeof (scopeOrOptions) === "string") {
      super(scopeOrOptions);
    } else {
      super(scopeOrOptions.scope);

      this.winston.add(
        winston.transports.Logstash,
        {
          port: scopeOrOptions.port,
          node_name: scopeOrOptions.scope,
          host: scopeOrOptions.host
        },
        true);
    }
  }
}