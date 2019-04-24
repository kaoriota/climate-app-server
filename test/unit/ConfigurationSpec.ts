import { assert } from "chai";
import { slow, suite, test, timeout } from "mocha-typescript";

import { Configuration } from "app/Configuration";
import { Database } from "app/frameworks/database/Database";

import { DatabaseRequiredBaseSpec } from "test/unit/DatabaseRequiredBaseSpec";

@suite(timeout(3000), slow(1000))
class ConfigurationSpec extends DatabaseRequiredBaseSpec {

  @test("Configuration.setting should be loaded from database")
  public async getTestConfiguration(): Promise<void> {
    const actual = (await Configuration.setting).LOG_LEVEL;
    assert.equal(actual.name, "LOG_LEVEL");
  }

}