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
import { KiteState } from '@../../src/common/kite/constants';

addEventListener('message', async (event: MessageEvent<boolean>) => {
  try {
    const state = await fetch('/api/kite/getKiteState').then((data) =>
      data.text()
    );
    const setup = await fetch('/api/kite/getSetup').then((data) => data.json());
    const topics = await fetch('/api/kite/connect/kafka', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'getTopics'
      })
    }).then((data) => data.json());
    postMessage({ state, setup, topics });
  } catch (err) {
    console.log(err);
  }
});

export {};