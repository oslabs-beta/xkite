import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

import { SyntheticEvent, useState, useEffect } from 'react';
// import defaultCfg from '@/common/kite/constants';
import ShutDownBtn from './ShutdownBtn';

export default function ConfigurationForm(props: unknown) {
  const [kiteConfigRequest, setKiteConfigRequest] = useState({
    kafka: {
      brokers: { size: 0 },
      zookeepers: { size: 0 },
    },
    db: { name: 'postgresql' },
    sink: { name: 'jupyter' },
  });
  // on load get default config from server
  useEffect(() => {
    console.log('getting routes...');
    fetch('/api/kite/getConfig')
      .then((res) => res.json())
      .then((data) => setKiteConfigRequest(data))
      .catch((err) => console.log(`Error getting Config on startup: ${err}`));
  }, [props]);

  function updateKiteConfigRequest(
    // Prevent numeric values from going below 1
    update: Partial<KiteConfig>
  ) {
    const value = Object.values(update)[0];
    if (typeof value === 'number' && value <= 0) return;

    setKiteConfigRequest(() => {
      return {
        ...kiteConfigRequest,
        ...update,
      };
    });
  }

  function submitHandler(event: SyntheticEvent) {
    event.preventDefault();
    console.log('sending configuration…');
    // console.log(defaultCfg);

    fetch('/api/kite/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kiteConfigRequest),
    })
      .then((response) => {
        console.dir(response);
        // setKiteConfigRequest(defaultConfig);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  function exportConfigHandler(event: SyntheticEvent) {
    console.log('Configuration exporting is not implemented yet');
  }

  return (
    <Container>
      <Form className='mb-3' onSubmit={submitHandler}>
        <Row className='align-items-end'>
          <Form.Group className='col-2' controlId='kafka.broker.size'>
            <Form.Label>Clusters</Form.Label>
            <Form.Control
              type='number'
              // placeholder='How many kafka brokers?'
              onChange={(e) => {
                const size = +e.target.value;
                const update = {
                  kafka: {
                    ...kiteConfigRequest.kafka,
                    brokers: {
                      ...kiteConfigRequest.kafka.brokers,
                      size,
                    },
                  },
                };
                updateKiteConfigRequest(update);
              }}
              value={kiteConfigRequest.kafka.brokers.size.toString()}
            />
          </Form.Group>
          {/*<Form.Group className='mb-3 col-6' controlId='numberOfBrokers'>*/}
          {/*  <Form.Label>Number of Brokers</Form.Label>*/}
          {/*  <Form.Control*/}
          {/*    type='number'*/}
          {/*    placeholder='Password'*/}
          {/*    onChange={(e) => {*/}
          {/*      const numberOfBrokers = +e.target.value;*/}
          {/*      updateKiteConfigRequest({ numberOfBrokers });*/}
          {/*    }}*/}
          {/*    value={kiteConfigRequest.numberOfBrokers}*/}
          {/*  />*/}
          {/*</Form.Group>*/}
          {/*TODO: Convert to a selection drop down*/}
          <Form.Group className='col-4' controlId='dataSource'>
            <Form.Label>Data Source</Form.Label>
            <Form.Control
              type='text'
              placeholder='Data Source'
              onChange={(e) => {
                if (
                  !(
                    e.target.value === 'postgresql' || e.target.value === 'ksql'
                  )
                )
                  throw TypeError(`Invalid Data Source ${e.target.value}`);
                else
                  return updateKiteConfigRequest({
                    db: { name: e.target.value },
                  });
              }}
              value={kiteConfigRequest.db?.name}
            />
          </Form.Group>
          <Form.Group className='col-4' controlId='sink'>
            <Form.Label>Data Sink</Form.Label>
            <Form.Control
              type='text'
              placeholder='Data Sink'
              onChange={(e) => {
                if (
                  !(e.target.value === 'jupyter' || e.target.value === 'spark')
                )
                  throw TypeError(`Invalid Data Sink ${e.target.value}`);

                updateKiteConfigRequest({ sink: { name: e.target.value } });
              }}
              value={kiteConfigRequest.sink?.name}
            />
          </Form.Group>
          <FormGroup className='col-3 '>
            <Button variant='primary' type='submit'>
              Submit
            </Button>
          </FormGroup>
        </Row>
      </Form>
      <Row className={'gx-1 gy-1'}>
        <Button
          variant='export'
          onClick={exportConfigHandler}
          // disabled
        >
          Export Config
        </Button>
        <ShutDownBtn id ='dangerSetup'/>
        {/*</Col>*/}
      </Row>
    </Container>
  );
}
