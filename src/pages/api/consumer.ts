import type { NextApiRequest, NextApiResponse } from 'next';
const { Kafka, logLevel } = require('kafkajs');
const clientId = 'myGroup2';
const brokers = ['localhost:9092'];
const topic = 'jsonTopic2';

type Data = {
    reply?: string;
    err?: unknown;
  };


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse <Data>
  ) {
      
    try {

const kafka = new Kafka({
    clientId,
    brokers,
    enforceRequestTimeout: true,
    logLevel: logLevel.DEBUG,
    connectionTimeout: 20000,
    });

    const consumer = await kafka.consumer({ groupId: clientId });
    let data: any[] = [];
    
    await consumer.connect();
    await consumer.subscribe({ topic });
    await consumer.run({
        eachMessage: (message: any) => {
            console.log(`received message: ${message}`);
            data.push(message);
            },
    });
   
    console.log(data, 'this is from consumer api');
    return res.send({reply: JSON.stringify(data)});
    } catch (err) {
        return res.status(405).send({ reply: 'Method Not Allowed' });
    }
  }