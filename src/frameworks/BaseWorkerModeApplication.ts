import { IMessageConsumer, IMessageConsumerContructor } from "app/frameworks/services/Queue/IMessageConsumer";

// tslint:disable:no-any
export abstract class BaseWorkerModeApplication {

  private _workerConstructors: Array<IMessageConsumerContructor<any>> = [];
  private _worker: Array<IMessageConsumer<any>> = [];

  protected abstract workerInitializer(
    workerConstructor: IMessageConsumerContructor<any>
  ): Promise<IMessageConsumer<any>>;
  
  public useWorker(workerConstructor: IMessageConsumerContructor<any>) {
    this._workerConstructors.push(workerConstructor);
  }

  public async start() {
    try {
      this._workerConstructors.forEach(async (worker) => {
        await this.workerInitializer(worker);
      });
      console.log("Server started as worker");
    } catch (error) {
      console.log("error: ", error);
    }
  }
}
