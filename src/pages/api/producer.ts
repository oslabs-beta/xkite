const { Kafka, logLevel } = require('kafkajs');
const clientId = 'myGroup2';
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
    // const kafka = new Kafka({
    //   clientId,
    //   brokers,
    //   enforceRequestTimeout: true,
    //   logLevel: logLevel.DEBUG,
    //   acks: 1,
    //   connectionTimeout: 20000,
    // });
    // const producer = await kafka.producer();

    // const produce = async () => {
    //   await producer.connect();
    //   await producer.send({
    //     topic,
    //     messages: [{ key: 'message', value: message }],
    //   });
    // };
    // await produce();
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