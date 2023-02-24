// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';

type Config = KiteConfig;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Config| string>
) {
  if (req.method === 'GET') {
    const config = await Kite.getConfig();
    res.status(200).json(config);
  } else {
    res.status(405).send('Method Not Allowed');
  }

}
