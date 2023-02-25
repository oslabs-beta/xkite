// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '@/common/kite';

type ConfigFile = KiteConfigFile;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigFile| string>
) {
  if (req.method === 'GET') {
  const configFile = await Kite.getConfigFile();
  res.status(200).json(configFile);
  }else {
    res.status(405).send('Method Not Allowed');
  }
}
