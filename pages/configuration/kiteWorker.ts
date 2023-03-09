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
    const setup: KiteSetup = await fetch('/api/kite/getSetup').then((data) =>
      data.json()
    );

    let metricsReady = false;
    if (state === KiteState.Running) {
      if (setup.jmx !== undefined) {
        console.log(`http://localhost:${setup.jmx.ports[0]}`);
        const resp = await fetch(`http://localhost:${setup.jmx.ports[0]}`, {
          method: 'GET',
          mode: 'no-cors'
        });
        const text = await resp.text();
        console.log(text);
        const expression = /jmx_scrape_error(\d+)./i;
        const match = expression.exec(text);
        metricsReady = match[1] === '0';
      }
    }
    postMessage({ state, setup, metricsReady });
  } catch (err) {
    console.log(err);
  }
});

export {};
