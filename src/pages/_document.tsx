import { Html, Head, Main, NextScript } from 'next/document';
import NavBar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Document() {
  return (
    <Html lang='en'>
      <Head />
      <body>
        <header>
          <NavBar />
        </header>
        <div id='background-wrap'>
          <div className='x1'>
            <div className='cloud'></div>
          </div>
          <div className='x2'>
            <div className='cloud'></div>
          </div>
          <div className='x3'>
            <div className='cloud'></div>
          </div>
          <div className='x4'>
            <div className='cloud'></div>
          </div>
          <div className='x5'>
            <div className='cloud'></div>
          </div>
        </div>
        <br />
        <Main />
        <NextScript />
        <footer>
          <Footer />
        </footer>
      </body>
    </Html>
  );
}
