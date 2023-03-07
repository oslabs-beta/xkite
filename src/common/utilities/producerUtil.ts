import {
  Kafka,
  Message,
  Producer,
  ProducerBatch,
  TopicMessages,
  ProducerRecord,
} from 'kafkajs';

interface Messageformat {
  a: string;
}

export default class ProducerFactory {
  private producer: Producer;
  private isConnected: boolean = false;

constructor(brokers: string[], clientId: string) {
    this.producer = this.createProducer(brokers, clientId);
  }

  public async start(): Promise<void> {
    try {
      await this.producer.connect();
      console.log('started successfully');
      this.isConnected = true;
    } catch (error) {
      console.log('Error connecting the producer: ');
    }
  }

  public async shutdown(): Promise<void> {
    await this.producer.disconnect();
    console.log('disconnected successfully');
    this.isConnected = false;
  }

  public async sendBatch(
    messages: Array<Messageformat>,
    topic: string
  ): Promise<void> {
    const kafkaMessages: Array<Message> = messages.map((message) => {
      return {
        value: JSON.stringify(message),
      };
    });

    const topicMessages: TopicMessages = {
      topic,
      messages: kafkaMessages,
    };

    const batch: ProducerBatch = {
      topicMessages: [topicMessages],
    };
    if (this.isConnected) {
      await this.producer.sendBatch(batch);
    } else {
      const startTime = Date.now();
      while (!this.isConnected && Date.now() - startTime < 60000) {
        console.log(
          'Due to Kafka cluster connectivity delay, attempting to resend a message, this may take some time'
        );
        try {
          this.start();
        } catch (error) {
          console.log('Error connecting the producer: ', error);
        }
      }
      if (this.isConnected) {
        await this.producer.sendBatch(batch);
      } else {
        // Handle the case where the producer failed to connect after a minute
        console.log('Producer failed to connect');
      }
    }
  }

  public async sendMessage(
    messages: Array<Messageformat>,
    topic: string
  ): Promise<void> {
    const kafkaMessages: Message[] = messages.map((message) => {
      return {
        value: JSON.stringify(message),
      };
    });

    const message: ProducerRecord = {
      topic,
      messages: kafkaMessages,
    };

    if (this.isConnected) {
      await this.producer.send(message);
    } else {
      const startTime = Date.now();
      let intervalId: NodeJS.Timeout;

      const checkConnection = () => {
        console.log(
          'Due to Kafka cluster connectivity delay, attempting to resend a message, this may take some time'
        );
        try {
          this.start();
          if (this.isConnected) {
            clearInterval(intervalId);
            this.producer.send(message);
          }
        } catch (error) {
          console.log('Error connecting the producer: ', error);
        }
      };

      intervalId = setInterval(checkConnection, 5000);
      setTimeout(() => {
        clearInterval(intervalId);
        console.log('Producer failed to connect');
      }, 60000 - (Date.now() - startTime));
    }
  }

  //     const startTime = Date.now();
  //     // const intervalId = setInterval(() => {
  //     // }, 5000);
  //     while (!this.isConnected && Date.now() - startTime < 60000) {
  //       console.log(
  //         'Due to Kafka cluster connectivity delay, attempting to resend a message, this may take some time'
  //       );
  //       try {
  //         this.start();
  //       } catch (error) {
  //         console.log('Error connecting the producer: ', error);
  //       }
  //     }
  //     if (this.isConnected) {
  //       await this.producer.send(message);
  //     } else {
  //       console.log('Producer failed to connect');
  //     }
  //   }
  // }
  private createProducer(brokers: string[], clientId: string): Producer {
    const kafka = new Kafka({
      clientId,
      brokers,
    });

    return kafka.producer();
  }
}
