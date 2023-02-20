// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';
import { Kafka } from 'kafkajs';

type Data = {
  reply?: string;
  err?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('constructing kite...');
  const kite = new Kite();
  console.log('deploying kite...');
  kite.deploy();
  const { dataSetup, kafkaSetup } = kite.getSetup();
  const topic = 'messages';
  const kafka = new Kafka({
    clientId: 'chat-gui',
    ...kafkaSetup,
  });
  const admin = kafka.admin();

  try {
    console.log(`connect to kafka...`);
    await admin.connect();
    // create topic
    console.log(`creating topic...`);
    const resp = await admin.createTopics({
      // validateOnly: <boolean>,
      waitForLeaders: false,
      // timeout: <Number>,
      topics: [
        {
          topic,
          numPartitions: 3,
          replicationFactor: kafkaSetup.brokers.length, // less than number of brokers..
        },
      ],
    });
    console.log(`Created topics...${JSON.stringify(resp)}`);
    await admin.disconnect();
  } catch (err) {
    return res.status(500).json({ err: err });
    console.log(err);
  }
  res.status(200).json({ reply: 'success' });
}
