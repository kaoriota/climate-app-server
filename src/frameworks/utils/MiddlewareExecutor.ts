// tslint:disable-next-line:no-any
export type MiddlewareExecutor = (next?: MiddlewareExecutor) => Promise<any>;

export default MiddlewareExecutor;
