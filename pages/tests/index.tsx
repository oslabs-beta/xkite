import React, {
  useState,
  SyntheticEvent,
  useRef,
  useEffect,
  useCallback,
  ChangeEvent
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
  MenuItem,
  styled,
  Box,
  CardContent,
  Card,
  TextField
} from '@mui/material';
import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageTitle from '@/components/PageTitle';
import type { KiteState, KiteSetup } from 'xkite-core';
import Footer from '@/components/Footer';
//import SocketIOClient from "socket.io-client"; TBD: remove if final version does not use sockets

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
            background: ${theme.palette.primary.main};
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
  //const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('ksql-streams');
  const ksqlWorkerRef = useRef<Worker>();
  const testWorkerRef = useRef<Worker>();
  const [query, setQuery] = useState('');
  const [qResults, setQResults] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [topic, setTopic] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [grafanaPort, setGrafanaPort] = useState<string>('');
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    testWorkerRef.current = new Worker(
      new URL('@/workers/testWorker.ts', import.meta.url)
    );
    testWorkerRef.current.onmessage = (
      event: MessageEvent<{
        state: KiteState;
        setup: KiteSetup;
        topics: string[];
      }>
    ) => {
      // console.log(event.data);
      const { state, setup, topics } = event.data;
      setConnected(state === 'Running');
      setTopics(topics);
      if (setup.grafana) {
        setGrafanaPort(setup.grafana.port.toString());
      }
    };
    ksqlWorkerRef.current = new Worker(
      new URL('@/workers/ksqlWorker.ts', import.meta.url)
    );
    ksqlWorkerRef.current.onmessage = (event: MessageEvent<string>) => {
      // console.log(event.data);
      setQResults((prev) =>
        prev.length > 0 ? [...prev, event.data] : [event.data]
      );
    };
    testWorkerRef.current?.postMessage(true);
    return () => {
      ksqlWorkerRef.current?.terminate();
      testWorkerRef.current?.terminate();
    };
  }, []);

  const pageMessage = () => {
    return (
      <PageTitle
        heading="Test Your Kafka Instance"
        subHeading="Add or remove topics, send messages, configure your load balancing strategy, and more."
      />
    );
  };

  const tabs = [
    { value: 'ksql-streams', label: 'KSQL Streams' },
    { value: 'topics', label: 'Topics' },
    { value: 'messages', label: 'Messages' }
  ];

  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  const submitTopic = async (e: SyntheticEvent): Promise<void> => {
    e.preventDefault();
    if (connected) {
      if (topic.length) {
        //use testWorker to create topic --> conditional will know if the intent is to create a new topic based on key
        testWorkerRef.current?.postMessage({ newTopic: topic });
        setTopic('');
      }
    }
  };

  const sendMessage = async (e: SyntheticEvent): Promise<void> => {
    e.preventDefault();
    if (connected) {
      if (message.length) {
        //use testWorker to send message --> conditional will know if the intent is to send a message
        testWorkerRef.current?.postMessage({
          newMessage: message,
          topic: topic
        });
        setTopic('');
        setMessage('');
      }
    }
  };

  const handleWork = useCallback(
    async (e: SyntheticEvent) => {
      setQResults(['']);
      let type = 'ksql';
      if (query.toUpperCase().startsWith('SELECT')) type = 'query';
      ksqlWorkerRef.current?.postMessage({ type, ksql: query });
      setQuery('');
    },
    [query]
  );

  return (
    <>
      <Head>
        <title>Test Your Kafka Configuration</title>
      </Head>
      <PageTitleWrapper>{pageMessage()}</PageTitleWrapper>
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
        <h2 id="generalHeader">{currentTab}</h2>
        <Card variant="outlined">
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="stretch"
            padding="1rem"
            spacing={0}
          >
            {currentTab === 'ksql-streams' ? (
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
                <FormGroup sx={{ width: '100%', height: '50%' }}>
                  <InputLabel>Results:</InputLabel>
                  <Input
                    id="textarea-results"
                    aria-label="With textarea"
                    value={qResults.slice(1)}
                    multiline
                    maxRows={25}
                    readOnly
                  />
                </FormGroup>
              </>
            ) : (
              <></>
            )}
            {currentTab === 'topics' ? (
              <>
                <Box p={4} height={'70vh'}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 className="metric-header">Total Topics</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=625&kiosk`}
                    ></iframe>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      margin: 10
                    }}
                  >
                    {topics.length > 0 && (
                      <h3 className="metric-header">Current Topics:</h3>
                    )}

                    {topics.length > 0 &&
                      topics.map((topic) => {
                        return <div key={topics.indexOf(topic)}>{topic}</div>;
                      })}
                  </div>

                  <Card>
                    <CardContent>
                      <Box
                        component="form"
                        sx={{
                          '& .MuiTextField-root': { m: 2, width: '100%' }
                        }}
                        noValidate
                        autoComplete="off"
                      >
                        <div>
                          <TextField
                            id="outlined-number"
                            label="New Topic"
                            onChange={(e) => {
                              setTopic(e.target.value);
                              // console.log(topic);
                            }}
                            value={topic}
                            InputLabelProps={{
                              shrink: true
                            }}
                          />
                          <Button
                            size="large"
                            variant="outlined"
                            sx={{ margin: 1 }}
                            color="secondary"
                            onClick={submitTopic}
                          >
                            Submit New Topic
                          </Button>
                        </div>
                      </Box>
                    </CardContent>
                  </Card>

                  <Grid item xs={12}></Grid>
                </Box>
              </>
            ) : (
              <></>
            )}
            {currentTab === 'messages' ? (
              <>
                <Box p={4} height={'70vh'}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 className="metric-header">Test Sending Messages</h3>
                    <iframe
                      style={{ height: '20vh', flexDirection: 'column' }}
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=152&kiosk`}
                    ></iframe>
                  </div>
                  <Card>
                    <CardContent>
                      <Box
                        component="form"
                        sx={{
                          '& .MuiTextField-root': { m: 2, width: '100%' }
                        }}
                        noValidate
                        autoComplete="off"
                      >
                        <div>
                          <TextField
                            id="outlined-select-source-native"
                            select
                            label="Topic to send the message to"
                            value={topic}
                            onChange={(e) => {
                              setTopic(e.target.value);
                            }}
                            helperText="Please select your topic"
                          >
                            {topics.length > 0 &&
                              topics.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                          </TextField>
                          <TextField
                            id="outlined-number"
                            label={`Message`}
                            onChange={(e) => {
                              setMessage(e.target.value);
                            }}
                            value={message}
                            InputLabelProps={{
                              shrink: true
                            }}
                          />
                          <Button
                            size="large"
                            variant="outlined"
                            sx={{ margin: 1 }}
                            color="secondary"
                            onClick={sendMessage}
                          >
                            Submit Message
                          </Button>
                        </div>
                      </Box>
                    </CardContent>
                  </Card>

                  <Grid item xs={12}></Grid>
                </Box>
              </>
            ) : (
              <></>
            )}
          </Grid>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
Tests.getLayout = (page: any) => <SidebarLayout>{page}</SidebarLayout>;

export default Tests;
