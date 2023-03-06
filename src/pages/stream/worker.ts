// console.log('Worker Initialization');
import Kite from '@/common/kite';
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

addEventListener(
  'message',
  async (event: MessageEvent<{ type: string; ksql: string }>) => {
    const resp = await fetch('http://localhost:3000/api/kite/getSetup');
    const setup = await resp.json();
    const port = setup.dBSetup?.port ?? 8088;
    let url: string = `http://localhost:${port}`;
    if (event.data.type === 'create') url += '/ksql';
    else url += '/query-stream';
    // headers.append("Authorization","********");
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.ksql.v1+json',
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
  }
);

export {};
