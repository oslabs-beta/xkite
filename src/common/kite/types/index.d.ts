// types/common/kite.d.ts

import { KafkaSetup } from '@/kite/kafkaConnector/types/kafkaConnector';
import { KiteState, KiteServerState } from '@kite/constants';
import * as fs from 'fs';

interface KiteConfig {
  kafka: KiteKafkaCfg;
  db?: dbCfg;
  sink?: sinkCfg;
  grafana?: grafanaCfg;
  prometheus?: prometheusCfg;
}

export interface dbCfg {
  name: 'postgresql' | 'ksql';
  port?: number;
  postgresql?: {
    username: string;
    password: string;
    dbname: string;
  };
  ksql?: {
    schema_port: number;
  };
}

export interface sinkCfg {
  name: 'jupyter' | 'spark';
  port?: number;
}

interface grafanaCfg {
  port: number;
}

export interface prometheusCfg {
  port: number;
  scrape_interval: number; //seconds
  evaluation_interval: number; //seconds
}

export interface KiteKafkaCfg {
  brokers: {
    size: number;
    id?: number[]; // [101, 102,...]
    replicas?: number; // must be less than size
    ports?: {
      brokers?: number[]; // external ports to access brokers
      metrics?: number; // confluent metric interface on docker net
      jmx?: number[]; // broker interface with jmx on docker net
    };
  };
  zookeepers: {
    size: number;
    ports?: {
      peer?: {
        //does not need to be configurable, docker net only
        internal: number; // 2888
        external: number; // 3888
      };
      client: number[]; // [2181, 2182] //external
    };
  };
  jmx?: {
    ports: number[]; // external host port to interface with port
  };
  spring?: {
    port: number; // external host port to interface with 8080
  };
}

export interface KiteSetup {
  dBSetup?: dbCfg;
  kafkaSetup: KafkaSetup;
  spring?: { port: number };
  prometheus?: { port: number };
  grafana?: { port: number };
  zookeeper?: { ports: number[] };
  jmx?: { ports: number[] };
  jupyter?: { port: number };
  spark?: { port: number };
  docker?: { services: string[] };
}

export interface KiteConfigFile {
  header?: any;
  fileStream: Buffer;
}

// export interface Kite {
//   defaultCfg: KiteConfig;
//   configure: (arg?: string | KiteConfig) => void;
//   deploy: (arg?: any) => void;
//   getSetup: () => Promise<KiteSetup | undefined>;
//   getConfig: () => Promise<KiteConfig | undefined>;
//   getConfigFile: () => Promise<KiteConfigFile | undefined>;
//   getKiteState: () => KiteState;
//   getKiteServerState: () => KiteServerState;
//   disconnect: () => Promise<any>;
//   shutdown: () => Promise<any>;
// }
// export function getConfig() {
//   throw new Error('Function not implemented.');
// }
