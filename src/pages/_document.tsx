import { Html, Head, Main, NextScript } from 'next/document';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

export default function Document() {
  return (
    <Html lang='en'>
      <Head />
      <body>
        <header>
          <NavBar />
        </header>
        <br />
        <Main />
        <NextScript />
        <footer className='fixed-bottom'>
          <Footer />
        </footer>
      </body>
    </Html>
  );
}
