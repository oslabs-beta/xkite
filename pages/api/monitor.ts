import type { NextApiRequest, NextApiResponse } from 'next/types';

type Data = {
  reply?: string;
  err?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    console.log('booting up monitoring app...');
    return res
      .status(201)
      .json({ reply: 'Successfully started springboot app' });
  } catch (err) {
    return res.status(500).json({ err: err });
  }
}
