// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';

type ConfigFile = KiteConfigFile;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigFile>
) {
  const configFile = Kite.getConfigFile();
  res.status(200).json(configFile);
}
