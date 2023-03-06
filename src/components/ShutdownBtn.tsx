import { SyntheticEvent, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';

interface ShutDownBtnProps {
  id: string;
}

export default function ShutDownBtn({ id }: ShutDownBtnProps) {
  const [shuttingDown, setShuttingDown] = useState(false);

  async function disconnectHandler(event: SyntheticEvent): Promise<void> {
    setShuttingDown(true);
    console.log('Disconnecting…');
    try {
      const response = await axios.delete('/api/kite/shutdown');
      console.log(response);
    } catch (error) {
      console.error('Error occurred during shutdown:', error);
    }
    setShuttingDown(false);
  }

  return (
    <Button
      id={id}
      variant='danger'
      onClick={disconnectHandler}
      disabled={shuttingDown}
    >
      {!shuttingDown ? 'Disconnect' : <Spinner />}
    </Button>
  );
}
