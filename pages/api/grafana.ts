import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === 'GET') {
    res.redirect('http://localhost:3050/');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
