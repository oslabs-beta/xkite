import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '../../../src/common/kite';

type Result = {
  result?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  if (req.method === 'DELETE') {
    await Kite.shutdown();
    res.status(200).json({ result: 'success' });
  } else {
    res.status(405).send({ error: 'Method Not Allowed' });
  }
}
