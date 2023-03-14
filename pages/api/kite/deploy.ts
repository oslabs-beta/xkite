// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
let { Kite } = require('xkite-core');
if (Kite === undefined) {
  console.log('using secondary import...');
  Kite = require('xkite-core').default;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === 'GET') {
    await Kite.deploy();
    res.status(200).send('success');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
