import { Context } from "koa";
import { KoaMiddlewareInterface, Middleware } from "routing-controllers";
import { Container, Inject } from "typedi";

import { ILogger, LoggerService } from "app/frameworks/services/Logger/ILogger";
import { MiddlewareExecutor } from "app/frameworks/utils/MiddlewareExecutor";

const UNKNOWN_ERROR_CODE = 400;

@Middleware({ type: "before" })
export class ErrorResponder implements KoaMiddlewareInterface {

  public async use(context: Context, next: MiddlewareExecutor) {
    const logger = Container.get(LoggerService);

    try {
      await next();

      const requestMetadata = {
        requestId: context.state.requestId,
        method: context.request.method,
        url: context.request.url,
        status: context.status,
        response: context.body,
        ipAddress: context.request.ip,
        userAgent: context.request.header["user-agent"]
      };

      logger.info(
        `${context.request.method} ${context.request.url}: ` +
        `${context.status}`,
        requestMetadata
      );

    } catch (error) {

      context.status =
        error.status ||
        error.statusCode ||
        error.httpCode ||
        (error.response && error.response.status) ||
        UNKNOWN_ERROR_CODE;

      if (!error.message) {
        context.body = error;
      } else {
        context.body = {
          status: context.status,
          message: error.message || error.name || "",
          errors: (error.errors) ? error.errors : undefined
        };
      }

      const requestMetadata = {
        requestId: context.state.requestId,
        method: context.request.method,
        url: context.request.url,
        response: JSON.stringify(context.body, null, 4),
        ipAddress: context.request.ip,
        userAgent: context.request.header["user-agent"]
      };

      const errorBody = {
        message: error.message,
        stack: error.stack
      };

      if (context.status === UNKNOWN_ERROR_CODE) {
        requestMetadata.response = JSON.stringify(
          {
            body: context.body,
            error: errorBody
          },
          null,
          4
        );
        logger.error(
          `${context.request.method} ${context.request.url}: ` +
          `${context.status}`,
          requestMetadata
        );
      } else {
        logger.error(
          `${context.request.method} ${context.request.url}: ` +
          `${context.status}`,
          requestMetadata
        );
      }
    }
  }
}
