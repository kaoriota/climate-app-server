import { assert } from "chai";
import { slow, suite, test, timeout } from "mocha-typescript";

import { Configuration } from "app/Configuration";
import { Database } from "app/frameworks/database/Database";

export abstract class DatabaseRequiredBaseSpec {

  private _migrationOption = {
    directory: "./dist/migrations",
    tableName: "_migrations"
  };

  private _seedOption = {
    directory: "./dist/seeds"
  };
}