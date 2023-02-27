import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';

import { SyntheticEvent, useState, useEffect } from 'react';
import defaultCfg from '@/common/kite/constants';
import AdvancedBrokerConfig from './_AdvancedBrokerConfig';
import { JsxElement } from 'typescript';

export default function ConfigurationForm() {
  const [kiteConfigRequest, setKiteConfigRequest] = useState(defaultCfg);

  function updateKiteConfigRequest(update: Partial<KiteConfig>): void {
    setKiteConfigRequest((kiteConfigRequest) => {
      return {
        ...kiteConfigRequest,
        ...update,
      };
    });
  }

  async function isPortOpen(port: number): Promise<boolean> {
    const { isOpen } = await fetch('/api/checkPort', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ port }),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error(error.message);
      });

    return isOpen;
  }

  function submitHandler(event: SyntheticEvent) {
    event.preventDefault();

    // TODO: Prevent state for deleted brokers from being submitted

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

  //== Rendering of Advanced Settings ==//
  const advancedBrokerConfigElements: JSX.Element[] = [];
  for (
    let brokerNumber = 0;
    brokerNumber < kiteConfigRequest.kafka.brokers.size;
    brokerNumber++
  ) {
    advancedBrokerConfigElements.push(
      <AdvancedBrokerConfig
        brokerIndex={brokerNumber}
        updateKiteConfigRequest={updateKiteConfigRequest}
        kiteConfigRequest={kiteConfigRequest}
        isPortOpen={isPortOpen}
      />
    );
  }

  return (
    <Container>
      <Form className='mb-3' onSubmit={submitHandler}>
        <Row className='align-items-end'>
          <Form.Group className='col-2' controlId='kafka.broker.size'>
            <Form.Label>Brokers</Form.Label>
            <Form.Control
              type='number'
              // placeholder='How many kafka brokers?'
              onChange={(e) => {
                const size = +e.target.value;
                if (size <= 0) return;

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
              value={kiteConfigRequest.kafka.brokers.size}
            />
          </Form.Group>
          <Form.Group className='col-2' controlId='kafka.broker.size'>
            <Form.Label>Zookeepers</Form.Label>
            <Form.Control
              type='number'
              // placeholder='How many kafka brokers?'
              onChange={(e) => {
                const size = +e.target.value;
                if (size <= 0) return;

                const update = {
                  kafka: {
                    ...kiteConfigRequest.kafka,
                    zookeepers: {
                      ...kiteConfigRequest.kafka.zookeepers,
                      size,
                    },
                  },
                };
                updateKiteConfigRequest(update);
              }}
              value={kiteConfigRequest.kafka.zookeepers.size}
            />
          </Form.Group>
          <Form.Group className='col-3' controlId='dataSource'>
            <Form.Label>Data Source</Form.Label>
            <Form.Select
              aria-label='Data Source'
              onChange={(e) => {
                // Can't find any other way to make TypeScript happy
                if (
                  e.target.value === 'postgresql' ||
                  e.target.value === 'ksql'
                )
                  updateKiteConfigRequest({
                    db: {
                      dataSource: e.target.value,
                    },
                  });
              }}
              value={kiteConfigRequest.db?.dataSource}
            >
              <option value='postgresql'>PostgreSQL</option>
              <option value='ksql'>KSQL</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className='col-3' controlId='sink'>
            <Form.Label>Data Sink</Form.Label>
            <Form.Select
              aria-label='Data Sink'
              onChange={(e) => {
                // Can't find any other way to make TypeScript happy
                if (e.target.value === 'jupyter' || e.target.value === 'spark')
                  updateKiteConfigRequest({
                    sink: {
                      name: e.target.value,
                    },
                  });
              }}
              value={kiteConfigRequest.sink?.name}
            >
              <option value='jupyter'>Jupyter</option>
              <option value='spark'>Spark</option>
            </Form.Select>
          </Form.Group>
          <FormGroup className='col-2 '>
            <Button variant='primary' type='submit'>
              Submit
            </Button>
          </FormGroup>
          <Accordion className='mt-3'>
            <Accordion.Item eventKey='0'>
              <Accordion.Header>Advanced Settings</Accordion.Header>
              <Accordion.Body>
                <Row>{advancedBrokerConfigElements}</Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
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