import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '../../../src/common/kite';
import { KiteConfigFile } from '../../../src/common/kite/types';

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
