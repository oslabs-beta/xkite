import { Consumer, ConsumerSubscribeTopics, EachBatchPayload, Kafka, EachMessagePayload, Admin } from 'kafkajs'

export default class ExampleConsumer {
  private kafkaConsumer: Consumer
  private admin: Admin
  //private messageProcessor: ExampleMessageProcessor

  public constructor(brokers: string[], clientId: string) {
    //this.messageProcessor = messageProcessor
    this.kafkaConsumer = this.createKafkaConsumer(brokers, clientId)
    this.admin = this.createKafkaAdmin(brokers, clientId)
  }

  public async startConsumer(topicToFollow: string): Promise<void> {
    console.log('starting consumer...')
    const topic: ConsumerSubscribeTopics = {
      topics: [topicToFollow],
      fromBeginning: false
    }

    try {
      await this.kafkaConsumer.connect()
      await this.kafkaConsumer.subscribe(topic)
      console.log('connecting')
      await this.kafkaConsumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
          console.log(`- ${prefix} ${message.key}#${message.value}`, 'from line 30 of consumerUtil')
        }
      })
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async startBatchConsumer(topicToFollow: string): Promise<void> {
    const topic: ConsumerSubscribeTopics = {
      topics: [topicToFollow],
      fromBeginning: false
    }

    try {
      await this.kafkaConsumer.connect()
      await this.kafkaConsumer.subscribe(topic)
      await this.kafkaConsumer.run({
        eachBatch: async (eachBatchPayload: EachBatchPayload) => {
          const { batch } = eachBatchPayload
          for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`
            console.log(`- ${prefix} ${message.key}#${message.value}`, 'from line 52 of consumerUtil') 
          }
        }
      })
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async listTopics(): Promise<void | string[]> {

    try {
      await this.admin.connect()
      const topics = await this.admin.listTopics()
      await this.admin.disconnect()
      console.log(topics);
      return topics;
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect()
  }

  private createKafkaConsumer(brokers: string[], clientId: string): Consumer {
    const kafka = new Kafka({ 
      clientId,
      brokers
    })
    const consumer = kafka.consumer({ groupId: 'myGroup2' })
    return consumer
  }

  private createKafkaAdmin(brokers: string[], clientId: string): Admin {
    const kafka = new Kafka({ 
      clientId,
      brokers
    })
    const admin = kafka.admin();
    return admin;
  }
}