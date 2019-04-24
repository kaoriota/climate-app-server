import {
  getFromContainer as getFromValidationContainer,
  MetadataStorage
} from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import * as fs from "fs";
import * as Koa from "koa";
import * as _ from "lodash";
import "reflect-metadata";
import {
  getMetadataArgsStorage,
  useContainer as routingUseContainer,
  useKoaServer
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import * as swagger from "swagger2";
import { ui } from "swagger2-koa";
import { Container } from "typedi";

import { Server } from "http";
import { SchemaObject } from "openapi3-ts";

import { args } from "../server";

import { Configuration } from "app/Configuration";
import { LoggerService } from "app/frameworks/services/Logger/ILogger";
import { MiddlewareExecutor } from "app/frameworks/utils/MiddlewareExecutor";
import { AuthorizationChecker } from "routing-controllers/AuthorizationChecker";
import { CurrentUserChecker } from "routing-controllers/CurrentUserChecker";

// tslint:disable:ban-types
export abstract class BaseApplication {

  protected koa: Koa;
  protected server: Server;

  protected abstract registerDependencies?: () => Promise<void>;
  protected authorizationChecker?: AuthorizationChecker;
  protected currentUserChecker?: CurrentUserChecker;
  protected registerExternalSchema: (registerSchema: (schema: SchemaObject) => void) => void;

  private _controllers: string[] | Function[] = [];
  private _middlewares: string[] | Function[] = [];

  constructor() {
    routingUseContainer(Container);
    this.koa = new Koa();
  }

  public useNativeMiddleware(middleware: (context: Koa.Context, next: MiddlewareExecutor) => Promise<void> | void) {
    this.koa.use(middleware);
  }

  public useMiddleware<T extends string | Function>(middleware: T) {
    if (typeof (middleware) === "string") {
      (this._middlewares as string[]).push(middleware as string);
    } else {
      (this._middlewares as Function[]).push(middleware as Function);
    }
  }

  public useController<T extends string | Function>(controller: T) {
    if (typeof (controller) === "string") {
      (this._controllers as string[]).push(controller as string);
    } else {
      (this._controllers as Function[]).push(controller as Function);
    }
  }

  public async start(port: number): Promise<void> {
    if (this.registerDependencies) {
      await this.registerDependencies();
    }

    useKoaServer(this.koa, {
      defaultErrorHandler: false,
      routePrefix: Configuration.system.ROOT_PREFIX,
      controllers: this._controllers,
      middlewares: this._middlewares,
      authorizationChecker: this.authorizationChecker,
      currentUserChecker: this.currentUserChecker,
      validation: {
        validationError: {
          target: false
        }
      }
    });

    if (fs.existsSync("swagger.yml")) {
      const document = swagger.loadDocumentSync("swagger.yml");
      this.useNativeMiddleware(ui(document, `${Configuration.system.ROOT_PREFIX}docs/`));
    }

    this.server = this.koa.listen(port);
    Container.get(LoggerService).info(`Server started on port ${port}`);
    Container.get(LoggerService).info(`Kafka host: ${Configuration.system.KAFKA_HOST}`);

  }

  public async stop(port: number): Promise<void> {
    this.server.close();
    Container.get(LoggerService).info(`Server stoped on port ${port}`);
  }

  // tslint:disable:no-require-imports
  // tslint:disable:no-any
  public async generateSwaggerDocs() {
    const validationMetadatas = (getFromValidationContainer(MetadataStorage) as any).validationMetadatas;
    const schemas = validationMetadatasToSchemas(validationMetadatas, {
      refPointerPrefix: "#/components/schemas"
    });

    if (this.registerExternalSchema) {
      this.registerExternalSchema((schema) => {
        _.merge(schemas, schema);
      });
    }

    const metadataStorage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(
      metadataStorage,
      {
        defaultErrorHandler: false,
        routePrefix: Configuration.system.ROOT_PREFIX,
        controllers: this._controllers,
        middlewares: this._middlewares,
      },
      {
        components: {
          schemas
        }
      }
    );

    const appPackageInfo = require("../../package.json");
    spec.info.title = appPackageInfo.name;
    console.log("current directory: ", process.cwd());
    console.log("Writing openapi.json...");

    const stream = fs.createWriteStream("openapi.json");
    const promise = new Promise((resolve) => {
      stream.once("open", () => {
        stream.write(JSON.stringify(spec, null, 4));
        stream.end();
        console.log("Fisnish write openapi.json");

        const apiSpecConverter = require("api-spec-converter");
        apiSpecConverter.convert({
          from: "openapi_3",
          to: "swagger_2",
          source: "openapi.json",
        }).then((converted: any) => {
          let swaggerSpec: string = "";
          let swStream: fs.WriteStream;

          if (args.json) {
            swaggerSpec = JSON.stringify(converted.spec, null, 2);

            console.log("Writing swagger.json");
            swStream = fs.createWriteStream("swagger.json");
          } else {
            const yaml = require("js-yaml");
            swaggerSpec = yaml.dump(converted.spec);

            console.log("Writing swagger.yml");
            swStream = fs.createWriteStream("swagger.yml");
          }
          swStream.once("open", () => {
            swStream.write(swaggerSpec);
            swStream.end();
            resolve();
          });
        });
      });
    });

    return promise;
  }
}