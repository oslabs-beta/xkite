export interface KafkaSetup {
  clientId: string;
  brokers: Array<string>;
  ssl?: boolean;
}

export interface msg {
  value: string;
  partition?: number | 0;
}
