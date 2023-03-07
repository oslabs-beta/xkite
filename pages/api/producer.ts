import type { NextApiRequest
 // , NextApiResponse 
} from 'next/types';
import ProducerFactory from '../../src/common/kafkaConnector/ProducerFactory';
import { NextApiResponseServerIO } from 'src/common/types/io';

//const clientId = 'json1';
const brokers = ['localhost:9092', 'localhost:9093'];
//const topic = 'humanTopic';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method === 'POST') {
    try {
      //get message from req.body
      const { message, topic } = req.body;
      //console.log(ai, 'from prod');
      //TO DO: add a static topic
      const producer = await ProducerFactory.create({ brokers: brokers });
      //new ProducerFactory(brokers, clientId);
      // await producer.start();
      await producer.sendBatch([message], topic);
      // res?.socket?.server?.io?.emit("message", message);
      await producer.shutdown();
      console.log('produced successfully');
      //await producer.disconnectProducer();
      return res.json({ reply: 'Success!' });
    } catch (err) {
      return res.status(405).send({ reply: 'Method Not Allowed' });
    }
  }
}
