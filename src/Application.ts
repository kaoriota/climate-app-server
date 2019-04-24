import * as kcors from "kcors";

import { registerDependencies } from "app/DependenciesSetup";
import { BaseApplication } from "app/frameworks/BaseApplication";
import { CompressMiddleware } from "app/frameworks/middlewares/CompressMiddleware";
import { ErrorResponder } from "app/frameworks/middlewares/ErrorResponder";
import { RequestContainerCleanUp } from "app/frameworks/middlewares/RequestContainerCleanUp";
import { RequestIdGenerator } from "app/frameworks/middlewares/RequestIdGenerator";
import { RequestLogger } from "app/frameworks/middlewares/RequestLogger";
import { IndexController } from "app/frameworks/modules/index/IndexController";

import { ConfigurationController } from "app/frameworks/modules/config/ConfigurationController";
import { ClimateController } from "./controllers/ClimateController";

export class Application extends BaseApplication {

  public registerDependencies = registerDependencies;

  constructor() {
    super();

    this.useController(ConfigurationController);
    this.useController(IndexController);
    this.useController(ClimateController);

    this.useMiddleware(RequestContainerCleanUp);
    this.useMiddleware(CompressMiddleware);
    this.useMiddleware(ErrorResponder);
    this.useMiddleware(RequestIdGenerator);

    this.useMiddleware(RequestLogger);
    this.useNativeMiddleware(kcors({
      origin: "*",
      allowHeaders: ["Content-Type", "black-box", "project-id", "x-auth-token", "description"]
    }));
  }
}
