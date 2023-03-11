// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
let { Kite } = require('xkite-core');
if (Kite === undefined) {
  console.log('using secondary import...');
  Kite = require('xkite-core').default;
}
import { KiteConfig } from 'xkite-core/lib/cjs/types';

type Config = KiteConfig;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Config | string>
) {
  if (req.method === 'GET') {
    try {
      const config: KiteConfig | undefined = await Kite.getConfig();
      console.log(config, 'from backend');
      if (!config) throw Error('Config not defined!');
      res.status(200).json(config);
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error /api/kite/getConfig');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
