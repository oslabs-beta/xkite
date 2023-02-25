// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '@/common/kite';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await Kite.disconnect();
  return res.status(200).json({});
}
