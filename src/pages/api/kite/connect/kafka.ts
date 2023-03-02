import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '@/common/kite';
import KafkaConnector from '@/common/kafkaConnector';
import ProducerFactory from '../../../../common/utilities/producerUtil';
const clientId = 'json1';
const brokers = ['localhost:9092', 'localhost:9093'];
let topic = 'csvTopic';

type Data = {
  reply?: string;
  err?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    /*
    body = {
      method: "createTopics" | "sendMessage" | "consumeTBD"
      topics: ["topic1", 'topic2'],
      messages: [{value: 'string'}, {value: 'value2'}],
    }
    */
    try {
      console.log(`sending data to kafka...\n${JSON.stringify(req.body)}`);
      const { method, topics, messages } = req.body;
      const kafkaSetup = Kite.getKafkaSetup();
      // console.log(JSON.stringify({ ...kafkaSetup, clientId: 'test' }));
      const kafka = new KafkaConnector({ ...kafkaSetup, clientId: 'test' });

      switch (method) {
        case 'createTopics':
          console.log(`creating topics..\n${topics}`);
          kafka.createTopics(topics);
          break;
        case 'sendMessages':
          const producer = new ProducerFactory(brokers, clientId);
          await producer.start();
          const messageArray = []
          for (const message of messages) {
            messageArray.push({a: message.value})
          }
          await producer.sendBatch(messageArray, topics[0]);
          await producer.shutdown();
          console.log('produced successfully');
          break;
        default:
          return res.status(405).send({ reply: 'Invalid Msg Body' });
          break;
      }
      res.status(200).json({ reply: 'success' });
      //TO DO: uncomment when you connecting to the front-end
      // res.redirect('/display');
    } catch (err) {
      console.log(err);
      res.status(500).json({ reply: 'Error in /api/kite/connect/kafka POST' });
    }
  } else {
    res.status(405).send({ reply: 'Method Not Allowed' });
  }
}
