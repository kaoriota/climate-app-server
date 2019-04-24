import * as Knex from "knex";
import { Container, Service } from "typedi";

import { Configuration } from "app/Configuration";

@Service()
export class Database {
  private static _instance: Database;
  protected _knex: Knex;

  constructor(connectionSetting?: Knex.Config) {
    this._knex = (connectionSetting) ?
      Knex(connectionSetting) : Knex(Configuration.system.DATABASE);
  }

  public static get instance(): Database {
    if (!Database._instance) {
      Database._instance = new Database();
    }

    return Database._instance;
  }

  public get knex(): Knex {
    return this._knex;
  }

  public static getConnection(connectionName: string): Database {
    return Container.get(connectionName);
  }

  public static createConnection(connectionName: string, connectionSetting: Knex.Config) {
    Container.set(connectionName, new Database(connectionSetting));
  }
}
