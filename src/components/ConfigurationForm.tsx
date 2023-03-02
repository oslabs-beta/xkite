import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Spinner from 'react-bootstrap/Spinner';

import { SyntheticEvent, useState } from 'react';
import defaultCfg from '@/common/kite/constants';
import AdvancedBrokerConfig from './AdvancedBrokerConfig';
import ShutDownBtn from './ShutdownBtn';
import ExportConfigBtn from './ExportConfigBtn';

export interface PortsOpen {
  [index: string]: PortOpen;
}

export interface PortOpen {
  [type: string]: boolean;
}

export interface CheckPortOpen {
  (index: string, type: string, port: number): Promise<boolean>;
}

// const test: PortsOpen = {
//   'broker-1': {
//     port: true,
//     'jmx-port': false,
//   },
// };

export default function ConfigurationForm() {
  const [kiteConfigRequest, setKiteConfigRequest] = useState(defaultCfg);
  const [portsOpen, setPortsOpen] = useState<PortsOpen>({});
  const [submit, setSubmit] = useState(false);

  function updateKiteConfigRequest(update: Partial<KiteConfig>): void {
    setKiteConfigRequest((kiteConfigRequest) => {
      return {
        ...kiteConfigRequest,
        ...update,
      };
    });
  }

  const checkPortOpen: CheckPortOpen = async (index, type, port) => {
    console.log({ index, type, port });
    const isOpen = await isPortOpen(port);
    setPortsOpen((portsOpen) => ({
      ...portsOpen,
      [index]: {
        ...portsOpen[index],
        [type]: isOpen,
      },
    }));
    console.log(isOpen);

    return isOpen;
  };

  // async function checkPortOpen(
  //   index: string,
  //   type: string,
  //   port: number
  // ): Promise<boolean> {
  //   return isPortOpen(port);
  // }

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
    // console.log(defaultCfg);
    setSubmit(true);
    fetch('/api/kite/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kiteConfigRequest),
    })
      .then((response) => {
        console.dir(response);

        setTimeout(() => {
          setSubmit(false);
          // redirect to display page
          window.location.href = '/display';
        }, 20000);
        // setKiteConfigRequest(defaultConfig);
      })
      .catch((error) => {
        console.error(error.message);
      });
    // setSubmit(false);
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
    let brokerIndex = 0;
    brokerIndex < kiteConfigRequest.kafka.brokers.size;
    brokerIndex++
  ) {
    // portsOpen[`broker-${brokerIndex}`] = {};
    advancedBrokerConfigElements.push(
      <AdvancedBrokerConfig
        brokerIndex={brokerIndex}
        updateKiteConfigRequest={updateKiteConfigRequest}
        kiteConfigRequest={kiteConfigRequest}
        // isPortOpen={isPortOpen}
        portsOpen={portsOpen[`broker-${brokerIndex}`]}
        checkPortOpen={checkPortOpen}
        key={`abc-${brokerIndex}`}
      />
    );
  }

  return (
    <Container>
      <Form className='mb-3' onSubmit={submitHandler}>
        <Row className='align-items-center'>
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
                      name: e.target.value,
                    },
                  });
              }}
              value={kiteConfigRequest.db?.name}
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
          <Accordion className='mt-3'>
            <Accordion.Item eventKey='0'>
              <Accordion.Header>Advanced Settings</Accordion.Header>
              <Accordion.Body>
                <Row>{advancedBrokerConfigElements}</Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <FormGroup className='col-3 '>
            <Button variant='primary' type='submit' disabled={submit}>
              {!submit ? 'Submit' : <Spinner />}
            </Button>
          </FormGroup>
        </Row>
      </Form>
      <Row className={'gx-1 gy-1'}>
        <ExportConfigBtn />
        <ShutDownBtn id='dangerSetup' />
        {/*</Col>*/}
      </Row>
    </Container>
  );
}
