// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';
import { Kafka } from 'kafkajs';

type Data = {
  reply?: string;
  err?: unknown;
};

//const kiteHost = process.env.KITE_HOST || 'localhost:6661'; //if we want to proceed with env variables
const kiteHost = 'localhost:6661';

const defaultConfig = {
  numOfClusters: 1,
  dataSource: 'postgresql',
  sink: 'jupyter',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    console.log('configuring kite...');
    const config = req.body ? { ...defaultConfig, ...req.body } : defaultConfig;
    console.log('config is: ', config);
    Kite.configure(kiteHost);
    Kite.configure(config);
    //const kite = new Kite(config);
    console.log('deploying kite...');
    Kite.deploy();

    //LEAVE THE BELOW CODE FOR BEDUGGING PURPOSES FOR NOW
    // const { kafkaSetup } = Kite.getSetup();
    // const topic = 'messages';
    // const kafka = new Kafka({
    //   clientId: 'chat-gui',
    //   ...kafkaSetup,
    // });
    // console.log('initiating kafka admin...');
    // const admin = kafka.admin();
    // try {
    //   console.log(`connect to kafka...`);
    //   await admin.connect();
    //   // create topic
    //   console.log(`creating topic...`);
    //   const resp = await admin.createTopics({
    //     // validateOnly: <boolean>,
    //     waitForLeaders: false,
    //     // timeout: <Number>,
    //     topics: [
    //       {
    //         topic,
    //         numPartitions: 3,
    //         replicationFactor: kafkaSetup.brokers.length, // less than number of brokers..
    //       },
    //     ],
    //   });
    //   console.log(`Created topics...${JSON.stringify(resp)}`);
    //   await admin.disconnect();
    // } catch (err) {
    //   return res.status(500).json({ err: err });
    // }
    res.status(200).json({ reply: 'success' });
    //TO DO: uncomment when you connecting to the front-end
    // res.redirect('/display');
  } else {
    res.status(405).send({ reply: 'Method Not Allowed' });
  }
}
