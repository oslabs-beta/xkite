import {
  Kafka,
  Message,
  Producer,
  Admin,
  ProducerBatch,
  TopicMessages,
} from 'kafkajs';

export default class ProducerFactory extends Kafka {
  private static instance: ProducerFactory;
  private _producer: Producer;
  private _admin: Admin;
  private replication: number;
  isConnected: boolean;

  private constructor(brokers: string[], clientId: string) {
    super({ brokers, clientId });
    this.replication = brokers.length;
    this._admin = super.admin();
    this._producer = super.producer({ allowAutoTopicCreation: true });
    this.isConnected = false;
    this.start();
  }

  public async start(): Promise<void> {
    try {
      console.log('attempting to connect...');
      await this._producer.connect();
      this.isConnected = true;
    } catch (error) {
      await this._producer.disconnect();
      console.log('Error connecting the producer: ', error);
    }
  }

  public async shutdown(): Promise<void> {
    await this._producer.disconnect();
  }

  public async sendBatch(messages: Message[], topic: string): Promise<void> {
    await this._producer.sendBatch({
      topicMessages: [
        {
          topic,
          messages,
        },
      ],
    });
  }

  public async sendBatches(batches: Message[][], topic: string): Promise<void> {
    console.log(topic);
    for (const messages of batches) {
      this.sendBatch(messages, topic);
    }
  }

  public async createTopics(inTopics: string[]) {
    await this._admin.connect();
    const topics = [];
    for (const topic of inTopics) {
      topics.push({ topic, replicationFactor: this.replication });
    }
    await this._admin.createTopics({ topics });
    await this._admin.disconnect();
  }

  public static async create(
    brokers: string[],
    clientId: string
  ): Promise<ProducerFactory> {
    if (ProducerFactory.instance === undefined) {
      ProducerFactory.instance = new ProducerFactory(brokers, clientId);
    }
    if (!ProducerFactory.instance.isConnected) ProducerFactory.instance.start();

    return ProducerFactory.instance;
  }
}
