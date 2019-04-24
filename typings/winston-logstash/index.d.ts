declare module "winston-logstash" {
  import winston = require("winston");
  interface IOptions {
    port: number;
    node_name: string;
    host: string;
  }

  interface Static {
    new (opts: IOptions): Instance;
  }

  interface Instance extends winston.TransportInstance {
  }

  module "winston" {
    interface Transports {
      Logstash: Instance;
    }
  }

  var Logstash: Static;
  export = Logstash;
}