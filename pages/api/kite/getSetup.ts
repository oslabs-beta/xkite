// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';

type Setup = KiteSetup;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Setup | string>
) {
  if (req.method === 'GET') {
    try {
      const setup = await Kite.getSetup();
      if (!setup) throw Error('Setup not defined!');
      res.status(200).json(setup);
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error /api/kite/getSetup');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
