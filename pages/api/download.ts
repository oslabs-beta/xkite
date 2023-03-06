// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';
import ReadableString from '@/common/utilities';
type File = string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<File>
) {
  if (req.method === 'GET') {
    try {
      const configObj = await Kite.getConfigFile();
      if (configObj instanceof Error) return res.status(500);
      res.setHeader('Content-Type', 'application/x-yaml');
      res.setHeader('Content-Disposition', 'attachment; filename=config.yaml');
      if (!configObj) throw Error('ConfigObj not defined!');
      res.writeHead(200, configObj.header);
      const s = new ReadableString(configObj.fileStream);
      s.pipe(res);
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error /api/kite/download');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
