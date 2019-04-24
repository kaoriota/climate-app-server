import { assert, expect } from "chai";
import { slow, suite, test, timeout } from "mocha-typescript";

import { AppConfiguration } from "app/Configuration";
import { Database } from "app/frameworks/database/Database";
import { Container } from "typedi";

@suite(timeout(3000), slow(1000))
class DatabaseSpec {

  @test("Database should be singleton")
  public shouldBeSingleton(): void {
    let database = Database.instance;

    expect(() => database = new Database())
      .to.throw("Use Database.instance instead of new.");
  }

  @test("DB connection via knex should be success")
  public shouldConnectSuccessViaKnex(): void {
    const knex = Database.instance.knex;

    expect(() => knex.raw("SELECT 1+1 as RESULT")).to.not.throw();
  }
}