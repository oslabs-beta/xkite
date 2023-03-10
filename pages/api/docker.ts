import type { NextApiRequest, NextApiResponse } from 'next/types';
import { exec } from 'child_process';
import util from 'util';

type Container = {
  id: string;
  image: string;
  command: string;
  created: string;
  status: string;
  ports: string;
  names?: string;
};

type Containers = {
  containers: Container[];
};

const execPromise = util.promisify(exec);
/**
 * Returns a boolean isOpen indicating whether a given port is open
 * @param {NextApiRequest} req - NextApiRequest - This is the request object that Next.js provides.
 * @param res - NextApiResponse<isOpen | string>
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Containers | string>
) {
  if (req.method === 'GET') {
    try {
      const containerType = req.query.containerStatus as string;
      if (containerType === 'active') {
        const { stdout } = await execPromise('docker ps');
        const lines = stdout.trim().split('\n').slice(1);
        const containers = lines.map((line) => {
          const [id, image, command, created, status, ports, names] = line
            .trim()
            .split(/\s{2,}/);
          return {
            id,
            image,
            command,
            created,
            status,
            ports,
            names
          };
        });
        res.status(200).json({ containers });
      } else if (containerType === 'inactive') {
        const { stdout } = await execPromise(
          'docker ps -a --filter "status=exited" --filter "status=created"'
        );
        const lines = stdout.trim().split('\n').slice(1);
        const containers = lines.map((line) => {
          const [id, image, command, created, status, ports, names] = line
            .trim()
            .split(/\s{2,}/);
          return {
            id,
            image,
            command,
            created,
            status,
            ports
          };
        });
        res.status(200).json({ containers });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
