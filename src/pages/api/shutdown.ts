// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';

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
    const execSync = require('child_process').execSync;
    //this should shut down the springboot app running on 8080 --> not working at the moment
    execSync(`curl 'http://localhost:8080/actuator/shutdown' -i -X POST`);
    res.status(200).json({ result: 'success' });
  } else {
    res.status(405).send({ error: 'Method Not Allowed' });
  }
}
