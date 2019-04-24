import { IncomingMessage } from "http";
import { Context } from "koa";
import * as Morgan from "koa-morgan";
import { IMiddleware } from "koa-router";
import { KoaMiddlewareInterface, Middleware } from "routing-controllers";

import { MiddlewareExecutor } from "app/frameworks/utils/MiddlewareExecutor";

import { Configuration } from "app/Configuration";

@Middleware({ type: "before" })
export class RequestLogger implements KoaMiddlewareInterface {

  public async use(context: Context, next: MiddlewareExecutor) {
    const format =
      "[RQID=:request-id] - :remote-user " +
      "[:date[clf]] \":method :url HTTP/:http-version\" " +
      ":status :res[content-length] \":referrer\" \":user-agent\"";

    const morgan = Morgan;
    morgan.token("request-id", (req) => context.state.requestId);
    const morganMiddleware = morgan(format);
    if (Configuration.system.REQUEST_LOG) {
      await morganMiddleware(context, next);
    } else {
      await next();
    }
  }
}
