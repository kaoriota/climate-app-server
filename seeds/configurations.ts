import * as Knex from "knex";
import * as _ from "lodash";

const now = new Date();
now.toISOString();
const datas = [
  {
    name: "LOG_LEVEL",
    description: "Log level to display",
    example: "debug",
    value: "",
    type: "",
    create_at: now,
    created_at: now,
    updated_at: now
  }
];

exports.seed = async (knex: Knex) => {
  return knex("configurations")
    .then((rows: [{ name: string }]) => {
      const newInsert = _.differenceWith(datas, rows, (data, row) => {
        return data.name === row.name;
      });
      return knex("configurations").insert(newInsert);
    });
};
