import type { NextApiRequest, NextApiResponse } from 'next';
import ProducerFactory from '../../common/utilities/producerUtil';
const clientId = 'json1';
const brokers = ['0.0.0.0:9092', 'localhost:9093'];

type Data = {
  reply?: string;
  err?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    try {
      const { message, ai, client } = req.body;
      const producer = new ProducerFactory(brokers, clientId);
      await producer.start();
      if (ai) {
        await producer.sendMessage([{ a: message }], 'aiTopic');
      } else {
        await producer.sendMessage([{ a: message }], client);
      }
      console.log('produced successfully', message);
      await producer.shutdown();
      return res.json({ reply: 'Success!' });
    } catch (err) {
      return res.status(405).send({ reply: 'Method Not Allowed' });
    }
  }
}
