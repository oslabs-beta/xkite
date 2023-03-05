import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';
import KafkaConnector from '@/common/kafkaConnector';
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
          for (const topic of topics) {
            console.log(`sending messages..\n${topic}`);
            kafka.sendMessage(topic, messages);
          }
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
