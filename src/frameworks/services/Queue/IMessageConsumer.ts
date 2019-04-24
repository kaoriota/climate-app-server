// tslint:disable:no-any
export interface IMessageConsumer<TMessage> {
  topic: string;
  consumerGroup: string;

  onMessage(message: TMessage): Promise<void>;
  onError(error: any): Promise<void>;
  init(...params: any[]): Promise<void>;
}

export interface IMessageConsumerContructor<TMessage> {
  new(...params: any[]): IMessageConsumer<TMessage>;
}
