import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "src/types/io";
const { db } = require('./pg.ts');

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    // get message
    try{
      const {message, sender_id, avatar} = req.body;
      const query = `INSERT INTO messages(sender_id, message) VALUES($1, $2) RETURNING *`;
      const values = [sender_id, message];
      const data = await db.query(query, values);
      const {message_id, time} = data.rows[0];
      console.log(data.rows, 'this is data.rows');
      const query2 = `SELECT username FROM users WHERE user_id = $1`;
      const data2 = await db.query(query2, [sender_id]);
      const username = data2.rows[0].username;
      const fullMessage = { message, sender_id, message_id, time, username, avatar };
      // dispatch to channel "message"
      res?.socket?.server?.io?.emit("message", fullMessage);
      res.status(201).json(fullMessage);
    } catch(err){
        return res.status(500).json({ err: err });
    }
  }

    
  }
