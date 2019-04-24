// Update with your config settings.
import * as DotEnv from "dotenv";

DotEnv.config();

module.exports.development = module.exports.staging = module.exports.production = {

    client: process.env.DATABASE__DRIVER,
    connection: {
        host: process.env.DATABASE__HOST,
        database: process.env.DATABASE__DATABASE,
        user: process.env.DATABASE__USER,
        password: process.env.DATABASE__PASSWORD
    },
    pool: {
        min: parseInt(process.env.DATABASE__POOL_MIN),
        max: parseInt(process.env.DATABASE__POOL_MAX),
        refreshIdle: false
    }
};
