interface KafkaSetup {
  clientId: string;
  brokers: Array<string>;
  ssl?: boolean;
}

interface msg {
  value: string;
  partition?: number | 0;
}
