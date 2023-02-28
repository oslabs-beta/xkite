// import { FormGroup, Form, Row } from 'react-bootstrap';
// import { CheckPortOpen, PortOpen, PortsOpen } from './_ConfigurationForm';

// interface AdvancedPortConfigProps {
//   brokerIndex: number;
//   updateKiteConfigRequest: (update: Partial<KiteConfig>) => void;
//   kiteConfigRequest: KiteConfig;
//   // isPortOpen: (port: number) => boolean;
//   portsOpen: PortOpen;
//   checkPortOpen: CheckPortOpen;
// }

// // We should probably define these elsewhere and import them
// const DEFAULT_BROKER_ID = 101;
// const DEFAULT_JMX_PORT = 9991;
// const DEFAULT_BROKER_PORT = 9091;

// export default function AdvancedPortConfig({
//   brokerIndex,
//   updateKiteConfigRequest,
//   kiteConfigRequest,
//   portsOpen,
//   checkPortOpen,
// }: AdvancedPortConfigProps) {
//   return (
//     <FormGroup className='col-2 my-2' controlId='kafka.brokers.id'>
//       <Form.Label>ID</Form.Label>
//       <Form.Control
//         type='number'
//         placeholder={(DEFAULT_BROKER_ID + brokerIndex).toString()}
//         onChange={(e) => {
//           if (+e.target.value <= 0) return;
//           const id: number[] = kiteConfigRequest.kafka.brokers.id ?? [];
//           id[brokerIndex] = +e.target.value;

//           const update = {
//             kafka: {
//               ...kiteConfigRequest.kafka,
//               brokers: {
//                 ...kiteConfigRequest.kafka.brokers,
//                 id,
//               },
//             },
//           };
//           updateKiteConfigRequest(update);
//         }}
//         value={
//           kiteConfigRequest.kafka.brokers?.id?.[brokerIndex]
//             ? kiteConfigRequest.kafka.brokers.id[brokerIndex].toString()
//             : ''
//         }
//       />
//     </FormGroup>
//   );
// }
