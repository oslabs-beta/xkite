// types/common/kite.d.ts

interface KiteConfig {
  kafka: KiteKafkaCfg;
  db?: dbCfg;
  sink?: sinkCfg;
  grafana?: grafanaCfg;
  prometheus?: prometheusCfg;
}

interface dbCfg {
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

interface sinkCfg {
  name: 'jupyter' | 'spark';
  port?: number;
}

interface grafanaCfg {
  port: number;
}

interface prometheusCfg {
  port: number;
  scrape_interval: number; //seconds
  evaluation_interval: number; //seconds
}

interface KiteKafkaCfg {
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

interface KiteSetup {
  dBSetup?: dbCfg;
  kafkaSetup: KafkaSetup;
}

interface KiteConfigFile {
  header?: any;
  fileStream: fs.ReadStream;
}

interface Kite {
  defaultCfg: KiteConfig;
  configure: (arg?: string | KiteConfig) => void;
  deploy: (arg?: any) => void;
  getSetup: () => Promise<KiteSetup | undefined>;
  getConfig: () => Promise<KiteConfig | undefined>;
  getConfigFile: () => Promise<KiteConfigFile | undefined>;
  getKiteState: () => KiteState;
  getKiteServerState: () => KiteServerState;
  disconnect: () => Promise<any>;
  shutdown: () => Promise<any>;
}
