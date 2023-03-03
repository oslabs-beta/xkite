import {
  Kafka,
  KafkaConfig,
  Message,
  Producer,
  Admin,
  IResourceConfigEntry,
  ProducerBatch,
  Partitioners,
  TopicMessages,
} from 'kafkajs';

export default class ProducerFactory extends Kafka {
  private static instance: ProducerFactory;
  private static topicCache: Map<string, boolean>;
  private _producer: Producer;
  private _admin: Admin;
  private replication: number;
  isConnected: boolean;
  isAdminConnected: boolean;

  private constructor(config: KafkaConfig) {
    super(config);
    ProducerFactory.topicCache = new Map();
    this.replication = config.brokers.length;
    this._admin = super.admin();
    this._producer = super.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
      allowAutoTopicCreation: true,
      retry: { maxRetryTime: 100, retries: 1 }, //limit the number of spam requests
    });
    this.isConnected = false;
    this.isAdminConnected = false;
    this.start();
  }

  public async start(): Promise<void> {
    try {
      console.log('attempting to connect...');
      await this._producer.connect();
      console.log('connected!');
      this.isConnected = true;
    } catch (error) {
      await this._producer.disconnect();
      console.log('Error connecting the producer: ', error);
    }
  }

  public async shutdown(): Promise<void> {
    await this._producer.disconnect();
    await this._admin.disconnect();
  }

  public async sendBatch(messages: Message[], topic: string): Promise<void> {
    if (!ProducerFactory.topicCache.has(topic)) {
      await this.createTopics([topic]);
      return;
    }
    await this._producer.sendBatch({
      topicMessages: [
        {
          topic,
          messages,
        },
      ],
    });
    if (!ProducerFactory.topicCache.get(topic)) {
      // set post to topic to true
      ProducerFactory.topicCache.set(topic, true);
    }
  }

  public async sendBatches(batches: Message[][], topic: string): Promise<void> {
    if (!ProducerFactory.topicCache.has(topic)) {
      await this.createTopics([topic]);
      return;
    }
    const topicMessages: TopicMessages[] = [];
    // if you want to send in a batch
    batches.forEach((messages) => {
      topicMessages.push({ messages, topic });
    });
    await this._producer.sendBatch({ topicMessages });
    if (!ProducerFactory.topicCache.get(topic)) {
      // set post to topic to true
      // console.log('set topicCache')
      ProducerFactory.topicCache.set(topic, true);
    }
  }

  public async sendBatchesSerial(
    batches: Message[][],
    topic: string
  ): Promise<void> {
    if (!ProducerFactory.topicCache.has(topic)) {
      //   await this.createTopics([topic]);
      // } else if (!ProducerFactory.topicCache.get(topic)) {
      // first time posting to topic, use only one post
      console.log('first time...');
      await this.sendBatch(batches[0], topic); // TODO: fix... this is a workaround
    } else {
      // if you want to send one-shot
      batches.forEach(
        async (messages) => await this.sendBatch(messages, topic)
      );
    }
  }

  public async createTopics(inTopics: string[]) {
    if (!this.isAdminConnected) {
      await this._admin.connect();
      this.isAdminConnected = true;
    }
    const topics = [];
    for (const topic of inTopics) {
      topics.push({
        topic,
        replicationFactor: this.replication,
      });
    }
    await this._admin.createTopics({ topics });
    // await this._admin.disconnect();
    // initialize post to topic to detect first post.
    inTopics.forEach((topic) => ProducerFactory.topicCache.set(topic, false));
  }

  public static async create(config: KafkaConfig): Promise<ProducerFactory> {
    if (ProducerFactory.instance === undefined) {
      ProducerFactory.instance = new ProducerFactory(config);
      console.log('producer created');
    } else if (!ProducerFactory.instance.isConnected) {
      await ProducerFactory.instance.start();
    }
    return ProducerFactory.instance;
  }
}
