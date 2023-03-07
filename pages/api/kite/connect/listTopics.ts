import { NextApiResponseServerIO } from "src/common/types/io";
import { Server as ServerIO } from "socket.io";
import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';
import ConsumerFactory from '@/common/kafkaConnector/ConsumerFactory';

type Data = {
    topics?: string[];
    err?: unknown;
  };
// eslint-disable-next-line import/no-anonymous-default-export 
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {

  const kafkaSetup = Kite.getKafkaSetup();
  const newConsumer = new ConsumerFactory(kafkaSetup);
  const topics = await newConsumer.listTopics();
  await newConsumer.shutdown();
  if(topics.length){
    res.status(200).json({ topics });
  }else {
    res.status(405).send({ err: 'Issue accessing topics' });
  }

};