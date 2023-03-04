import http2, { ClientHttp2Session } from 'http2';

class KsqlDBClient {
  //todo: put in class
  client: ClientHttp2Session;
  constructor(ksqlDBBaseUrl: string) {
    this.client = http2.connect(ksqlDBBaseUrl);
    this.client.on('error', (error: Error) => console.error(error));
  }

  async request(query: object): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('request...');
      const session = this.client.request({
        [http2.constants.HTTP2_HEADER_PATH]: '/query-stream',
        [http2.constants.HTTP2_HEADER_METHOD]: 'POST',
        [http2.constants.HTTP2_HEADER_CONTENT_TYPE]: 'application/json',
        // 'application/vnd.ksql.v1+json',
      });
      const payload = Buffer.from(JSON.stringify(query) + '\n');
      let data = '';
      session.write(payload, 'utf8');
      session.end();
      session.on('data', (chunk) => {
        data += chunk;
        console.log('chunk:' + chunk);
        resolve(data);
      });
      session.on('end', () => {
        console.log('queryResult', data);
        session.destroy();
        resolve(data);
      });
      session.on('error', (err: Error) => {
        console.log('error...');
        session.destroy();
        reject(err);
      });
      // session.end(payload);
    });
  }
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
type File = string;
const client = new KsqlDBClient('http://localhost:8088'); //todo: make dynamic

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<File>
) {
  if (req.method === 'POST') {
    try {
      const query = {
        ksql: 'LIST STREAMS;',
        sql: `SELECT * FROM ridersNearMountainView EMIT CHANGES;`,
      };
      const response = await client.request(query);
      res.status(200).send(response);
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error /api/playground/ksql');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
