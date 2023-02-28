import { Html, Head, Main, NextScript } from 'next/document';
import Image from 'next/image';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function Document() {
  return (
    <Html lang='en'>
      <Head />
      <body>
        <header>
          <Navbar
            bg='dark'
            variant='dark'
            sticky='top'
            className='px-5 justify-content-between'
          >
            <Navbar.Brand href='https://github.com/oslabs-beta/xkite'>
              xkite
              <Image
                src='/favicon-32x32.png'
                alt='kite'
                height={20}
                width={20}
              />
            </Navbar.Brand>
            <Nav>
              <Nav.Link href='/'>Home</Nav.Link>
              <Nav.Link href='/setup'>Configure</Nav.Link>
              <Nav.Link href='http://localhost:6662/display'>Display</Nav.Link>
            </Nav>
          </Navbar>
        </header>
        <br />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
// style={{ width: '100vh' }}
// className='justify-content-between'
