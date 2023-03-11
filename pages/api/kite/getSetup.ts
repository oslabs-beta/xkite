// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
let { Kite } = require('xkite-core');
if (Kite === undefined) {
  console.log('using secondary import...');
  Kite = require('xkite-core').default;
}
import { KiteSetup } from 'xkite-core/lib/cjs/types';

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
