import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';

type Data = {
  reply?: string;
  err?: unknown;
};

const defaultConfig = {
  numOfClusters: 1,
  dataSource: 'postgresql',
  sink: 'jupyter',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    console.log('configuring kite...');
    const config = req.body ? { ...defaultConfig, ...req.body } : defaultConfig;
    console.log('config is: ', config);
    Kite.configure(config);
    console.log('deploying kite...');
    Kite.deploy();
    res.status(200).json({ reply: 'success' });
    //TO DO: uncomment when you connecting to the front-end
    //res.redirect('/api/display');
  } else {
    res.status(405).send({ reply: 'Method Not Allowed' });
  }
}
