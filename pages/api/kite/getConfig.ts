// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { KiteConfig } from '@kite/types';
import Kite from '@/common/kite';

type Config = KiteConfig;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Config | string>
) {
  if (req.method === 'GET') {
    try {
      const config: KiteConfig | undefined = await Kite.getConfig();
      console.log(config, 'from backend')
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
