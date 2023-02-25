import type { NextApiRequest, NextApiResponse } from 'next';
const { db } = require('./pg.ts');

type Data = {
    reply?: string;
    err?: unknown;
  };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
   
    try {
        const query = 'SELECT m.*, users.username, users.avatar FROM messages m INNER JOIN users ON users.user_id = m.sender_id ORDER BY message_id DESC LIMIT 50';
        const data = await db.query(query);
        const returnMessages = data.rows.reverse();
        return res.json(returnMessages);
    } catch (err) {
        return res.status(405).send({ reply: 'Method Not Allowed' });
    }
  }
