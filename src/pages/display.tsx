import React, { useState, SyntheticEvent } from 'react';
import axios from 'axios';

import Head from 'next/head';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import Row from 'react-bootstrap/Row';
import ShutDownBtn from './components/_ShutdownBtn';

export default function Display() {
  const [message, setMessage] = useState('');

  // const submitHandler = async (event: SyntheticEvent): Promise<void> => {
  //   event.preventDefault();

  //   const send = await axios.post('http://localhost:8080/api/kafka/publish', {
  //     timestamp: new Date().toISOString(),
  //     message,
  //   });
  //   console.log(send);

  //   setMessage('');
  // };

  const submitHandler = (event: SyntheticEvent): void => {
    event.preventDefault();

    axios
      .post('http://localhost:8080/api/kafka/publish', {
        timestamp: new Date().toISOString(),
        message,
      })
      .then((data) => console.log(data))
      .catch((error) => console.error(error));

    setMessage('');
  };

  return (
    <>
      <Head>
        <title>xKite Display Page</title>
        <meta name='description' content='xKite Homepage' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>
      <main>
        <h1>General Display Page</h1>
        <div className='metrics1'>
          <div>
            <h3>Brokers Online</h3>
            <iframe src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=647&kiosk'></iframe>
          </div>
          <div>
            <h3>Active Controllers</h3>
            <iframe src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=233&kiosk'></iframe>
          </div>
          <div>
            <h3>Total Topics</h3>
            <iframe src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=625&kiosk'></iframe>
          </div>
          <div>
            <h3>Online Partitions</h3>
            <iframe src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=40&kiosk'></iframe>
          </div>
        </div>
        <div className='metrics2'>
          <div>
            <h3>Producer Latency</h3>
            <iframe
              src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=192&kiosk'
              width='400'
              height='300'
            ></iframe>
          </div>
          <div>
            <h3>Message Throughput</h3>
            <iframe
              src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=152&kiosk'
              width='800'
              height='300'
            ></iframe>
          </div>
        </div>
        <div className='metrics2'>
          <div>
            <h3>Failed Produce Requests</h3>
            <iframe
              src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=612&kiosk'
              width='1000'
              height='500'
            ></iframe>
          </div>
        </div>
        {/* localhost:8080/api/kafka/publish post --> {"timestamp": "1","message": "hello"} */}
        <Form className='mb-3' onSubmit={submitHandler}>
          <Row className='align-items-end'>
            <Form.Group className='col-4' controlId='sendingMessage'>
              <Form.Label>Send Message</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter message'
                onChange={(e) => setMessage(e.target.value)}
                value={message}
              />
            </Form.Group>
            <FormGroup className='col-2 '>
              <Button variant='primary' type='submit'>
                Send
              </Button>
            </FormGroup>
          </Row>
        </Form>
        <div className='buttons'>
          <Button
            variant='secondary'
            href='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&kiosk=tv'
          >
            View more metrics
          </Button>
          <ShutDownBtn />
        </div>
      </main>
    </>
  );
}
