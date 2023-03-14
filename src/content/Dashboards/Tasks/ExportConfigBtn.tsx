import { SyntheticEvent, useState } from 'react';
import {Button} from '@mui/material';


export default function ExportConfigBtn() {
  const [exporting, setExport] = useState(false);

  async function exportConfigHandler(event: SyntheticEvent) {
    event.preventDefault();
    setExport(true);

    console.log('Getting Config Zip…');
    // const openWindow = window.open('/api/kite/getPackageBuild', '_blank');
    fetch('/api/kite/getPackageBuild', {
      method: 'GET',
      headers: { Accept: 'application/zip' },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'package.zip');
        document.body.appendChild(link);
        link.click();
        link.remove();
        setExport(false);
      })
      .catch((error) => console.error(error));
  }

  return (
    <Button size="large" variant='outlined' onClick={exportConfigHandler} sx={{ margin: 1 }} >
    Export Config
    </Button>
  );
}
