// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    if (req.body.service !== undefined) await Kite.unpause(req.body.service);
    else await Kite.unpause();
    return res.status(200).json({});
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
