// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    Kite.deploy();
    res.status(200);
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
