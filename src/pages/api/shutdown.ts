// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '@/common/kite';

type Result = {
  result?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  if (req.method === 'DELETE') {
    const kite = Kite.disconnect();
    res.status(200).json({ result: 'success' });
  } else {
    res.status(405).send({ error: 'Method Not Allowed' });
  }
}
