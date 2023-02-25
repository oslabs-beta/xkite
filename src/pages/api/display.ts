import http from 'http';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';

// import DisplayPage from '@/common/display';

const port = 6662;

const server = http.createServer((req, res) => {
  console.log('in the server');
  try {
    if (req.url === '/display') {
      // const pageHtml = renderToString(createElement(DisplayPage));
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      // res.write(pageHtml);
      res.end();
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.write('Internal Server Error');
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
