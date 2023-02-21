// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';

type Result = {
  result: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  if (req.method === 'DELETE') {
    const kite = new Kite();
    kite.disconnect();
    res.status(200).json({ result: 'success' });
  }
}
