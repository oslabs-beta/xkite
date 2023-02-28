import { SyntheticEvent } from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

interface ShutDownBtnProps {
  id: string;
}

export default function ShutDownBtn({ id }: ShutDownBtnProps) {
  async function disconnectHandler(event: SyntheticEvent): Promise<void> {
    console.log('Disconnecting…');
    try {
      const response = await axios.delete('/api/kite/shutdown');
      console.log(response);
    } catch (error) {
      console.error('Error occurred during shutdown:', error);
    }
  }

  return (
    <Button
      id={id}
      variant='danger'
      onClick={disconnectHandler}
      // disabled
    >
      Disconnect
    </Button>
  );
}
