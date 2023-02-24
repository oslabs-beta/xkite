// types/common/kite.d.ts

interface KiteConfig {
  kafka: KiteKafkaCfg;
  dataSource: string;
  sink: string;
}

interface KiteKafkaCfg {
  brokers: {
    size: number;
    replicas?: number; // must be less than size
    ports?: string[]; // ["25483:1734", "29482:65534", ...]
    metrics_port?: number[];
  };
  zookeepers: {
    size: number;
    client_ports?: number[]; // [25483, 65534, ...]
    server_ports?: string[]; // ['212:23', '4532:4523', ...]
  };
  jmx?: {
    port: number[];
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
