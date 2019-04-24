import { assert, expect } from "chai";
import * as _ from "lodash";
import { slow, suite, test, timeout } from "mocha-typescript";
import * as mongoose from "mongoose";

import { AppConfiguration } from "app/Configuration";
import { Database } from "app/frameworks/database/Database";
import { MongoDb } from "app/frameworks/database/MongoDb";
import { Container, ContainerInstance } from "typedi";

@suite(timeout(3000), slow(1000))
class MongoDbSpec {
  @test("MongoDb")
  public async mongoDbTest() {
    MongoDb.createConnection("test", "mongodb://139.5.144.63:27017/test", { useNewUrlParser: true });
    const mongoDb = await MongoDb.getConnection("test").mongoose;
    
    const testSchema = new mongoose.Schema({
      id: String,
      key: String,
      value: String
    });
    
    const testModel = mongoDb.model("test", testSchema);

    // INSERT
    await testModel.create({id: 1, key: "key", value: "value"});

    // QUERY
    await testModel.find({}, (err, data) => {
      if (err) { throw err; }
      // tslint:disable:no-any
      assert.equal((_.head(data) as any).value, "value");
    });

    // UPDATE
    await testModel.findOneAndUpdate({id: 1}, {value: "value2"}, (err, update) => {
      if (err) { throw err; }
    });

    // QUERY
    await testModel.find({}, (err, data) => {
      if (err) { throw err; }
      assert.equal((_.head(data) as any).value, "value2");
    });

    // REMOVE
    await testModel.findOneAndRemove({id: 1}, (err, remove) => {
      if (err) { throw err; }
    });

    // QUERY
    await testModel.find({}, (err, data) => {
      if (err) { throw err; }
      assert.equal(_.isEmpty(data), true);
    });
  }
}