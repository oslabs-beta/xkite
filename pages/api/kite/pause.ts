import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '../../../src/common/kite';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    if (req.body.service !== undefined) await Kite.pause(req.body.service);
    else await Kite.pause();
    return res.status(200).json({});
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
