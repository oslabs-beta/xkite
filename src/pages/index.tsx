import Head from 'next/head';
import Button from 'react-bootstrap/Button';

export default function Home() {
  return (
    <>
      <Head>
        <title>xkite</title>
        <meta name='description' content='xkite landing page' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>
      <main className='landing-page'>
        <h1>xkite</h1>
        <Button variant='secondary' href='/setup'>
          Configure a Cluster!
        </Button>
      </main>
    </>
  );
}
