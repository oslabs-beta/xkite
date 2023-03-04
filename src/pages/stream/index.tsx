import React, {
  useState,
  SyntheticEvent,
  useRef,
  useEffect,
  useCallback,
} from 'react';
// import Head from 'next/head';
// import Form from 'react-bootstrap/Form';
// import Button from 'react-bootstrap/Button';
// import FormGroup from 'react-bootstrap/FormGroup';
// import Row from 'react-bootstrap/Row';

export default function Index() {
  const workerRef = useRef<Worker>();
  const [query, setQuery] = useState('');

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<number>) =>
      alert(`WebWorker Response => ${event.data}`);
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleWork = useCallback(
    async (e: SyntheticEvent) => {
      console.log('handling?');
      // e.preventDefault();
      workerRef.current?.postMessage({ sql: query });
      // setQuery('');
    },
    [query]
  );

  return (
    <>
      {/* <Head>
        <title>xKite Streams</title>
        <meta name='description' content='xKite Streams' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head> */}
      <h1 id='generalHeader'>KSQL Streams</h1>
      {/* <form className='mb-3'> */}
      <div className='align-items-center'>
        <div className='col-4' id='sendingMessage'>
          <label>Get Streams</label>
          <input
            type='text'
            placeholder='Enter a query'
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
        </div>
        <button onClick={handleWork}>send</button>
      </div>
      {/* </form> */}
    </>
  );
}
