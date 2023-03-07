import { NextApiRequest } from "next/types";
import { NextApiResponseServerIO } from "src/common/types/io";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
//import Kite from '@/common/kite';
//import ConsumerFactory from '@/common/kafkaConnector/ConsumerFactory'; //note: socket API path is not currently being used in tests page
//will remove altogether if we decide not to use it

export const config = {
  api: {
    bodyParser: false,
  },
};

// eslint-disable-next-line import/no-anonymous-default-export 
export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  console.log(req.body);
  // const kafkaSetup = Kite.getKafkaSetup();
  // const newConsumer = new ConsumerFactory(kafkaSetup);
  // const topics = await newConsumer.listTopics();
  // await newConsumer.startBatchConsumer(topics);
  //console.log('...new consumer socket')
  if (!res.socket.server.io) {
    
    console.log("New Socket.io server...");
    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socket",
    });
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;
  }
  res.end();
};