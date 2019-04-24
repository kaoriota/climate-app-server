# Nipa.Cloud new base project (new Framework)

## Application Startup Class
ตัว base project ได้มีการเตรียมส่วนประกอบบางส่วนไว้ให้แล้วเช่น middleware request logger, winston logger, dependency injection container

ตัว framework จะเริ่มทำงานจาก Application class ที่ extends จาก `BaseApplication` การ register controller และ middlewares ให้ทำใน constructor ของ Application class หรือทำก่อนจะเรียก `Application.start(port)` ก็ได้

```typescript
import { Configuration } from "app/Configuration";
import { BaseApplication } from "app/frameworks/BaseApplication";
import { ErrorResponder } from "app/frameworks/middlewares/ErrorResponder";
import { RequestIdGenerator } from "app/frameworks/middlewares/RequestIdGenerator";
import { RequestLogger } from "app/frameworks/middlewares/RequestLogger";

import { SystemController } from "app/modules/system/SystemController";

export class Application extends BaseApplication {

  public registerDependencies = registerDependencies;

  constructor() {
    super();

    this.useController(IndexController);

    this.useMiddleware(ErrorResponder);
    this.useMiddleware(RequestIdGenerator);
    this.useMiddleware(RequestLogger);
    this.useMiddleware(RequestContainerCleanUp);
    this.useNativeMiddleware(kcors({
      origin: "*",
      allowHeaders: ["Content-Type", "black-box", "project-id", "x-auth-token", "description"]
    }));
  }
}
```


## Configuration class
การกำหนดค่า configuration จะทำผ่าน `Configuration` class โดยสร้างได้ 2 แบบคือ
- implement `IConfiguration<TSystem extends ISystemProperties>`
- extends `BaseConfiguration<TSystem extends ISystemProperties>` (Recommended)

Configuration จะนิยามไว้ 2 ส่วนด้วยกันคือ
- system เป็น configuration ที่ได้จากการโหลดจาก .env มี type เป็น `TSystem`
- setting เป็น configuration ที่ได้จาก source อื่นเช่น database มี type เป็น `ISystemProperties`

`BaseConfiguration` มีการเตรียม caching สำหรับ setting ไว้ โดยจะเรียก `loadSettings()` เมื่อต้องการ load ค่าจาก source

ข้อควรระวัง:
- ไฟล์ Configuration.ts ต้องอยู่ใน source folder
- ภายในไฟล์ ต้อง `export const Configuration = <configuration class instance>`
- Configuration class ควรเป็น singleton

## Middlewares
การสร้าง middleware ทำโดยการ implements `KoaMiddlewareInterface`
```typescript
import { MiddlewareExecutor } from "app/frameworks/utils/MiddlewareExecutor";
import { Context } from "koa";
import { KoaMiddlewareInterface, Middleware } from "routing-controllers";
import * as uuid from "uuid";

@Middleware({type: "before"})
export class RequestIdGenerator implements KoaMiddlewareInterface {

  public async use(context: Context, next: MiddlewareExecutor): Promise<void> {
    const id = uuid.v4();
    context.state.requestId = id;
    await next();
  }
}

```
ดูวิธีใช้เพิ่มเติมที่ https://github.com/typestack/routing-controllers

## File Structures
ไฟล์ต่างๆ ที่สร้างขึ้นใน folder src จะวางอยู่ในโครงสร้างดังนี้
- src
  - middlewares : middleware ที่สร้างเพิ่ม
  - services : service ที่สร้างเพิ่ม
  - utils : utility class ที่สร้างเพิ่ม
  - modules : module ต่างๆ ของ app

## Modules
โมดูลต่างๆ ของ app (controller) จะถูกวางไว้ในโฟลเดอร์ `modules/<Module name>` โดยไฟล์ที่เกี่ยวข้องจะมีดังต่อไปนี้
- `<Module Name>Controller.ts` controller ของ module
- `<Module Name>Facade.ts` Facade (low level logic) ของ module
- `<Module Name>Requests.ts` Request model ทั้งหมดของ module
- `<Module Name>Responses.ts` Response model ทั้งหมดของ module
ในกรณีที่มีการทำ versioning ของ controller ให้สร้าง controller file แยกโดยระบุเป็น V2Controller.ts, V3Controller.ts

## Controllers
class สามารถเป็น controller เมื่อใช้ `@Controller` decorator ระบุไว้บนส่วนประกาศ class โดยจะต้องระบุ routing ของ controller ไว้ด้วย

method ต่างๆ ของ controller class สามารถมี route ย่อยตาม request method ได้
```typescript
import { IsDefined } from "class-validator";
import { Body, Controller, Get, HeaderParam, JsonController, Param, Post } from "routing-controllers";
import { Inject } from "typedi";

import { BaseController } from "app/frameworks/controllers/BaseController";
import { ValidationError } from "app/frameworks/utils/ErrorResponse";

import { SystemFacade } from "app/modules/system/SystemFacade";
import { GetComponentHealthCheckResponse } from "app/modules/system/SystemResponses";

@JsonController("v1/system")
export class SystemController extends BaseController {

  @Inject()
  private systemFacade: SystemFacade;

  @Get()
  public index() {
    return {
      data: "success"
    };
  }

  @Get("/health/:component")
  public getComponentHealthCheck(@Param("component") component: string): GetComponentHealthCheckResponse {
    const healthCheckResult = this.systemFacade.getComponentHealthCheck(component);

    return healthCheckResult;
  }
}
```

## Service Dependency Injection
Service Class เป็น class ที่มีการระบุ `@Service()` ไว้บน class สามารถเรียกใช้งานผ่าน dependency injection ได้โดยการระบุ `@Inject()` บนตัวแปรที่ต้องการให้ใช้ instance จาก service container

หากต้องการใช้งานแบบ typesafe DI (ผ่าน interface) จะต้องสร้าง service token แล้ว register ลงใน container ก่อนเรียกใช้

```typescript
import { Token } from "typedi";

export interface ILogger {
  debug(message: string, ...args: object[]): void;
  info(message: string, ...args: object[]): void;
  warn(message: string, ...args: object[]): void;
  error(message: string, ...args: object[]): void;
}

export const LoggerService = new Token<ILogger>();

// Register WinstonLogger as LoggerService
Container.set(LoggerService, new WinstonLogger());

// Use ILogger from service container
@Inject(LoggerService)
protected logger: ILogger;
```
ดูเพิ่มเติมที่
routing-controllers https://github.com/typestack/routing-controllers
typedi https://github.com/typestack/typedi

## Global dependencies wiring
implement abstract `Application.registerDependencies` เป็น `async(): Promise<void>` function

DependenciesSetup.ts
```typescript
import { Container } from "typedi";

import { Configuration } from "app/Configuration";
import { LoggerService } from "app/frameworks/services/Logger/ILogger";
import { WinstonElasticsearchLogger } from "app/frameworks/services/Logger/WinstonElasticsearchLogger";
import { WinstonLogger } from "app/frameworks/services/Logger/WinstonLogger";

export async function registerDependencies() {
  Container.set(LoggerService, new WinstonLogger());

  Configuration.setting.then((config) => {
  if (config.LOG_ES_ENABLED && config.LOG_ES_ENABLED.value === "true") {
    Container.set(LoggerService, new WinstonElasticsearchLogger({
    endpoint: config.LOG_ES_ENDPOINT.value,
    indexPrefix: config.LOG_ES_PREFIX.value,
    logLevels: config.LOG_ES_LEVELS.value,
    }));
  }
  });
}

```
Application.ts

```typescript
import { registerDependencies } from 'app/DependenciesSetup'

...

export class Application extends BaseApplication {
  public registerDependencies = registerDependencies;
  ...
}
```

## Scoped DI Container
หากต้องการใช้ DI container per request ให้ใช้ `@RequestScopeContainer` decorator ที่ controller action parameter โดยใช้ร่วมกับ middleware `RequestIdGenerator` และ `RequestScopeContainerCleanup`

```typescript
 @Get()
  public async profile(@RequestScopeContainer() container: ContainerInstance) {
  const memberService: MemberService = container.get(MemberService);
  const response = await memberService.getProfile();
  return response;
  }
```


## Database
การเชื่อมต่อ database จะทำผ่าน class `Database` ซึ่งเตรียม connection ของ `knex` และ `bookshelf` ไว้ให้ โดยเรียกจาก `Database.instance.knex` หรือ `Database.instance.bookshelf`

วิธีการใช้ knex และ bookshelf ดูได้จาก
knex http://knexjs.org/
bookshelf http://bookshelfjs.org/

## Code Styling
- ใช้ 1 Tab = 2 space
- เปิด (, { อยู่บนบรรทัดเดียวกับ statement เสมอ
- 1 บรรทัดไม่ควรยาวเกิน 120 ตัวอักษร ถ้าเป็น parameter ให้ขึ้นบรรทัดใหม่แยกตัว

```typescript
  // Define function

  public async createUser(
    email: string,
    password: string,
    name: string,
    defaultProjectId: string,
    domainId: string
  ): Promise<IUserDetail> {

  }

  // Function call
  const response = await httpClient.post<ICreateUserRequest, IUserDetail>(
      "users",
      {
        headers: {
          "X-Auth-Token": await this._identityClient.admin.token.getAdminToken(),
          projectId: OpenStack.option.adminCredential.adminProjectId
        }
      },
      {
        user: {
          email,
          password,
          domain_id: domainId,
          enabled: true,
          name: email,
          default_project_id: defaultProjectId,
          description: name
        }
      }
    );
```

- interface ขึ้นต้นด้วย I เสมอ

```typescript
export interface ILogger {
  debug(message: string, ...args: object[]): void;
  info(message: string, ...args: object[]): void;
  warn(message: string, ...args: object[]): void;
  error(message: string, ...args: object[]): void;
}
```

- อื่นๆ ให้ยึดตาม tslint.json
