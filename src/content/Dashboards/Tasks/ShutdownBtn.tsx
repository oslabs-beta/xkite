import { SyntheticEvent, useState } from 'react';
import axios from 'axios';
import {Button} from '@mui/material';

interface ShutDownBtnProps {
  id?: string;
  onClick: () => void;
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
    
      <Button size="large"  variant="outlined" sx={{ margin: 1 }} color="secondary" onClick={disconnectHandler} disabled={shuttingDown}>
      Disconnect
      </Button>
  );
}
