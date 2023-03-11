import type { NextApiRequest, NextApiResponse } from 'next/types';

import type { KiteConfig } from 'xkite-core';
let { Kite } = require('xkite-core');
if (Kite === undefined) {
  console.log('using secondary import...');
  Kite = require('xkite-core').default;
}

type Data = {
  reply?: string;
  err?: unknown;
};

//const kiteHost = 'localhost:6661';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    console.log('configuring kite...');

    const config: KiteConfig = req.body
      ? { ...Kite.defaultCfg, ...req.body }
      : Kite.defaultCfg;
    console.log('config is: ', JSON.stringify(config));
    Kite.configure(config);
    console.log('deploying kite...');
    await Kite.deploy();

    res.status(200).json({ reply: 'success' });
    //TO DO: uncomment when you connecting to the front-end
    // res.redirect('/display');
  } else {
    res.status(405).send({ reply: 'Method Not Allowed' });
  }
}
