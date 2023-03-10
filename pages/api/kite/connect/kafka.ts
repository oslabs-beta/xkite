import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';
import ProducerFactory from '@/common/kafkaConnector/ProducerFactory';
// import ConsumerFactory from '@/common/kafkaConnector/ConsumerFactory'; --> potentially will be using to retrieve data on which partitions new messages are assigned to

type Data = {
  reply?: string;
  err?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string[]>
) {
  if (req.method === 'POST') {
    try {
      console.log(`sending data to kafka...\n${JSON.stringify(req.body)}`);
      const { method, topic, messages, clientId } = req.body;
      const kafkaSetup = Kite.getKafkaSetup();

      const producer = await ProducerFactory.create({
        ...kafkaSetup,
        clientId: clientId ?? 'test'
      });

      let topics: string[] | undefined = undefined;
      console.log(method);

      switch (method) {
        case 'createTopics':
          await producer.createTopics([topic]);
          topics = await producer.listTopics();
          console.log(topics, 'from post');
          break;
        case 'getTopics':
          topics = await producer.listTopics();
          console.log(topics, 'from post');
          break;
        case 'sendMessage':
          await producer.sendBatch(messages, topic);
          break;
        case 'sendMessages':
          await producer.sendBatches(messages, topic);
          break;
        case 'sendMessages:Serial':
          await producer.sendBatchesSerial(messages, topic);
          break;
        default:
          return res.status(405).send({ reply: 'Invalid Msg Body' });
          break;
      }
      console.log('produced successfully');
      if (topics !== undefined) {
        res.status(201).json(topics);
      } else {
        res.status(200).json({ reply: 'success' });
      }

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
