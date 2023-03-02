import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "src/types/io";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import ExampleConsumer from '../../common/utilities/consumerUtil';
const clientId = 'json1';
const brokers = ['localhost:9092', 'localhost:9093'];
const topic = 'newSetupTopic';

export const config = {
  api: {
    bodyParser: false,
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  const newConsumer = new ExampleConsumer(brokers, clientId);
  await newConsumer.startBatchConsumer(topic);
  console.log('...new consumer socket')
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