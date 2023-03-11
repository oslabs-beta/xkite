import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '../../../src/common/kite';
import { KiteConfig } from '../../../src/common/kite/types';

type Data = {
  reply?: string;
  err?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    console.log('configuring kite...');
    const config: KiteConfig = req.body
      ? { ...Kite.defaultCfg, ...req.body }
      : Kite.defaultCfg;
    console.log('config is: ', JSON.stringify(config));
    Kite.configure(config);
    console.log('deploying kite...');
    await Kite.deploy();

    res.status(200).json({ reply: 'success' });
  } else {
    res.status(405).send({ reply: 'Method Not Allowed' });
  }
}
