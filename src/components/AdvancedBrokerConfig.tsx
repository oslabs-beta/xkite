import { FormGroup, Form, Row } from 'react-bootstrap';
import { CheckPortOpen, PortOpen, PortsOpen } from './ConfigurationForm';

interface AdvancedBrokerConfigProps {
  brokerIndex: number;
  kiteConfigRequest: KiteConfig;
  portsOpen: PortOpen;
  checkPortOpen: CheckPortOpen;
  updateKiteConfigRequest: (update: Partial<KiteConfig>) => void;
}

// We should probably define these elsewhere and import them
const DEFAULT_BROKER_ID = 101;
const DEFAULT_JMX_PORT = 9991;
const DEFAULT_BROKER_PORT = 9091;

export default function AdvancedBrokerConfig({
  brokerIndex,
  updateKiteConfigRequest,
  kiteConfigRequest,
  portsOpen,
  checkPortOpen,
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
          value={kiteConfigRequest.kafka.brokers?.id?.[brokerIndex] || ''}
        />
      </FormGroup>
      <FormGroup className='col-3 my-2' controlId='kafka.brokers.ports'>
        <Form.Label>Port</Form.Label>
        <Form.Control
          type='number'
          placeholder={(DEFAULT_BROKER_PORT + brokerIndex).toString()}
          onChange={(e) => {
            if (+e.target.value <= 0) return;
            const brokers: number[] =
              kiteConfigRequest.kafka.brokers.ports?.brokers ?? [];
            brokers[brokerIndex] = +e.target.value;

            const update = {
              kafka: {
                ...kiteConfigRequest.kafka,
                brokers: {
                  ...kiteConfigRequest.kafka.brokers,
                  ports: {
                    ...kiteConfigRequest.kafka.brokers.ports,
                    brokers,
                  },
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
          value={
            kiteConfigRequest.kafka.brokers?.ports?.brokers?.[brokerIndex] || ''
          }
          // if the port has been set, use the value of whether it's open or not. Otherwise, default to !isInvalid
          // kind of ugly...
          isInvalid={
            portsOpen
              ? Object.hasOwn(portsOpen, 'port')
                ? !portsOpen.port
                : false
              : false
          }
          onBlur={(e) =>
            checkPortOpen(
              `broker-${brokerIndex}`,
              'port',
              Number(e.target.value)
            )
          }
        />
        <Form.Control.Feedback type='valid'>Port open</Form.Control.Feedback>
        <Form.Control.Feedback type='invalid'>
          Port in Use!
        </Form.Control.Feedback>
      </FormGroup>
      <FormGroup className='col-3 my-2' controlId='kafka.brokers.jmx_port'>
        <Form.Label>JMX Port</Form.Label>
        <Form.Control
          type='number'
          placeholder={(DEFAULT_JMX_PORT + brokerIndex).toString()}
          onChange={(e) => {
            if (+e.target.value <= 0) return;
            const jmx: number[] =
              kiteConfigRequest.kafka.brokers?.ports?.jmx ?? [];
            jmx[brokerIndex] = +e.target.value;

            const update = {
              kafka: {
                ...kiteConfigRequest.kafka,
                brokers: {
                  ...kiteConfigRequest.kafka.brokers,
                  ports: {
                    ...kiteConfigRequest.kafka.brokers.ports,
                    jmx,
                  },
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
          value={
            kiteConfigRequest.kafka.brokers?.ports?.jmx?.[brokerIndex] || ''
          }
        />
      </FormGroup>
    </Row>
  );
}
