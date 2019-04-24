import { Configuration } from "app/Configuration";
import { HighLevelProducer, KafkaClient, ProduceRequest } from "kafka-node";
import * as _ from "lodash";
import { Service } from "typedi";

import { IMessageProducer } from "app/frameworks/services/Queue/IMessageProducer";

// tslint:disable:no-any
@Service()
export abstract class KafkaMessageProducer<TMessage> implements IMessageProducer {

  private _client: KafkaClient;
  private _kafkaProducer: HighLevelProducer;
  public abstract get topic(): string;

  private async sendToKafka(payload: ProduceRequest) {
    const refreshMetadata = await new Promise<any>(async (resolve, reject) => {
      console.log("kafka producer ready");
      this._client.refreshMetadata([payload.topic], (error) => {
        reject(error);
      });
      resolve(true);
    });
    if (refreshMetadata === true) {
      const send = await new Promise<any>(async (resolve, reject) => {
        this._kafkaProducer.send([payload], (error: any, data: any) => {
          if (error) {
            console.log("reject : ", error);
            reject(error);
          } else {
            console.log("resolve : ", data);
            resolve(data);
          }
        });
      });
      return send;
    } else {
      return refreshMetadata;
    }
  }

  public async initTopic() {
    await new Promise((resolve) => {
      this._client.on("ready", () => {
        resolve();
      });
    });
    const timer = new Promise((resolve, reject) => {
      const wait = setTimeout(
        () => {
          clearTimeout(wait);
          resolve("timeout");
        },
        3000);
    });
    const isTopicExists = this.isTopicExists(this.topic);

    const race = await Promise.race([
      timer,
      isTopicExists
    ]);
    if (race === "timeout") {
      throw new Error(
        "Connection timeout! please check your kafka broker."
      );
    } else if (!(await isTopicExists)) {
      console.log(`${this.topic} is not exist. creating`);
      await this.createTopic(this.topic).then((data) => console.log(data));
    }
    return true;
  }

  public async isTopicExists(topic: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this._client.topicExists([topic], (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  public async createTopic(topic: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this._kafkaProducer.createTopics(
        [topic],
        (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
    });
  }

  public async send(message: TMessage) {
    try {
      this._client = new KafkaClient({ kafkaHost: Configuration.system.KAFKA_HOST });
      this._kafkaProducer = new HighLevelProducer(this._client);

      const isTopicExists = await this.initTopic();

      if (isTopicExists) {
        console.log("this.topic: ", this.topic);

        const loadMetadata = (await new Promise<any>(async (resolve, reject) => {
          this._client.loadMetadataForTopics([this.topic], (error, data) => {
            if (error) {
              reject(error);
            } else {
              resolve(data);
            }
          });
        })) as Array<{ [key: string]: any }>;
        const partitions = Object.keys(_.head(loadMetadata));
        console.log("loadMetadata: ", Object.keys(loadMetadata[1].metadata[this.topic]).length);
        const partition = partitions[_.random(0, Object.keys(loadMetadata[1].metadata[this.topic]).length - 1, false)];
        const send = await this.sendToKafka({
          topic: this.topic,
          messages: [JSON.stringify(message)],
          partition: Number.parseInt(partition)
        });
        return send;
      }
    } catch (error) {
      throw error;
    }
  }
}
