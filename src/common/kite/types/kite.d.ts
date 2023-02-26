// types/common/kite.d.ts

interface KiteConfig {
  kafka: KiteKafkaCfg;
  db?: dbCfg;
  sink?: sinkCfg;
  grafana?: grafanaCfg;
  prometheus?: prometheusCfg;
}

interface dbCfg {
  dataSource: 'postgresql' | 'ksql';
  port: number;
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
    ports?: number[]; // ["1734", "8888", ...]
    metrics_port?: number;
    jmx_port?: number[]; // broker interface with jmx
  };
  zookeepers: {
    size: number;
    client_ports?: number[]; // [25483, 65534, ...] //external
    server_ports?: number[]; // [2134, 2845, ...] //external
    election_ports?: number[]; // internal goes along with server port these must be unique
  };
  jmx?: {
    port: number; // internal main port on jmx
    if_ports: number[]; // external host port to interface with port
  };
  spring?: {
    port: number; // external host port to interface with 8080
  };
}

interface KiteSetup {
  dataSetup?: PGConfig | KSQLConfig | undefined;
  kafkaSetup: KafkaSetup;
}

declare module 'zip-local';

interface KiteConfigFile {
  header?: any;
  fileStream: fs.ReadStream;
}
