import * as mongoose from "mongoose";
import { Container, Service } from "typedi";

import { Configuration } from "app/Configuration";

// tslint:disable:no-any
@Service()
export class MongoDb {
  protected _mongoose: mongoose.Connection;

  constructor(connectionString: string, options?: any) {
    this._mongoose = mongoose.connect(connectionString, options);
  }

  public static getConnection(connectionName: string): MongoDb {
    return Container.get(connectionName);
  }

  public static createConnection(connectionName: string, connectionString: string, options?: any) {
    Container.set(connectionName, (new MongoDb(connectionString, options))._mongoose);
  }

  public get mongoose() {
    return this._mongoose;
  }
}