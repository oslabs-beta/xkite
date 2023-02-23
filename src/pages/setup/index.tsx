import ConfigurationForm from '@/pages/setup/ConfigurationForm';
import { Container } from 'react-bootstrap';

export default function SetupPage() {
  return (
    <>
      <Container>
        <h1 className={'my-4'}>Configure Your Kafka Cluster(s)</h1>
        <ConfigurationForm />
      </Container>
    </>
  );
}
