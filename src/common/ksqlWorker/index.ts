import http2, { ClientHttp2Session } from 'http2';

export default class KsqlDBClient {
  data: string;
  //todo: put in class
  client: ClientHttp2Session;
  constructor(ksqlDBBaseUrl: string) {
    this.client = http2.connect(ksqlDBBaseUrl);
    this.data = '';
    this.client.on('error', (error: Error) => console.error(error));
  }

  getData(): string {
    return this.data;
  }

  request(query: object) {
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
      this.data += chunk;
      console.log('chunk:' + chunk);
      // resolve(data);
    });
    session.on('end', () => {
      console.log('queryResult', data);
      this.data = '';
      session.destroy();
      // resolve(data);
    });
    session.on('error', (err: Error) => {
      console.log('error...');
      this.data = '';
      session.destroy();
      // reject(err);
    });
    // session.end(payload);
  }
}
