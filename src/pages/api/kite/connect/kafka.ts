import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '@/common/kite';
import KafkaConnector from '@/common/kafkaConnector';
import ProducerFactory from '@/common/kafkaConnector/ProducerFactory';
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
      const { method, topic, messages } = req.body;
      const kafkaSetup = Kite.getKafkaSetup();
      console.log(JSON.stringify({ ...kafkaSetup, clientId: 'myGroup' }));
      const producer = await ProducerFactory.create(
        kafkaSetup.brokers,
        'myGroup'
      );

      switch (method) {
        case 'createTopics':
          // console.log(`creating topics..\n${topics}`);
          // const kafka = new KafkaConnector({
          //   ...kafkaSetup,
          //   clientId: 'myGroup',
          // });
          await producer.createTopics([topic]);
          break;
        case 'sendMessage':
          await producer.sendBatch(messages, topic);
          break;
        case 'sendMessages':
          // for (const topic of topics) {
          //   console.log(`sending messages..\n${topic}`);
          //   kafka.sendMessage(topic, messages);
          // }
          await producer.sendBatches(messages, topic);
          break;
        default:
          return res.status(405).send({ reply: 'Invalid Msg Body' });
          break;
      }
      // await producer.shutdown();
      console.log('produced successfully');
      res.status(200).json({ reply: 'success' });
      //TO DO: uncomment when you connecting to the front-end
      // res.redirect('/display');
    } catch (err) {
      console.log(err);
      res.status(500).json({ reply: 'Error in /api/kite/connect/kafka POST' });
    } finally {
    }
  } else {
    res.status(405).send({ reply: 'Method Not Allowed' });
  }
}
