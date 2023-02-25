// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '@/common/kite';

type Setup = KiteSetup;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Setup | string>
) {
  if (req.method === 'GET') {
    const setup = await Kite.getSetup();
    res.status(200).json(setup);
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
