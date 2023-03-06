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
    responseLimit: false,
  },
};
