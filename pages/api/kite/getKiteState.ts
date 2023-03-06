// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === 'GET') {
    const state = Kite.getKiteState();
    res.status(200).send(state);
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
