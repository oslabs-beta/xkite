// console.log('Worker Initialization');
import http2, { ClientHttp2Session } from 'http2';

// const query = {
//   ksql: 'LIST STREAMS;', //optional
//   sql: `SELECT * FROM ridersNearMountainView EMIT CHANGES;`,
// };

// addEventListener('message', (event: MessageEvent<number>) => {
//   postMessage(client.getData(event.data))
// })

// addEventListener('message', (event: MessageEvent<object>) => {
//   console.log(JSON.stringify(event));
//   client.request(event.data);
//   postMessage(client.getData);
// });

addEventListener('message', async (event: MessageEvent<object>) => {
  const url = 'http://localhost:8088/query-stream'; //TODO: make dynamic input
  // headers.append("Authorization","********");
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: '********',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
    },
    body: JSON.stringify(event.data),
  });
  const reader = response.body?.getReader();
  function push() {
    reader?.read().then(({ done, value }) => {
      if (done) {
        return;
      }
      //post chunk to main thread
      const streamData = new TextDecoder().decode(value);
      postMessage(streamData);
      //try to read message
      push();
    });
  }
  push();
  // console.log(JSON.stringify(event.data));
  // client.request(JSON.parse(event.data));
  // client.request(event.data);
});

export {};
