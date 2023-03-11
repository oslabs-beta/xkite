import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitle from '@/components/PageTitle';
import type { KiteState, KiteConfig, KiteSetup } from 'xkite-core';
import { defaultCfg } from '@/common/constants';
import {
  useState,
  SyntheticEvent,
  CSSProperties,
  useEffect,
  useRef,
  ChangeEvent
} from 'react';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HashLoader from 'react-spinners/HashLoader';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Button,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Typography
} from '@mui/material';
import Footer from '@/components/Footer';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ExportConfigBtn from '@/content/Dashboards/Tasks/ExportConfigBtn';
import React from 'react';

export interface PortsOpen {
  [index: string]: PortOpen;
}

export interface PortOpen {
  [type: string]: boolean;
}

export interface CheckPortOpen {
  (index: string, type: string, port: number): Promise<boolean>;
}

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red'
};

const dataSources = [
  {
    value: 'ksql',
    label: 'KSQL'
  },
  {
    value: 'postgresql',
    label: 'PostgreSQL'
  }
];

const dataSinks = [
  {
    value: 'jupyter',
    label: 'Jupyter'
  },
  {
    value: 'spark',
    label: 'Spark'
  }
];

const DEFAULT_BROKER_ID = 101;
const DEFAULT_JMX_PORT = 9991;
const DEFAULT_BROKER_PORT = 9091;

function Forms() {
  const [portsOpen, setPortsOpen] = useState<PortsOpen>({});
  const [kiteConfigRequest, setKiteConfigRequest] =
    useState<KiteConfig>(defaultCfg);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [loader, setLoader] = useState(0);
  const [kiteState, setKiteState] = useState<string>('Unknown');
  const [shuttingDown, setShuttingDown] = useState(false);
  const kiteWorkerRef = useRef<Worker>();

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
        if (kiteState === 'Running' && loader) {
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

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  function updateKiteConfigRequest(update: Partial<KiteConfig>): void {
    setKiteConfigRequest((kiteConfigRequest) => {
      return {
        ...kiteConfigRequest,
        ...update
      };
    });
  }

  const isActive = () => {
    return (
      <div className="sweet-loading">
        <p>
          You have an active Kite deployment. To start over, select "Disconnect"
          below.
        </p>
      </div>
    );
  };

  const isLoading = () => {
    return (
      <div className="sweet-loading">
        <HashLoader
          color={'#CBB6E6'}
          cssOverride={override}
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        {shuttingDown ? (
          <p>Please stand by while containers are being removed</p>
        ) : (
          <p>Please stand by while containers are deployed</p>
        )}
      </div>
    );
  };

  // const queryMetrics = (active: boolean) => {
  //   const interval = setInterval(
  //     () => {
  //       console.log(active, '158');
  //       try {
  //         kiteWorkerRef.current?.postMessage(true);

  //       } catch (err) {
  //         console.log(err);
  //       }
  //     },
  //     1000,
  //     active
  //   );
  // };

  function ShutDownBtn() {
    async function disconnectHandler(event: SyntheticEvent): Promise<void> {
      console.log(event);
      setShuttingDown(true);
      console.log('Disconnecting…');
      try {
        const response = await fetch('/api/kite/shutdown', {
          method: 'DELETE'
        });
        console.log(response);
      } catch (error) {
        console.error('Error occurred during shutdown:', error);
      }
      kiteWorkerRef.current?.postMessage(1000);
      setShuttingDown(false);
    }

    return (
      <Button
        size="large"
        variant="outlined"
        sx={{ margin: 1 }}
        color="secondary"
        onClick={disconnectHandler}
        disabled={shuttingDown}
      >
        Disconnect
      </Button>
    );
  }

  const checkPortOpen: CheckPortOpen = async (index, type, port) => {
    const isOpen = await isPortOpen(port);
    console.log(portsOpen[`broker-0`], '187');
    setPortsOpen((portsOpen) => ({
      ...portsOpen,
      [index]: {
        ...portsOpen[index],
        [type]: isOpen
      }
    }));
    return isOpen;
  };

  async function isPortOpen(port: number): Promise<boolean> {
    const { isOpen } = await fetch('/api/checkPort', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ port })
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error(error.message);
      });

    return isOpen;
  }

  async function submitHandler(event: SyntheticEvent) {
    try {
      event.preventDefault();
      setLoader(1);
      // TODO: Prevent state for deleted brokers from being submitted
      //console.log(kiteConfigRequest)
      console.log('sending configuration…');
      //console.log(defaultCfg);
      const response = await fetch('/api/kite/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(kiteConfigRequest)
      });
      // queryMetrics(active);
      kiteWorkerRef.current?.postMessage(5000);

      console.dir(response);
    } catch (error) {
      console.error(error);
    }
  }

  const handleData = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateKiteConfigRequest({
      db: {
        name: event.target.value === 'ksql' ? 'ksql' : 'postgresql'
      }
    });
  };

  const handleBrokers = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const size = Number(event.target.value);
    if (size <= 0) return;
    const update = {
      kafka: {
        ...kiteConfigRequest.kafka,
        brokers: {
          ...kiteConfigRequest.kafka.brokers,
          size
        }
      }
    };
    updateKiteConfigRequest(update);
  };

  const handleZoo = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const size = Number(event.target.value);
    if (size <= 0) return;
    const update = {
      kafka: {
        ...kiteConfigRequest.kafka,
        zookeepers: {
          ...kiteConfigRequest.kafka.zookeepers,
          size
        }
      }
    };
    updateKiteConfigRequest(update);
  };

  const handleSink = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateKiteConfigRequest({
      sink: {
        name: event.target.value === 'jupyter' ? 'jupyter' : 'spark'
      }
    });
  };

  const renderAdvanced = () => {
    const res: JSX.Element[] = [];
    for (let i = 0; i < kiteConfigRequest.kafka.brokers.size; i++) {
      res.push(
        <div key={i}>
          <p>Broker {i + 1}</p>
          <TextField
            id="filled-number"
            label="ID"
            type="number"
            placeholder={(DEFAULT_BROKER_ID + i).toString()}
            value={kiteConfigRequest.kafka.brokers?.id?.[i] || ''}
            InputLabelProps={{
              shrink: true
            }}
            variant="filled"
            onChange={(e) => {
              if (+e.target.value <= 0) return;
              const id: number[] = kiteConfigRequest.kafka.brokers.id ?? [];
              id[i] = +e.target.value;

              const update = {
                kafka: {
                  ...kiteConfigRequest.kafka,
                  brokers: {
                    ...kiteConfigRequest.kafka.brokers,
                    id
                  }
                }
              };
              updateKiteConfigRequest(update);
            }}
          />
          <TextField
            id="filled-number"
            placeholder={(DEFAULT_BROKER_PORT + i).toString()}
            onChange={(e) => {
              if (+e.target.value <= 0) return;

              const brokers: number[] =
                kiteConfigRequest.kafka.brokers.ports?.brokers ?? [];
              brokers[i] = +e.target.value;

              const update = {
                kafka: {
                  ...kiteConfigRequest.kafka,
                  brokers: {
                    ...kiteConfigRequest.kafka.brokers,
                    ports: {
                      ...kiteConfigRequest.kafka.brokers.ports,
                      brokers
                    }
                  }
                }
              };
              updateKiteConfigRequest(update);
            }}
            value={kiteConfigRequest.kafka.brokers?.ports?.brokers?.[i] || ''}
            label="Port"
            type="number"
            InputLabelProps={{
              shrink: true
            }}
            error={
              portsOpen
                ? portsOpen[`broker-${i}`]
                  ? !portsOpen[`broker-${i}`].port
                  : false
                : false
            }
            onBlur={(e) =>
              checkPortOpen(`broker-${i}`, 'port', Number(e.target.value))
            }
            variant="filled"
          />
          <TextField
            id="filled-number"
            placeholder={(DEFAULT_JMX_PORT + i).toString()}
            onChange={(e) => {
              if (+e.target.value <= 0) return;
              const jmx: number[] =
                kiteConfigRequest.kafka.brokers?.ports?.jmx ?? [];
              jmx[i] = +e.target.value;

              const update = {
                kafka: {
                  ...kiteConfigRequest.kafka,
                  brokers: {
                    ...kiteConfigRequest.kafka.brokers,
                    ports: {
                      ...kiteConfigRequest.kafka.brokers.ports,
                      jmx
                    }
                  }
                }
              };
              updateKiteConfigRequest(update);
            }}
            value={kiteConfigRequest.kafka.brokers?.ports?.jmx?.[i] || ''}
            label="JMX Port"
            type="number"
            InputLabelProps={{
              shrink: true
            }}
            variant="filled"
          />
        </div>
      );
    }
    return res;
  };

  return (
    <>
      <Head>
        <title>Configure Your Kafka Cluster</title>
      </Head>
      <PageTitleWrapper>
        <PageTitle
          heading="Configure Your Kafka Cluster"
          subHeading="Select your preferred number of brokers, zookeepers, data source, data sink, or configure advanced settings."
          docs="https://kafka.apache.org/"
        />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Required Settings" />
              <Divider />
              <CardContent>
                <Box
                  component="form"
                  sx={{
                    '& .MuiTextField-root': { m: 2, width: '30ch' }
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <div>
                    <TextField
                      id="outlined-number"
                      label="Brokers"
                      type="number"
                      // defaultValue="2"
                      onChange={handleBrokers}
                      value={kiteConfigRequest.kafka.brokers.size}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                    <TextField
                      id="outlined-number"
                      // defaultValue="2"
                      label="Zookeepers"
                      type="number"
                      onChange={handleZoo}
                      value={kiteConfigRequest.kafka.zookeepers.size}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                    <TextField
                      id="outlined-select-source-native"
                      select
                      // defaultValue={kiteConfigRequest.db?.name}
                      label="Data Source"
                      value={kiteConfigRequest.db?.name}
                      onChange={handleData}
                      helperText="Please select your data source"
                    >
                      {dataSources.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      id="outlined-select-sink-native"
                      select
                      label="Data Sink"
                      // defaultValue={kiteConfigRequest.sink?.name}
                      value={kiteConfigRequest.sink?.name}
                      onChange={handleSink}
                      helperText="Please select your data sink"
                    >
                      {dataSinks.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Accordion
              expanded={expanded === 'panel4'}
              onChange={handleChange('panel4')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel4bh-content"
                id="panel4bh-header"
              >
                <Typography sx={{ width: '33%', flexShrink: 0 }}>
                  Advanced Settings
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Card>
                  <Divider />
                  <CardContent>
                    <Box
                      component="form"
                      sx={{
                        '& .MuiTextField-root': { m: 1, width: '42ch' }
                      }}
                      noValidate
                      autoComplete="off"
                    >
                      {renderAdvanced()}
                    </Box>
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid textAlign="center" item xs={12}>
            {kiteState === 'Running' && shuttingDown && isLoading()}
            {!shuttingDown &&
              kiteState === 'Running' &&
              loader === 0 &&
              isActive()}
            {/* {!shuttingDown && (kiteState === "Paused") && isPaused()} */}
            {kiteState !== 'Unknown' &&
              kiteState !== 'Running' &&
              kiteState !== 'Paused' &&
              loader === 0 && (
                <Button
                  sx={{ margin: 2 }}
                  variant="contained"
                  onClick={submitHandler}
                >
                  Submit
                </Button>
              )}
            {loader === 1 && isLoading()}
            <Card>
              <Box textAlign="center">
                <ExportConfigBtn />
                {ShutDownBtn()}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

Forms.getLayout = (page: any) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;
