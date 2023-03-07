//import { NextApiRequest } from 'next/types';
import { NextApiResponseServerIO } from 'src/common/types/io';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
//import ExampleConsumer from '../../src/common/utilities/consumerUtil';
const { Kafka } = require('kafkajs');

//const clientId = 'json1';
const brokers = ['localhost:9092', 'localhost:9093'];
//const topic = 'humanTopic';

export const config = {
  api: {
    bodyParser: false
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async (
  //req: NextApiRequest, 
  res: NextApiResponseServerIO) => {
 // const newConsumer = new ExampleConsumer(brokers, clientId);
  try {
    //tcp connection
    const kafka = new Kafka({
      clientId: 'json1',
      brokers: brokers
    });
    //to create a topic you need to create a producer

    const consumer = kafka.consumer({ groupId: 'test' });

    console.log('Connecting...');
    await consumer.connect();
    console.log('Connected!');

    // await consumer.disconnect();
    await consumer.subscribe({
      topic: 'Base',
      fromBeginning: true
    });
    console.log('trying to RUUUN');
    await consumer.run({
      eachMessage: async (result) => {
        console.log(
          `received message ${result.message.value} on partition ${result.partition}`
        );
      }
    });
  } catch (error) {
    console.log(`something bad happened, the error is ${error}`);
  }

  // let topics = await newConsumer.listTopics();
  // await newConsumer.startBatchConsumer(topics);
  console.log('...new consumer socket');
  if (!res.socket.server.io) {
    console.log('New Socket.io server...');
    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket'
    });
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;
  }
  res.end();
};
