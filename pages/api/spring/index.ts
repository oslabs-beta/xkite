// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';

/**
 * Returns a boolean isOpen indicating whether a given port is open
 * @param {NextApiRequest} req - NextApiRequest - This is the request object that Next.js provides.
 * @param res - NextApiResponse<isOpen | string>
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<void>
) {
  if (req.method === 'GET') {
    return res.status(405).send();
    //TBD ...
    // try {
    //   const {spring} = await Kite.getSetup();
    //   let URI = `localhost:${spring.port}/api/kafka/data`;
    //   const response = await fetch(URI, {
    //     method: 'GET',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify(req.body),
    //   });
    //   return res.status(response.status).;
    // } catch (err) {
    //   console.log(err);
    //   res.status(500);
    // }
  } else if (req.method === 'POST') {
    try {
      const { spring } = await Kite.getSetup();
      let URI = `localhost:${spring.port}`;
      if ('topicname' in req.body) URI += '/api/v1/topics/create';
      else URI += '/api/kafka/public';
      console.log(URI);
      console.log(req.body);
      const response = await fetch(URI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: '*/*' },
        body: JSON.stringify(req.body),
      });
      return res.status(response.status).send();
    } catch (err) {
      console.log(err);
      res.status(500).send();
    }
  } else {
    res.status(405).send();
  }
}
