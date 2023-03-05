// this is a kafka connector class that uses kafkajs to simplify the process of connecting to a kafka instance. The constructor takes in a kafka setup object that constructs a kafka instance via kafkajs

import { Kafka, logLevel, Consumer, Producer, Admin, Message } from 'kafkajs';

export default class KafkaConnector {
  kafka: Kafka;
  producer!: Producer;

  /**
   *
   * @param {KafkaSetup} kafkaSetup
   *
   * takes in a kafka setup object that constructs a kafka instance via kafkajs
   */
  constructor(kafkaSetup: KafkaSetup) {
    // create a new kafka instance
    this.kafka = new Kafka({
      clientId: kafkaSetup.clientId,
      brokers: kafkaSetup.brokers,
      logLevel: logLevel.ERROR,
      ssl: kafkaSetup.ssl,
    });
  }

  /**
   *
   * @param {Array<string>} topics
   * @param {number} numPartitions
   * @param {number} replicationFactor
   *
   * creates new topic(s) in the kafka instance
   */
  public async createTopics(
    topics: Array<string>,
    numPartitions: number = 1,
    replicationFactor: number = 1
  ): Promise<void> {
    try {
      // create a new admin client and connect to the kafka instance
      const admin: Admin = this.kafka.admin();
      await admin.connect();

      // create the topics
      await admin.createTopics({
        topics: topics.map((topic) => ({
          topic,
          numPartitions,
          replicationFactor,
        })),
      });
      console.log('Topic(s) created successfully!');

      // disconnect from the kafka instance
      await admin.disconnect();
    } catch (error) {
      console.log('Error creating topic(s): ', error);
    }
  }

  /**
   *
   * @param {Array<string>} topics
   *
   * deletes a topic from the kafka instance
   */
  public async deleteTopics(topics: Array<string>): Promise<void> {
    try {
      // create a new admin client and connect to the kafka instance
      const admin: Admin = this.kafka.admin();
      await admin.connect();

      // delete the topics
      await admin.deleteTopics({
        topics,
      });
      console.log('Topic(s) deleted successfully!');

      // disconnect from the kafka instance
      await admin.disconnect();
    } catch (error) {
      console.log('Error deleting topic(s): ', error);
    }
  }

  /**
   *
   *
   * @param {string} topic
   * @param {Message[]} messages
   *
   * sends a message to a topic in the kafka instance
   */
  public async sendMessage(topic: string, messages: Message[]) {
    try {
      // create a new producer and connect to the kafka instance
      const producer: Producer = this.producer
        ? this.producer
        : this.kafka.producer();
      await producer.connect();

      if (!this.producer) await producer.connect();

      const result = await producer.send({
        topic,
        messages,
      });

      console.log(`Sent successfully! ${JSON.stringify(result)}`);

      if (!this.producer) this.producer = producer;
    } catch (error) {
      console.log('Error creating producer: ', error);
    }
  }

  /**
   *
   * disconnects the producer from the kafka instance
   */
  public async disconnectProducer() {
    try {
      await this.producer.disconnect();
    } catch (error) {
      console.log('Error disconnecting producer: ', error);
    }
  }

  /**
   *
   * @param {string} groupId
   * @param {string} topic
   * @param {boolean} fromBeginning
   * @param {(payload: any) => Promise<void>} eachMessage
   *
   * creates a new consumer and connects to the kafka instance
   *
   * @returns a consumer object
   */
  public async createConsumer(
    groupId: string,
    topics: string[],
    fromBeginning: boolean = false,
    eachMessage?: (payload: any) => Promise<void>
  ): Promise<any> {
    try {
      // create a new consumer and connect to the kafka instance
      const consumer: Consumer = this.kafka.consumer({ groupId });
      await consumer.connect();
      console.log('Consumer connected successfully!');

      // subscribe to the topics
      await consumer.subscribe({ topics, fromBeginning });
      if (eachMessage)
        await consumer.run({
          eachMessage,
        });

      return consumer;
    } catch (error) {
      console.log('Error creating consumer: ', error);
    }
  }

  /**
   *
   * @param {Consumer} consumer
   *
   * disconnects a consumer from the kafka instance
   *
   */
  public async disconnectConsumer(consumer: Consumer) {
    try {
      await consumer.disconnect();
    } catch (error) {
      console.log('Error disconnecting consumer: ', error);
    }
  }
}
