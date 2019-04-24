import { Inject } from "typedi";

import { Database } from "app/frameworks/database/Database";
import { ILogger, LoggerService } from "app/frameworks/services/Logger/ILogger";

export abstract class BaseController {

  @Inject(LoggerService)
  protected _logger: ILogger;

  protected get logger(): ILogger {
    if (!this._logger) {
      throw new Error("Logger is not injected");
    }
    return this._logger;
  }
}