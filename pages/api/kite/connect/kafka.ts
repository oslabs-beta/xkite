import type { NextApiRequest, NextApiResponse } from 'next/types';
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
      const { method, topic, messages, clientId } = req.body;
      const kafkaSetup = Kite.getKafkaSetup();
      // console.log(
      //   JSON.stringify({ ...kafkaSetup, clientId: clientId ?? 'test' })
      // );
      const producer = await ProducerFactory.create({
        ...kafkaSetup,
        clientId: clientId ?? 'test',
      });

      switch (method) {
        case 'createTopics':
          await producer.createTopics([topic]);
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
