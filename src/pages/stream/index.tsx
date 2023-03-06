import React, {
  useState,
  SyntheticEvent,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import Head from 'next/head';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormGroup from 'react-bootstrap/FormGroup';
import Row from 'react-bootstrap/Row';

export default function Index() {
  const workerRef = useRef<Worker>();
  const [query, setQuery] = useState('');
  const [qResults, setQResults] = useState<string[]>(['']);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<string>) => {
      console.log(event.data);
      setQResults((prev) => [...prev, event.data]);
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleWork = useCallback(
    async (e: SyntheticEvent) => {
      // console.log('handling?');
      // e.preventDefault();
      setQResults(['']);
      let type = 'query';
      if (query.startsWith('CREATE')) type = 'create';
      workerRef.current?.postMessage({ type, sql: query });
      // setQuery('');
    },
    [query]
  );

  return (
    <>
      <Head>
        <title>xKite Streams</title>
        <meta name='description' content='xKite Streams' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>
      <main>
        <h1 id='generalHeader'>KSQL Streams</h1>
        {/* <form className='mb-3'> */}
        <Row className='align-items-center'>
          <Form.Group id='sendingMessage'>
            <Form.Label>Get/Create Streams</Form.Label>
            <InputGroup>
              <InputGroup.Text>SQL Query:</InputGroup.Text>
              <Form.Control
                as='textarea'
                aria-label='With textarea'
                placeholder='Enter a query'
                onChange={(e) => setQuery(e.target.value)}
                value={query}
              />
            </InputGroup>
            <Button onClick={handleWork}>send</Button>
          </Form.Group>
        </Row>
        <Row className='align-items-center'>
          <InputGroup>
            <InputGroup.Text>Results:</InputGroup.Text>
            <Form.Control
              as='textarea'
              aria-label='With textarea'
              value={qResults}
              readOnly
            />
          </InputGroup>
        </Row>
      </main>
    </>
  );
}
