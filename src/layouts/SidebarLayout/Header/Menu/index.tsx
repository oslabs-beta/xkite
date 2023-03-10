import {
  Box,
  List,
  ListItem,
  ListItemText,
  styled
} from '@mui/material';
import { KiteState } from '@kite/constants';
import { KiteConfig, KiteSetup } from '@/common/kite/types';

import {
  useState,
  SyntheticEvent,
  CSSProperties,
  useEffect,
  useRef,
  ChangeEvent
} from 'react';
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
  const [kiteState, setKiteState] = useState<KiteState>(KiteState.Unknown);
  const kiteWorkerRef = useRef<Worker>();
  const [loader, setLoader] = useState(0);

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
              primary= {`xkite Status: ${kiteState}`}
            />
          </ListItem>
        </List>
      </ListWrapper>
    </>
  );
}

export default HeaderMenu;
