import * as minimist from "minimist";
import { MongoClient } from "mongodb";

import { Application } from "app/Application";
import { Configuration } from "app/Configuration";

export const args = minimist(process.argv.slice(2));
export const app = new Application();

if (args.generateSwagger) {
  app.start(Configuration.system.PORT)
    .then(() => app.generateSwaggerDocs())
    .then(() => console.log("Swagger is generated"))
    .then(() => process.exit());
} else {
  app.start(Configuration.system.PORT);
}
