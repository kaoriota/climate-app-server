import { Context } from "koa";
import { KoaMiddlewareInterface, Middleware } from "routing-controllers";
import { Container, Inject } from "typedi";

import { MiddlewareExecutor } from "app/frameworks/utils/MiddlewareExecutor";

@Middleware({ type: "after" })
export class RequestContainerCleanUp implements KoaMiddlewareInterface {

  public async use(context: Context, next: MiddlewareExecutor) {
    Container.reset(context.state.requestId);
    await next();
  }
}
