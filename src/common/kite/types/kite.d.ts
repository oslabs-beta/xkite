// types/common/kite.d.ts

interface KiteConfig {
  kafka: KiteKafkaCfg;
  dataSource: string;
  sink: string;
}

interface KiteKafkaCfg {
  brokers: {
    size: number;
    id?: number[]; // [101, 102,...]
    replicas?: number; // must be less than size
    ports?: string[]; // ["25483:1734", "29482:65534", ...]
    metrics_port?: number;
    jmx_port?: number[]; // broker interface with jmx
  };
  zookeepers: {
    size: number;
    client_ports?: number[]; // [25483, 65534, ...]
    server_ports?: string[]; // ['212:23', '4532:4523', ...]
  };
  jmx?: {
    // must be as many as brokers.
    port: number[]; //host port to interface with 5556
  };
  spring?: {
    port: number; //host port to interface with 8080
  };
}

interface KiteSetup {
  dataSetup?: YAMLDataSetup;
  kafkaSetup: KafkaSetup;
}

declare module 'zip-local';

interface KiteConfigFile {
  header?: any;
  fileStream: fs.ReadStream;
}
