import type { NextApiRequest, NextApiResponse } from 'next';
const { db } = require('./pg.ts');

type User = {
    avatar?: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    user_id: string;
}

type Data = {
    reply?: string;
    err?: unknown;
  };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<User | Data>
  ) {
   
    try {
        const ssid = '2224b766-2c6e-4e17-8fa3-c4de3d41a453';
        //const { ssid } = req.body.ssid;
        const query = 'SELECT * FROM users WHERE ssid = $1';
        const data = await db.query(query, [ssid]);
        //console.log(data);
        const newUser: User = {
            avatar: data.rows[0].avatar,
            first_name: data.rows[0].first_name,
            last_name: data.rows[0].last_name,
            username: data.rows[0].username,
            email: data.rows[0].email,
            user_id: ssid
        }
        console.log(newUser, 'from backend');
        return res.json(newUser);
    } catch (err) {
        return res.status(405).send({ reply: 'Method Not Allowed' });
    }
  }
