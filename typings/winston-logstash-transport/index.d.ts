declare module "winston-logstash-transport" {
  import * as winston from "winston";
  import * as dgram from "dgram";

  class LogstashTransport extends winston.Transport {
    public host: string;
    public port: number;
    public trailingLineFeed: boolean;
    public trailingLineFeedChar: string;
    public silent: boolean;
    public client: dgram.Socket;

    public connect(): void;

    public log(info: { [key: string]: any }, callback: (...params: any) => any): void;
  }

  function createLogger(logType: string, config: {
    application: string,
    logstash: {host: string, port: number},
    transports: winston.TransportInstance[]
  }): winston.Winston;
}