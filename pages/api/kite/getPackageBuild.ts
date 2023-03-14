// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next/types';
let { Kite } = require('xkite-core');
if (Kite === undefined) {
  console.log('using secondary import...');
  Kite = require('xkite-core').default;
}
import ReadableString from '@/common/utilities';

type File = string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<File>
) {
  if (req.method === 'GET') {
    try {
      const packageBuild = await Kite.getPackageBuild();
      if (packageBuild instanceof Error) return res.status(500);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=package.zip');
      if (!packageBuild) throw Error('package build not defined!');
      res.writeHead(200, packageBuild.header);
      const s = new ReadableString(packageBuild.fileStream);
      s.pipe(res);
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error /api/kite/getPackageBuild');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}

export const config = {
  api: {
    responseLimit: false
  }
};
