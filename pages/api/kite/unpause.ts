// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
let { Kite } = require('xkite-core');
if (Kite === undefined) {
  console.log('using secondary import...');
  Kite = require('xkite-core').default;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    if (req.body.service !== undefined) await Kite.unpause(req.body.service);
    else await Kite.unpause();
    res.status(200).json({});
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
