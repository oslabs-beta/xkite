import React, {
  useState,
  SyntheticEvent,
  useRef,
  useEffect,
  useCallback
} from 'react';
import {
  FormControl,
  FormGroup,
  Grid,
  InputLabel,
  Input,
  Button,
  useTheme,
  Container,
  Tab,
  Tabs,
  styled,
  Box,
  Card
} from '@mui/material';
import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageTitle from '@/components/PageTitle';
import { KiteState } from '@../../src/common/kite/constants';
import Footer from '@/components/Footer';

const TabsContainerWrapper = styled(Box)(
  ({ theme }) => `
      padding: 0 ${theme.spacing(2)};
      position: relative;
      bottom: -1px;

      .MuiTabs-root {
        height: 44px;
        min-height: 44px;
      }

      .MuiTabs-scrollableX {
        overflow-x: auto !important;
      }

      .MuiTabs-indicator {
          min-height: 4px;
          height: 4px;
          box-shadow: none;
          bottom: -4px;
          background: none;
          border: 0;

          &:after {
            position: absolute;
            left: 50%;
            width: 28px;
            content: ' ';
            margin-left: -14px;
            background: ${theme.colors.primary.main};
            border-radius: inherit;
            height: 100%;
          }
      }

      .MuiTab-root {
          &.MuiButtonBase-root {
              height: 44px;
              min-height: 44px;
              background: ${theme.colors.alpha.white[50]};
              border: 1px solid ${theme.colors.alpha.black[10]};
              border-bottom: 0;
              position: relative;
              margin-right: ${theme.spacing(1)};
              font-size: ${theme.typography.pxToRem(14)};
              color: ${theme.colors.alpha.black[80]};
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;

              .MuiTouchRipple-root {
                opacity: .1;
              }

              &:after {
                position: absolute;
                left: 0;
                right: 0;
                width: 100%;
                bottom: 0;
                height: 1px;
                content: '';
                background: ${theme.colors.alpha.black[10]};
              }

              &:hover {
                color: ${theme.colors.alpha.black[100]};
              }
          }

          &.Mui-selected {
              color: ${theme.colors.alpha.black[100]};
              background: ${theme.colors.alpha.white[100]};
              border-bottom-color: ${theme.colors.alpha.white[100]};

              &:after {
                height: 0;
              }
          }
      }
  `
);

function Tests() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('ksql-streams');
  const workerRef = useRef<Worker>();
  const [query, setQuery] = useState('');
  const [qResults, setQResults] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkActive();
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<string>) => {
      console.log(event.data);
      setQResults((prev) =>
        prev.length > 0 ? [...prev, event.data] : [event.data]
      );
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const checkActive = async () => {
    try {
      const response = await fetch('/api/kite/getKiteState');
      const data = await response.text();
      if (data === KiteState.Running) {
        setConnected(true);
      } else {
        setConnected(false);
      }
    } catch (err) {
      setConnected(false);
      console.log(err);
    }
  };

  const pageMessage = () => {
    return (
      <PageTitle
        heading="You Do Not Have an Active Deployment"
        subHeading="Navigate to 'Create Data Pipeline' to configure and deploy a Kafka instance, or 'connect existing' to connect an existing deployment in order to view tests."
      />
    );
  };

  const tabs = [{ value: 'ksql-streams', label: 'KSQL Streams' }];

  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  const handleWork = useCallback(
    async (e: SyntheticEvent) => {
      // console.log('handling?');
      // e.preventDefault();
      setQResults(['']);
      let type = 'query';
      if (query.startsWith('CREATE')) type = 'create';
      workerRef.current?.postMessage({ type, sql: query });
      // setQuery('');
    },
    [query]
  );

  return (
    <>
      <Head>
        <title>Create/View Streams</title>
      </Head>
      <PageTitleWrapper>{!connected && pageMessage()}</PageTitleWrapper>
      <Container maxWidth="xl">
        <TabsContainerWrapper>
          <Tabs
            onChange={handleTabsChange}
            value={currentTab}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </TabsContainerWrapper>
        <h1 id="generalHeader">Create/View Streams</h1>
        <Card variant="outlined">
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="stretch"
            padding="1rem"
            spacing={0}
          >
            {currentTab === 'ksql-streams' && (
              <>
                <FormControl id="sendingMessage">
                  <FormGroup>
                    <InputLabel>SQL Query</InputLabel>
                    <Input
                      id="textarea-query"
                      aria-label="With textarea"
                      placeholder="Enter a query"
                      onChange={(e) => setQuery(e.target.value)}
                      value={query}
                    />
                  </FormGroup>
                  <Button onClick={handleWork}>send</Button>
                </FormControl>
                <FormGroup>
                  <InputLabel>Results:</InputLabel>
                  <Input
                    id="textarea-results"
                    aria-label="With textarea"
                    value={qResults.slice(1)}
                    readOnly
                  />
                </FormGroup>
              </>
            )}
          </Grid>
        </Card>
      </Container>
      <Footer />
    </>
  );
}

Tests.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default Tests;
