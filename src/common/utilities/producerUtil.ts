import { Kafka, Message, Producer, ProducerBatch, TopicMessages } from 'kafkajs'

interface Messageformat { a: string }

export default class ProducerFactory {
  private producer: Producer

  constructor(brokers: string[], clientId: string) {
    this.producer = this.createProducer(brokers, clientId)
  }

  public async start(): Promise<void> {
    try {
      await this.producer.connect()
    } catch (error) {
      console.log('Error connecting the producer: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.producer.disconnect()
  }
  

  public async sendBatch(messages: Array<Messageformat>, topic: string): Promise<void> {
    const kafkaMessages: Array<Message> = messages.map((message) => {
      return {
        value: JSON.stringify(message)
      }
    })

    const topicMessages: TopicMessages = {
      topic,
      messages: kafkaMessages
    }

    const batch: ProducerBatch = {
      topicMessages: [topicMessages]
    }

    await this.producer.sendBatch(batch)
  }

  private createProducer(brokers: string[], clientId: string) : Producer {

    const kafka = new Kafka({
      clientId,
      brokers
    })

    return kafka.producer()
  }
}