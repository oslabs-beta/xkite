import type { KiteConfig, YAMLServicesDefaultSetup } from 'xkite-core';
export const _ports_: YAMLServicesDefaultSetup = {
  postgresql: { internal: 5432, external: 5432 },
  ksql: { internal: 8088, external: 8088 },
  ksql_schema: { internal: 8085, external: 8085 },
  spark: {
    webui: { internal: 8080, external: 8090 },
    rpc: { internal: 7077, external: 7077 }
  },
  spring: { internal: 8080, external: 8080 },
  prometheus: { internal: 9090, external: 9099 },
  grafana: { internal: 3000, external: 3050 },
  jupyter: { internal: 8000, external: 8000 },
  kafkaconnect_src: { internal: 8083, external: 8083 },
  kafkaconnect_sink: { internal: 8083, external: 8084 },
  zookeeper: {
    client: { internal: 2182, external: 2182 },
    peer: { internal: 2888, external: 3888 } // only internal docker net
  },
  kafka: {
    jmx: 9991, // only internal
    broker: { internal: 9092, external: 9092 },
    spring: 9095, // only internal
    metrics: 29092, // only internal
    ksql: 9096, // only internal
    connect_src: 9097,
    connect_sink: 9098
  },
  jmx: { internal: 5556, external: 5566 },
  docker: { internal: 9323, external: 9323 }
};

export const defaultCfg: KiteConfig = {
  kafka: {
    brokers: {
      size: 2,
      replicas: 2
    },
    zookeepers: {
      size: 2
    },
    jmx: {
      ports: [_ports_.jmx.external, _ports_.jmx.external + 1]
    },
    spring: {
      port: _ports_.spring.external
    }
  },
  db: {
    name: 'ksql',
    port: _ports_.ksql.external,
    kafkaconnect: { port: _ports_.kafkaconnect_src.external }
  },
  sink: {
    name: 'spark',
    port: _ports_.spark.webui.external,
    rpc_port: _ports_.spark.rpc.external,
    kafkaconnect: { port: _ports_.kafkaconnect_sink.external }
  },
  grafana: {
    port: _ports_.grafana.external
  },
  prometheus: {
    scrape_interval: 20,
    evaluation_interval: 10,
    port: _ports_.prometheus.external
  }
};
