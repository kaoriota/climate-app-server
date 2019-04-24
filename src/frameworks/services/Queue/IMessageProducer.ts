export interface IMessageProducer {
  topic: string;

  // tslint:disable-next-line:no-any
  send<TResponse = any>(payload: any): Promise<TResponse>;
}
