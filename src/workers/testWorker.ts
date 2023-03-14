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
globalThis.onmessage = async (event: MessageEvent) => {
  try {
    const state = await fetch('/api/kite/getKiteState').then((data) =>
      data.text()
    );
    const setup = await fetch('/api/kite/getSetup').then((data) => data.json());
    //send message to existing topic (commented out version is if you want to access spring endpoint directly)
    if (event.data.newMessage) {
      // await fetch(`http://localhost:${setup.spring.port}/api/kafka/publish`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     timestamp: Date.now.toString(),
      //     message: event.data.newMessage
      //   })
      // });
      await fetch('/api/kite/connect/kafka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'sendMessage',
          messages: [{ value: event.data.newMessage }],
          topic: event.data.topic
        })
      }).then((data) => data.json());
    }
    //creating a new topic
    else if (event.data.newTopic) {
      await fetch('/api/kite/connect/kafka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'createTopics',
          topic: event.data.newTopic
        })
      }).then((data) => data.json());
    }

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
};

export {};
