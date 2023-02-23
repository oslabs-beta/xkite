// types/kite.d.ts

interface KiteConfig {
  kafka: {
    brokers: {
      size: number;
      replicas?: number; // must be less than size
    };
    zookeepers?: {
      size: number;
      replicas?: number; // must be less than size
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
