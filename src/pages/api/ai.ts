import type { NextApiRequest } from 'next';
const { db } = require('./pg.ts');
const { Configuration, OpenAIApi } = require('openai');
import { NextApiResponseServerIO } from "src/types/io";

const configuration = new Configuration({
    apiKey: process.env.AI_KEY,
  });
const openai = new OpenAIApi(configuration);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIO
  ) {
    try {
            //get AI user
            const aiUserResponse = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: 'Write a fun online chatroom username',
                max_tokens: 30,
                temperature: 0.9,
              });
            const aiUsername = aiUserResponse.data.choices[0].text;
            const aiUserQuery = `
            INSERT INTO users(username, password, email)
            VALUES($1, $2, $3)
            RETURNING *`;
            const aiUserValues = [aiUsername, 'ai', 'ai'];
            const aiUserData = await db.query(aiUserQuery, aiUserValues);
            const aiUserId = aiUserData.rows[0].user_id;
            //generate message from openai api
            console.log('generating a new AI message...');
            const query3 = 'SELECT * FROM messages ORDER BY message_id DESC LIMIT 10';
            const data3 = await db.query(query3);
            const response = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: `Given this array of messages that have been sent in an online chatroom: ${data3}. 
                Write a single message to add to chatroom. The message should be no more than one short sentence, 
                have limited punctuation, and use hip abbreviations. Do not send any greetings. Instead, just ask questions, or say funny or random things.`,
                max_tokens: 30,
                temperature: 0.5,
            });
            const aiMessage = response.data.choices[0].text;
            //log message in database
            const query = `INSERT INTO messages(sender_id, message) VALUES($1, $2) RETURNING *`;
            const values = [aiUserId, aiMessage];
            await db.query(query, values);
            const query2 = `SELECT username FROM users WHERE user_id = $1`;
            const data2 = await db.query(query2, [aiUserId]);
            const username = data2.rows[0].username;
            console.log(username);
            //construct message to send through
            const message = {
                sender_id: aiUserId,
                message: aiMessage,
                avatar: '',
                };
            //use socket server, same strategy as chat api call
            res?.socket?.server?.io?.emit("message", message);
    } catch (err) {
        return res.status(405).send({ reply: 'Method Not Allowed' });
    }
  }
