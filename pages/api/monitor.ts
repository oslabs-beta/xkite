import type { NextApiRequest, NextApiResponse } from 'next/types';
// import Kite from '@/common/kite';
// import { Kafka } from 'kafkajs';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

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
    //we won't need this since springboot app is already running in background - potentially redirect user or spawn new page
    return res
      .status(201)
      .json({ reply: 'Successfully started springboot app' });
  } catch (err) {
    return res.status(500).json({ err: err });
  }
}
