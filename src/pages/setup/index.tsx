import ConfigurationForm from '@/pages/setup/ConfigurationForm';
import { Container } from 'react-bootstrap';

export default function SetupPage() {
  return (
    <>
      <Container>
        <h1 className={'mb-3'}>Configure Your Kafka Cluster(s)</h1>
        <ConfigurationForm />
      </Container>
    </>
  );
}
