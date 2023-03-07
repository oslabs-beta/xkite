import { 
    Consumer, 
    ConsumerSubscribeTopics, 
    EachBatchPayload, 
    Kafka, 
    EachMessagePayload, 
    Admin, 
    KafkaConfig,
    BrokersFunction
} from 'kafkajs'

export default class ConsumerFactory extends Kafka {
  //private kafkaConsumer: Consumer
  //private admin: Admin
  //private messageProcessor: ExampleMessageProcessor

 // private static instance: ConsumerFactory;
  private kafkaConsumer: Consumer;
  private _admin: Admin;
  
  private constructor(configuration: KafkaConfig) {
    super(configuration);
    //this.messageProcessor = messageProcessor
    this.kafkaConsumer = this.createKafkaConsumer(configuration.brokers, configuration.clientId)
    this._admin = this.createKafkaAdmin(configuration.brokers, configuration.clientId)
  }
// private constructor(config: KafkaConfig) {
//     super(config);
//     this._admin = super.admin();
//   }
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
      await this._admin.connect()
      const topics = await this._admin.listTopics()
      await this._admin.disconnect()
      console.log(topics);
      return topics;
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect()
  }

  private createKafkaConsumer(brokers: string[] | BrokersFunction, clientId: string): Consumer {
    const kafka = new Kafka({ 
      clientId,
      brokers
    })
    const consumer = kafka.consumer({ groupId: 'myGroup2' })
    return consumer
  }

  private createKafkaAdmin(brokers:string[] | BrokersFunction, clientId: string): Admin {
    const kafka = new Kafka({ 
      clientId,
      brokers
    })
    const admin = kafka.admin();
    return admin;
  }
}