declare module "winston-elasticsearch" {

  import * as ElasticsearchClient from "elasticsearch";
  import * as Winston from "winston";

  class Elasticsearch extends Winston.Transport {
    constructor (option: ElasticsearchTransporterOption);
  }

  export = Elasticsearch;

  interface ElasticsearchTransporterOption {
    level?: string,
    index?: string,
    indexPrefix?: string,
    indexSuffixPattern?: string,
    messageType?: string,
    transformer?: (metadata: any) => any,
    client?: ElasticsearchClient.Client,
    clientOpts?: ElasticsearchClient.ConfigOptions,
    mappingTemplate?: any
    ensureMappingTemplate?: boolean,
    flushInterval?: number,
    waitForActiveShards?: number,
    handleExceptions?: boolean,
    pipeline?: null
  }
}
