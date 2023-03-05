import type { NextApiRequest, NextApiResponse } from 'next/types';
import Kite from '@/common/kite';
import { spawn } from 'child_process';

const urls: string[] = [
  `http://localhost:${process.env.PORT1 || 6661}/`,
  `http://localhost:${process.env.PORT1 || 6661}/setup`,
  `http://localhost:${process.env.PORT2 || 6662}/display`,
];

type Result = {
  result?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  if (req.method === 'DELETE') {
    const kite = await Kite.shutdown();
    for (const url of urls) {
      if (process.platform === 'darwin') {
        // For mac
        spawn('osascript', [
          '-e',
          `tell application "Google Chrome" to close (tabs of window 1 whose URL is "${url}")`,
        ]);
      } else if (process.platform === 'win32') {
        // For Windows
        spawn('taskkill', [
          '/F',
          '/IM',
          'tasklist.exe',
          '/FI',
          `IMAGENAME eq chrome.exe`,
        ]).stdout.on('data', (data) => {
          const processes = data
            .toString()
            .split('\r\n')
            .slice(3)
            .filter((line: string) => line.trim() !== '')
            .map((line: string) => line.trim().split(/\s+/)[0]);
          processes.forEach((pid: string) => {
            spawn('taskkill', ['/F', '/PID', pid]);
          });
        });
      } else if (process.platform === 'linux') {
        // For Linux
        spawn('pkill', ['-f', `${url}`]);
      }
    }
    res.status(200).json({ result: 'success' });
  } else {
    res.status(405).send({ error: 'Method Not Allowed' });
  }
}
