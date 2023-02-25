import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

import { SyntheticEvent, useState } from 'react';
import defaultCfg from '@/common/kite/constants';

export default function ConfigurationForm() {
  const [kiteConfigRequest, setKiteConfigRequest] = useState(defaultCfg);

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
    console.log(defaultCfg);

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

  function disconnectHandler(event: SyntheticEvent) {
    console.log('Disconnection…');
    fetch('/api/kite/shutdown', {
      method: 'DELETE',
    })
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
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
              onChange={(e) =>
                updateKiteConfigRequest({ dataSource: e.target.value })
              }
              value={kiteConfigRequest.dataSource}
            />
          </Form.Group>
          <Form.Group className='col-4' controlId='sink'>
            <Form.Label>Data Sink</Form.Label>
            <Form.Control
              type='text'
              placeholder='Data Sink'
              onChange={(e) =>
                updateKiteConfigRequest({ sink: e.target.value })
              }
              value={kiteConfigRequest.sink}
            />
          </Form.Group>
          <FormGroup className='col-2 '>
            <Button variant='primary' type='submit'>
              Submit
            </Button>
          </FormGroup>
        </Row>
      </Form>
      <Row className={'gx-1 gy-1'}>
        <Button
          variant='secondary'
          onClick={exportConfigHandler}
          // disabled
        >
          Export Config
        </Button>
        <Button
          variant='danger'
          onClick={disconnectHandler}
          // disabled
        >
          Disconnect
        </Button>
        {/*</Col>*/}
      </Row>
    </Container>
  );
}
