// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '@/common/kite';

type Config = KiteConfig;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Config>
) {
  const config = await Kite.getConfig();
  res.status(200).json(config);
}
