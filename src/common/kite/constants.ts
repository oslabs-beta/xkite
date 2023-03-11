import path from 'path';
import { KiteConfig } from './types';
import { _ports_ } from '@kite/ymlgenerator/constants';
export const MAX_NUMBER_OF_BROKERS = 50;
export const MAX_NUMBER_OF_ZOOKEEPERS = 1000;

const defaultCfg: KiteConfig = {
  kafka: {
    brokers: {
      size: 2,
      replicas: 2,
      ports: {
        brokers: [
          _ports_.kafka.broker.external,
          _ports_.kafka.broker.external + 1
        ]
      }
    },
    zookeepers: {
      size: 2,
      ports: {
        client: [
          _ports_.zookeeper.client.external,
          _ports_.zookeeper.client.external + 1
        ]
      }
    },
    jmx: {
      ports: [_ports_.jmx.external, _ports_.jmx.external + 1]
    },
    spring: {
      port: _ports_.spring.external
    }
  },
  db: {
    name: 'postgresql',
    port: _ports_.postgresql.external,
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
    scrape_interval: 5,
    evaluation_interval: 2,
    port: _ports_.prometheus.external
  }
};

export enum KiteState {
  Unknown = 'Unknown',
  Init = 'Init',
  Configured = 'Configured',
  Running = 'Running',
  Paused = 'Paused',
  Shutdown = 'Shutdown'
}

export enum KiteServerState {
  Disconnected = 'Disconnected',
  Connected = 'Connected'
}
export const configFilePath = path.join(
  process.cwd(),
  'src/common/kite/download/config'
);

export default defaultCfg;
