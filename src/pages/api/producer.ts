import type { NextApiRequest, NextApiResponse } from 'next';
import ProducerFactory from '../../common/utilities/producerUtil';
const clientId = 'json1';
const brokers = ['localhost:9092', 'localhost:9093'];
const topic = 'newSetupTopic';

type Data = {
  reply?: string;
  err?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
  try {
    //get message from req.body
    const { message} = req.body;
    const producer = new ProducerFactory(brokers, clientId);
    await producer.start();
    await producer.sendBatch([{a: message}], topic);
    await producer.shutdown();
    console.log('produced successfully');
    // //await producer.disconnectProducer();
    return res.json({ reply: 'Success!' });
  } catch (err) {
    return res.status(405).send({ reply: 'Method Not Allowed' });
  }
}
}
