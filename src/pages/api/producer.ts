const { Kafka, logLevel } = require('kafkajs');
const clientId = 'myGroup1';
const brokers = ['localhost:9092', 'localhost:9093'];
const topic = 'jsonTopic2';
import KafkaConnector from '../../common/kafkaConnector/index';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  reply?: string;
  err?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const kafkaConnector = new KafkaConnector({
    clientId: clientId,
    brokers: brokers,
    ssl: false,
  });
  try {
    const { message, sender_id, avatar } = req.body;
    let newMessage = [{ key: 'message', value: message }];
    await kafkaConnector.sendMessage(topic, newMessage);
    console.log('produced successfully');
    //producer.disconnect();
    await kafkaConnector.disconnectProducer();
    return res.json({ reply: 'Success!' });
  } catch (err) {
    return res.status(405).send({ reply: 'Method Not Allowed' });
  }
}
