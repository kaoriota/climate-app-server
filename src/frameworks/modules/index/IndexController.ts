import { Get, JsonController, Param, Post } from "routing-controllers";
import { Inject } from "typedi";

import { BaseController } from "app/frameworks/controllers/BaseController";
import { IndexFacade } from "app/frameworks/modules/index/IndexFacade";

@JsonController("")
export class IndexController extends BaseController {

  @Inject(type => IndexFacade)
  private _indexFacade: IndexFacade;

  @Get()
  public index() {
    return {
      status: "OK"
    };
  }
}