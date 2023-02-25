import ConfigurationForm from '@/pages/setup/_ConfigurationForm';
import { Container } from 'react-bootstrap';

export default function SetupPage() {
  return (
    <>
      <Container>
        <h1 className='my-4'>Configure Your Kafka Cluster</h1>
        <ConfigurationForm />
      </Container>
    </>
  );
}
