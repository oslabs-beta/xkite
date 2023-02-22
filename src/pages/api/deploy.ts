// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  Kite.deploy();
  res.status(200);
}
