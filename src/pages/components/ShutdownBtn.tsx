import { SyntheticEvent } from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

export default function ShutDownBtn() {
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
      variant='danger'
      onClick={disconnectHandler}
      // disabled
    >
      Disconnect
    </Button>
  );
}
