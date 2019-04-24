import { ConsumerGroup, ConsumerGroupOptions } from "kafka-node";
import * as _ from "lodash";
import { Service } from "typedi";

import { IMessageConsumer } from "app/frameworks/services/Queue/IMessageConsumer";

@Service()
export abstract class KafkaMessageConsumer<TMessage> implements IMessageConsumer<TMessage> {
  public abstract get topic(): string;
  public abstract get consumerGroup(): string

  private _kafkaConsumerGroup: ConsumerGroup;
  private _kafkaConsumerGroupOption: ConsumerGroupOptions;
  private _message: string;

  constructor(kafkaOptions?: ConsumerGroupOptions) {
    this._kafkaConsumerGroupOption = kafkaOptions;
  }

  public async init(kafkaOptions?: ConsumerGroupOptions) {
    console.log(`init: ${this.topic} topic on ${this.consumerGroup} consumer group`);
    this._kafkaConsumerGroupOption = kafkaOptions;
    this._kafkaConsumerGroup = new ConsumerGroup(this._kafkaConsumerGroupOption, this.topic);

    await this._kafkaConsumerGroup.on("message", async (message) => {
      try {
        await this.onMessage(JSON.parse(_.trim(message.value as string)) as TMessage).then(async (res) => {
          this._message = message.value as string;
          // const commit = await this.commit();
        });
      } catch (error) {
        console.log("error: ", error.message, " | ", this._message);
      }
    });
    this._kafkaConsumerGroup.on("error", (error) => this.onError(error));
  }

  public abstract onMessage(message: TMessage): Promise<void>;

  // tslint:disable-next-line:no-any
  public abstract onError(error: any): Promise<void>;

  // tslint:disable-next-line:no-any
  public async commit(): Promise<any> {
    // tslint:disable-next-line:no-any
    return new Promise<any>((resolve, reject) => {
      this._kafkaConsumerGroup.commit(
        (error, data) => {
          if (error) {
            this.onError(error);
            reject(error);
          } else {
            resolve(data);
          }
        });
    });
  }
}
