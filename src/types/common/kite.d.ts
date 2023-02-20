// types/kite.d.ts

interface KiteConfig {
  numOfClusters: number;
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