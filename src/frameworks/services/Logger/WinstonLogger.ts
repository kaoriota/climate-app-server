import { Service } from "typedi";
import * as winston from "winston";

import { Configuration } from "app/Configuration";
import { ILogger, LoggerService } from "app/frameworks/services/Logger/ILogger";

export const DEFAULT_SCOPE = "app";

@Service()
export class WinstonLogger implements ILogger {

  protected formatter = (options: winston.LoggerOptions) => options.meta && options.meta.requestId ?
    `[RQID=${options.meta.requestId}] ${options.message}` : `${options.message}`

  protected scope: string = DEFAULT_SCOPE;

  protected winston: winston.LoggerInstance;

  constructor(
    scope?: string
  ) {
    this.scope = scope || DEFAULT_SCOPE;

    this.winston = new winston.Logger({
      scope: this.scope,
      transports: [
        new (winston.transports.Console)({
          level: Configuration.system.LOG_LEVEL,
          formatter: this.formatter
        })
      ]
    });
  }

  public debug(message: string, args?: object): void {
    this.log("debug", message, args);
  }

  public info(message: string, args?: object): void {
    this.log("info", message, args);
  }

  public warn(message: string, args?: object): void {
    this.log("warn", message, args);
  }

  public error(message: string, args?: object): void {
    this.log("error", message, args);
  }

  private log(level: string, message: string, args?: object): void {
    if (this.winston) {
      this.winston.log(level, `${this.formatScope()} ${message}`, args);
    }
  }

  protected formatScope(): string {
    return `[${this.scope}]`;
  }

}