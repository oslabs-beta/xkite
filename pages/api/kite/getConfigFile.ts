// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
let { Kite } = require('xkite-core');
if (Kite === undefined) {
  console.log('using secondary import...');
  Kite = require('xkite-core').default;
}
import { KiteConfigFile } from 'xkite-core/lib/cjs/types';

type ConfigFile = KiteConfigFile;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigFile | string>
) {
  if (req.method === 'GET') {
    try {
      const configFile = await Kite.getConfigFile();
      if (!configFile) throw Error('ConfigFile not defined!');
      res.status(200).json(configFile);
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error /api/kite/getConfigFile');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
