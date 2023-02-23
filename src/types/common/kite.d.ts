// types/kite.d.ts

interface KiteConfig {
  kafka: {
    brokers: {
      size: number;
      replicas?: number; // must be less than size
      ports?: number[]; // [25483, 65534, ...]
    };
    zookeepers: {
      size: number;
      client_ports?: number[]; // [25483, 65534, ...]
      server_ports?: number[];
    };
  };
  dataSource: string;
  sink: string;
}

interface KafkaSetup {
  brokers: Array<string>;
  ssl: boolean;
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
