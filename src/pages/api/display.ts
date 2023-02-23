import http from 'http';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';

import DisplayPage from '../display';

const port2 = 6662;

// Server 2
const server2 = http.createServer((req, res) => {
  console.log('in the server');
  try {
    if (req.url === '/display') {
      const pageHtml = renderToString(createElement(DisplayPage));
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.write(pageHtml);
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('Not found');
      res.end();
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.write('Internal Server Error');
    res.end();
  }
});

server2.listen(port2, () => {
  console.log(`Server 2 listening on port ${port2}`);
});
