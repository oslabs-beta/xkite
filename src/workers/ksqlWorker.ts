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

globalThis.onmessage = async (event: MessageEvent<{ type: string; ksql: string }>) => {
    try {
      const resp = await fetch('/api/kite/getSetup');
      const setup = await resp.json();
      const isKSQL = (setup.dBSetup?.name ?? 'none') === 'ksql';
      if (!isKSQL) {
        postMessage('KSQL DB not configured');
        return;
      }
      const port = setup.dBSetup?.port ?? 8088;
      let url: string = `http://localhost:${port}/${
        event.data.type ?? '/query-stream'
      }`;
      console.log(url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.ksql.v1+json',
          'Content-Type': 'application/vnd.ksql.v1+json'
        },
        body: JSON.stringify({
          ksql: event.data.ksql
          // streamsProperties: {
          //   'ksql.streams.auto.offset.reset': 'earliest'
          // }
        })
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
    } catch (err) {
      console.log(err);
    }
  }

export {};
