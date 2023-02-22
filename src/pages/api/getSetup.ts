// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';

type Setup = KiteSetup;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Setup>
) {
  const setup = await Kite.getSetup();
  res.status(200).json(setup);
}
