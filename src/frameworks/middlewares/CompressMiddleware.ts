import { Context } from "koa";
import * as KoaNativeCompress from "koa-compress";
import { KoaMiddlewareInterface, Middleware } from "routing-controllers";
import * as zlib from "zlib";

import { MiddlewareExecutor } from "app/frameworks/utils/MiddlewareExecutor";

@Middleware({ type: "before" })
export class CompressMiddleware implements KoaMiddlewareInterface {

  public compress = KoaNativeCompress({
    threshold: 1000,
    flush: zlib.Z_SYNC_FLUSH
  });

  public async  use(context: Context, next: MiddlewareExecutor) {
    await this.compress(context, next);
  }

}