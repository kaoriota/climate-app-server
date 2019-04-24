export const DefaultMapping = {
  "index_patterns": "logs-*",
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "index": {
      "refresh_interval": "5s"
    }
  },
  "mappings": {
    "_doc": {
      "_all": { "enabled": false, "omit_norms": true },
      "_source": { "enabled": true },
      "dynamic_templates": [
        {
          "string_fields": {
            "match": "*",
            "mapping": {
              "type": "text", "index": true, "omit_norms": true,
              "fields": {
                "raw": { "type": "keyword", "index": true, "ignore_above": 256 }
              }
            }
          }
        }
      ],
      "properties": {
        "@timestamp": { "type": "date" },
        "@version": { "type": "keyword" },
        "message": { "type": "text", "index": true },
        "severity": { "type": "keyword", "index": true },
        "status": {
          "type": "number",
          "dynamic": true,
          "index": true
        },
        "requestId": {
          "type": "text",
          "dynamic": true,
        },
        "fields": {
          "type": "object",
          "dynamic": true
        }
      }
    }
  }
};
