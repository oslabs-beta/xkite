import { FormGroup, Form, Row } from 'react-bootstrap';

interface AdvancedBrokerConfigProps {
  brokerIndex: number;
  updateKiteConfigRequest: (update: Partial<KiteConfig>) => void;
  kiteConfigRequest: KiteConfig;
  isPortOpen: (port: number) => boolean;
}

// We should probably define these elsewhere and import them
const DEFAULT_BROKER_ID = 101;
const DEFAULT_JMX_PORT = 9991;
const DEFAULT_BROKER_PORT = 9091;

export default function AdvancedBrokerConfig({
  brokerIndex,
  updateKiteConfigRequest,
  kiteConfigRequest,
  isPortOpen,
}: AdvancedBrokerConfigProps) {
  return (
    <Row className='mb-3'>
      <h4>Broker {brokerIndex + 1}</h4>
      {/* 
          Updates the Broker
      */}
      <FormGroup className='col-2 my-2' controlId='kafka.brokers.id'>
        <Form.Label>ID</Form.Label>
        <Form.Control
          type='number'
          placeholder={(DEFAULT_BROKER_ID + brokerIndex).toString()}
          onChange={(e) => {
            if (+e.target.value <= 0) return;
            const id: number[] = kiteConfigRequest.kafka.brokers.id ?? [];
            id[brokerIndex] = +e.target.value;

            const update = {
              kafka: {
                ...kiteConfigRequest.kafka,
                brokers: {
                  ...kiteConfigRequest.kafka.brokers,
                  id,
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
          value={
            kiteConfigRequest.kafka.brokers?.id?.[brokerIndex]
              ? kiteConfigRequest.kafka.brokers.id[brokerIndex].toString()
              : ''
          }
        />
      </FormGroup>
      <FormGroup className='col-3 my-2' controlId='kafka.brokers.ports'>
        <Form.Label>Port</Form.Label>
        <Form.Control
          type='number'
          placeholder={(DEFAULT_BROKER_PORT + brokerIndex).toString()}
          onChange={(e) => {
            if (+e.target.value <= 0) return;
            const ports: number[] = kiteConfigRequest.kafka.brokers.ports ?? [];
            ports[brokerIndex] = +e.target.value;

            const update = {
              kafka: {
                ...kiteConfigRequest.kafka,
                brokers: {
                  ...kiteConfigRequest.kafka.brokers,
                  ports: ports,
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
          value={
            kiteConfigRequest.kafka.brokers?.ports?.[brokerIndex]
              ? kiteConfigRequest.kafka.brokers.ports[brokerIndex].toString()
              : ''
          }
        />
      </FormGroup>
      <FormGroup className='col-3 my-2' controlId='kafka.brokers.jmx_port'>
        <Form.Label>JMX Port</Form.Label>
        <Form.Control
          type='number'
          placeholder={(DEFAULT_JMX_PORT + brokerIndex).toString()}
          onChange={(e) => {
            if (+e.target.value <= 0) return;
            const jmx_port: number[] =
              kiteConfigRequest.kafka.brokers.jmx_port ?? [];
            jmx_port[brokerIndex] = +e.target.value;

            const update = {
              kafka: {
                ...kiteConfigRequest.kafka,
                brokers: {
                  ...kiteConfigRequest.kafka.brokers,
                  jmx_port: jmx_port,
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
          value={
            kiteConfigRequest.kafka.brokers?.jmx_port?.[brokerIndex]
              ? kiteConfigRequest.kafka.brokers.jmx_port[brokerIndex].toString()
              : ''
          }
        />
      </FormGroup>
    </Row>
  );
}
