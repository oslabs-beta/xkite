// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '../../common/kite';

type File = string;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<File>
) {
  if (req.method === 'GET') {
    const kite = new Kite();
    const configObj = kite.getConfig();
    if (configObj instanceof Error) return res.status(500);
    res.writeHead(200, configObj.header);
    //TO DO: uncomment when connecting to UI this will download the file in yaml format
    // res.setHeader('Content-Type', 'application/x-yaml');
    // res.setHeader('Content-Disposition', 'attachment; filename=config.yaml');
    configObj.fileStream.pipe(res);
  }
}
