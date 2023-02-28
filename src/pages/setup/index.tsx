import ConfigurationForm from '@/components/ConfigurationForm';
import { Container } from 'react-bootstrap';
import Image from 'next/image';

export default function SetupPage() {
  return (
    <>
      <Container>
        {/* <div id = 'setupHeader'>
            <Image
            id = 'headerKite'
      src='/8064232.png'
      alt=""
      width={120}
      height={120}
    />
            </div> */}
        <h1 className={'my-4'}>Configure Your Kafka Cluster(s)</h1>

        <ConfigurationForm />
      </Container>
    </>
  );
}
