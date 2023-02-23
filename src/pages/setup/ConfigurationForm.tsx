import { Form, Button } from 'react-bootstrap';
import { useState } from 'react';

interface KiteConfigurationRequest {
  numberOfClusters: number;
  numberOfBrokers: number;
  dataSource: string;
  dataSink: string;
}

const defaultKiteConfigurationRequest: KiteConfigurationRequest = {
  numberOfClusters: 1,
  numberOfBrokers: 3,
  dataSource: 'postgresql',
  dataSink: 'jupyter',
};

export default function ConfigurationForm() {
  const [kiteConfigurationRequest, setKiteConfigurationRequest] = useState(
    defaultKiteConfigurationRequest
  );

  function updateKiteConfigurationRequest(
    // Prevent numeric values from going below 1
    update: Partial<KiteConfigurationRequest>
  ) {
    const value = Object.values(update)[0];
    if (typeof value === 'number' && value <= 0) return;

    setKiteConfigurationRequest((currentKiteConfigurationRequest) => {
      return {
        ...currentKiteConfigurationRequest,
        ...update,
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: Send the request to the backend
    console.log(kiteConfigurationRequest);
    setKiteConfigurationRequest(defaultKiteConfigurationRequest);
  }

  return (
    <Form onSubmit={handleSubmit} className='my-4'>
      <Form.Group className='mb-3' controlId='numberOfClusters'>
        <Form.Label>Number of Clusters</Form.Label>
        <Form.Control
          type='number'
          // placeholder='How many clusters?'
          onChange={(e) => {
            const numberOfClusters = +e.target.value;
            updateKiteConfigurationRequest({ numberOfClusters });
          }}
          value={kiteConfigurationRequest.numberOfClusters.toString()}
        />
      </Form.Group>
      <Form.Group className='mb-3' controlId='numberOfBrokers'>
        <Form.Label>Number of Brokers</Form.Label>
        <Form.Control
          type='number'
          placeholder='Password'
          onChange={(e) => {
            const numberOfBrokers = +e.target.value;
            updateKiteConfigurationRequest({ numberOfBrokers });
          }}
          value={kiteConfigurationRequest.numberOfBrokers}
        />
      </Form.Group>
      <Form.Group className='mb-3' controlId='formBasicPassword'>
        <Form.Label>Data Source</Form.Label>
        <Form.Control
          type='text'
          placeholder='Data Source'
          onChange={(e) =>
            updateKiteConfigurationRequest({ dataSource: e.target.value })
          }
          value={kiteConfigurationRequest.dataSource}
        />
      </Form.Group>
      <Form.Group className='mb-3' controlId='dataSink'>
        <Form.Label>Data Sink</Form.Label>
        <Form.Control
          type='text'
          placeholder='Data Sink'
          onChange={(e) =>
            updateKiteConfigurationRequest({ dataSink: e.target.value })
          }
          value={kiteConfigurationRequest.dataSink}
        />
      </Form.Group>

      <Button variant='primary' type='submit'>
        Submit
      </Button>
    </Form>
  );
}
