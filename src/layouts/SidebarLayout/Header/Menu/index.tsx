import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  styled
} from '@mui/material';
import { KiteState } from '@kite/constants';
import { KiteSetup } from '@/common/kite/types';

import { useState, useEffect, useRef } from 'react';
import Link from 'src/components/Link';

const ListWrapper = styled(Box)(
  ({ theme }) => `
        .MuiTouchRipple-root {
            display: none;
        }
        
        .MuiListItem-root {
            transition: ${theme.transitions.create(['color', 'fill'])};
            
            &.MuiListItem-indicators {
                padding: ${theme.spacing(1, 2)};
            
                .MuiListItemText-root {
                    .MuiTypography-root {
                        &:before {
                            height: 4px;
                            width: 22px;
                            opacity: 0;
                            visibility: hidden;
                            display: block;
                            position: absolute;
                            bottom: -10px;
                            transition: all .2s;
                            border-radius: ${theme.general.borderRadiusLg};
                            content: "";
                            background: ${theme.colors.primary.main};
                        }
                    }
                }

                &.active,
                &:active,
                &:hover {
                
                    background: transparent;
                
                    .MuiListItemText-root {
                        .MuiTypography-root {
                            &:before {
                                opacity: 1;
                                visibility: visible;
                                bottom: 0px;
                            }
                        }
                    }
                }
            }
        }
`
);

function HeaderMenu() {
  const FIRST_API_URL = '/api/kite/pause';
  const SECOND_API_URL = '/api/kite/unpause';
  const [kiteState, setKiteState] = useState<KiteState>(KiteState.Unknown);
  const kiteWorkerRef = useRef<Worker>();
  const [loader, setLoader] = useState(0);
  const [buttonText, setButtonText] = useState('Pause docker');
  const [apiURL, setApiURL] = useState(FIRST_API_URL);

  useEffect(() => {
    kiteWorkerRef.current = new Worker(
      new URL('@/workers/configWorker.ts', import.meta.url)
    );
    kiteWorkerRef.current.onmessage = (
      event: MessageEvent<{
        state: KiteState;
        setup: KiteSetup;
        metricsReady: boolean;
      }>
    ) => {
      // console.log(event.data);
      const { state, setup, metricsReady } = event.data;
      console.log(event.data);
      // const { state, setup } = event.data;
      if (state !== undefined) setKiteState(state);
      if (metricsReady) {
        console.log('redirect?');
        console.log(loader);
        if (kiteState === KiteState.Running && loader) {
          console.log('redirect!');
          setTimeout(() => {
            window.location.href = '/metrics';
          }, 20000);
        }
      }
    };
    kiteWorkerRef.current?.postMessage(5000);
    return () => {
      kiteWorkerRef.current?.terminate();
    };
  }, [loader, kiteState]);

  const dockerStatus = async () => {
    if (apiURL === FIRST_API_URL) {
      try {
        const response = await fetch('/api/kite/pause', {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          }
        });
        const data = await response.text();
        setButtonText('Start docker');
        setApiURL(SECOND_API_URL);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const response = await fetch('/api/kite/unpause', {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          }
        });
        const data = await response.text();
        setButtonText('Pause docker');
        setApiURL(FIRST_API_URL);
      } catch (err) {
        console.log(err);
      }

    }
  };

  /*
  async function shutdownServer() {
    try {
      const { server } = store.getState();
      await fetch(`${server}/api/kite/shutdown`, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        }
      });
    } catch (err) {
      console.error(`Could not shutdown docker instances on server:\n${err}`);
    }
  }
*/
  return (
    <>
      <ListWrapper
        sx={{
          display: {
            xs: 'none',
            md: 'block'
          }
        }}
      >
        <List disablePadding component={Box} display="flex">
          <ListItem
            classes={{ root: 'MuiListItem-indicators' }}
            button
            component={Link}
            href="/configuration"
          >
            <ListItemText
              primaryTypographyProps={{ noWrap: true }}
              primary={`xkite Status: ${kiteState}`}
            />
          </ListItem>
          <ListItem
            classes={{ root: 'MuiListItem-indicators' }}
            button
            component={Link}
            href="/configuration"
          >
            <Button variant="contained" color="primary" onClick={dockerStatus}>
              {buttonText}
            </Button>
          </ListItem>
        </List>
      </ListWrapper>
    </>
  );
}

export default HeaderMenu;
