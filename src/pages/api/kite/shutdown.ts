import type { NextApiRequest, NextApiResponse } from 'next';
import Kite from '@/common/kite';
import { spawn } from 'child_process';

const urls: string[] = [
  `http://localhost:${process.env.PORT1 || 6661}/`,
  `http://localhost:${process.env.PORT1 || 6661}/setup`,
  `http://localhost:${process.env.PORT2 || 6662}/display`
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
    const kite = Kite.shutdown();
    for (const url of urls) {
      if (process.platform === 'darwin') {
        // For macOS
        spawn('osascript', ['-e', `tell application "Google Chrome" to close (tabs of window 1 whose URL is "${url}")`]);
      } else {
        // For other platforms
        spawn('taskkill', ['/F', '/IM', 'chrome.exe']);
      }
    }
    res.status(200).json({ result: 'success' });
  } else {
    res.status(405).send({ error: 'Method Not Allowed' });
  }
}
