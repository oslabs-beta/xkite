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
import type { KiteState, KiteSetup } from 'xkite-core';

globalThis.onmessage = async (event: MessageEvent<number>) => {
  queryBackEnd();
  const interval = setInterval(queryBackEnd, event.data);
  async function queryBackEnd() {
    try {
      const state = await fetch('/api/kite/getKiteState').then((data) =>
        data.text()
      );
      postMessage({ state });
      const setup: KiteSetup = await fetch('/api/kite/getSetup').then((data) =>
        data.json()
      );
      postMessage({ setup });

      let metricsReady = false;
      if (state === 'Running') {
        if (setup.jmx !== undefined) {
          console.log(`http://localhost:${setup.jmx.ports[0]}`);
          const resp = await fetch(`http://localhost:${setup.jmx.ports[0]}`, {
            method: 'GET',
            mode: 'no-cors'
          });
          console.log(resp.status);
          metricsReady = resp.status === 0;
          if (metricsReady) clearInterval(interval);
          postMessage({ metricsReady });
          // const text = await resp.text();
          // console.log(text);
          // const expression = /jmx_scrape_error(\d+)./i;
          // const match = expression.exec(text);
          // metricsReady = match[1] === '0';
        }
      }
      postMessage({ metricsReady });
    } catch (err) {
      console.log(err);
    }
  }
};

export {};
