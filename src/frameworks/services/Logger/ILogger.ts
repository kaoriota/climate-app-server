import { Token } from "typedi";

export interface ILogger {
  // tslint:disable:no-any
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export const LoggerService = new Token<ILogger>(); 