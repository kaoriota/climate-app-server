
import { Context } from "koa";
import { KoaMiddlewareInterface, Middleware } from "routing-controllers";
import { Inject } from "typedi";
import * as uuid from "uuid";

import { License } from "app/frameworks/services/License/License";
import { MiddlewareExecutor } from "app/frameworks/utils/MiddlewareExecutor";

@Middleware({ type: "before" })
export class RequestIdGenerator implements KoaMiddlewareInterface {

  @Inject(type => License)
  public _license: License;

  public async use(context: Context, next: MiddlewareExecutor): Promise<void> {
    const id = uuid.v4();
    context.state.requestId = id;
    await next();
  }
}
