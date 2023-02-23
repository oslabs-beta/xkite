// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';
import { Kafka } from 'kafkajs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


type Data = {
    reply?: string;
    err?: unknown;
  };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    
    try {
        console.log('booting up monitoring app...');
        const execSync = require('child_process').execSync;
        //this boots up the springboot application on port 8080 (default port for springboot apps)
        const output = await execSync(`cd src && cd common && cd springApp && mvn spring-boot:run`);
        console.log(output);
        //will require the frontend to respond with a redirect to http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=10s
        return res.status(201).json({reply: "Successfully started springboot app"})
    } catch (err) {
      return res.status(500).json({ err: err });
    }
  }