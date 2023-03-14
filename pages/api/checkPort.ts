// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
import getPort from 'get-port';

type isOpen = {
  isOpen: boolean;
};

/**
 * Returns a boolean isOpen indicating whether a given port is open
 * @param {NextApiRequest} req - NextApiRequest - This is the request object that Next.js provides.
 * @param res - NextApiResponse<isOpen | string>
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<isOpen | string>
) {
  if (req.method === 'POST') {
    try {
      const requestedPort = req.body.port;

      const openPort = await getPort({ port: requestedPort });

      const isOpen = requestedPort == openPort;
      //console.log(isOpen)
      res.status(200).json({ isOpen });
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error /api/kite/checkPort');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
