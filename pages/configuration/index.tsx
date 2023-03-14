import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitle from '@/components/PageTitle';
import type { KiteState, KiteConfig } from 'xkite-core';
import { defaultCfg } from '@/common/constants';
import {
  useState,
  SyntheticEvent,
  CSSProperties,
  useEffect,
  useRef,
  ChangeEvent,
  FocusEventHandler
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
import { _ports_ } from '@/common/constants';

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
  const [replicas, setReplicas] = useState(
    String(defaultCfg.kafka.brokers.replicas)
  ); // for display only
  const [brokers, setBrokers] = useState(String(defaultCfg.kafka.brokers.size)); // for display only
  const [zookeepers, setZookeepers] = useState(
    String(defaultCfg.kafka.zookeepers.size)
  ); // for display only

  // Initialize config to default or last-used, if present
  useEffect(() => {
    fetch('/api/kite/getConfig')
      .then((data) => data.json())
      .then((config: KiteConfig) => {
        setKiteConfigRequest(config);
        setReplicas(String(config.kafka.brokers.replicas));
        setBrokers(String(config.kafka.brokers.size));
        setZookeepers(String(config.kafka.zookeepers.size));
      });
  }, []);

  useEffect(() => {
    kiteWorkerRef.current = new Worker(
      new URL('@/workers/configWorker.ts', import.meta.url)
    );
    kiteWorkerRef.current.onmessage = (
      event: MessageEvent<{
        state: KiteState;
        metricsReady: boolean;
      }>
    ) => {
      const { state, metricsReady } = event.data;
      // console.log(event.data);
      // const { state, setup } = event.data;
      if (state !== undefined) setKiteState(state);
      // if (config !== undefined) setKiteConfigRequest(config); // FIX THIS
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
          <>
            <p>Please stand by while containers are deployed</p>
            <p>This may take several minutes to download the images.</p>
          </>
        )}
        {/* <p>Check terminal for progress updates</p> */}
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

  const handleOnBlurBrokers: FocusEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    const size = Number(event.target.value);
    if (size <= 0 || size > 500) {
      setBrokers(String(kiteConfigRequest.kafka.brokers.size));
      return;
    }
    setKiteConfigRequest((kiteConfigRequest) => {
      // const oldSize = kiteConfigRequesters.size;
      let brokers = [];
      if (size > 0) {
        // push new array and update size:
        let set: Set<number>;
        if (kiteConfigRequest.kafka.brokers.ports?.brokers !== undefined)
          set = new Set(kiteConfigRequest.kafka.brokers.ports.brokers);
        const portArr = new Array(size).fill(_ports_.kafka.broker.external);
        brokers = portArr.map((el, idx) => {
          if (
            kiteConfigRequest.kafka.brokers.ports?.brokers !== undefined &&
            idx < kiteConfigRequest.kafka.brokers.size
          )
            return kiteConfigRequest.kafka.brokers.ports.brokers[idx];
          else {
            let j = idx;
            while (set !== undefined && set.has(portArr.at(0) + j)) {
              j++;
            }
            return portArr.at(0) + j;
          }
        });
      }
      const replicas = Math.min(size, kiteConfigRequest.kafka.brokers.replicas);
      // console.log(brokers);

      return {
        ...kiteConfigRequest,
        kafka: {
          ...kiteConfigRequest.kafka,
          brokers: {
            ...kiteConfigRequest.kafka.brokers,
            size,
            replicas,
            ports: {
              // ...kiteConfigRequest.kafka.brokers.ports,
              brokers
            }
          }
        }
      };
    });
    setReplicas((prev) => String(Math.min(size, Number(prev))));
    setBrokers(() => String(size));
  };

  const handleBrokers = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBrokers(event.target.value);
  };

  const handleOnChangeReplicas = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const replicas = event.target.value;
    setReplicas(replicas);
  };

  const handleReplicasOnBlur: FocusEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    const replicas = Number(event.target.value);
    if (replicas <= 0) {
      setReplicas(String(kiteConfigRequest.kafka.brokers.replicas));
      return;
    }
    setKiteConfigRequest((kiteConfigRequest) => {
      // const numberOfBrokers = kiteConfigRequest.kafka.brokers.size;
      if (replicas > kiteConfigRequest.kafka.brokers.size)
        return kiteConfigRequest;
      const update = {
        kafka: {
          ...kiteConfigRequest.kafka,
          brokers: {
            ...kiteConfigRequest.kafka.brokers,
            replicas
          }
        }
      };
      return {
        ...kiteConfigRequest,
        ...update
      };
    });
    setReplicas((prev) => {
      if (replicas > kiteConfigRequest.kafka.brokers.size)
        return String(kiteConfigRequest.kafka.brokers.replicas);
      else return String(replicas);
    });
  };

  const handleOnBlurZookeeper: FocusEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    const size = Number(event.target.value);
    if (size <= 0 || size > 500) {
      setZookeepers(String(kiteConfigRequest.kafka.zookeepers.size));
      return;
    }
    let zkPorts = [];
    if (size > 0) {
      // push new array and update size:
      let set: Set<number>;
      if (kiteConfigRequest.kafka.zookeepers.ports?.client !== undefined)
        set = new Set(kiteConfigRequest.kafka.zookeepers.ports?.client);
      const portArr = new Array(size).fill(_ports_.zookeeper.client.external);
      zkPorts = portArr.map((el, idx) => {
        if (
          kiteConfigRequest.kafka.zookeepers.ports?.client !== undefined &&
          idx < kiteConfigRequest.kafka.zookeepers.size
        )
          return kiteConfigRequest.kafka.zookeepers.ports.client[idx];
        else {
          let j = idx;
          while (set !== undefined && set.has(portArr.at(0) + j)) {
            j++;
          }
          return portArr.at(0) + j;
        }
      });
    }
    const update = {
      kafka: {
        ...kiteConfigRequest.kafka,
        zookeepers: {
          ...kiteConfigRequest.kafka.zookeepers,
          size,
          ports: {
            ...kiteConfigRequest.kafka.zookeepers.ports,
            client: zkPorts
          }
        }
      }
    };
    updateKiteConfigRequest(update);
    setZookeepers(String(size));
  };

  const handleZoo = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setZookeepers(event.target.value);
  };

  const handleSink = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateKiteConfigRequest({
      sink: {
        name: event.target.value === 'jupyter' ? 'jupyter' : 'spark'
      }
    });
  };

  const renderAdvanced = () => {
    // Array to be returned with all fo the Advanced Configuration elements
    const res: JSX.Element[] = [];

    // Kafka Section
    res.push(<h2>Kafka</h2>);

    // Kafka > JMX
    res.push(<h3>JMX</h3>);
    for (let i = 0; i < 2; i++) {
      res.push(
        <TextField
          label={`Port ${i + 1}`}
          id="filled-number"
          type="number"
          InputLabelProps={{ shrink: true }}
          variant="filled"
          value={kiteConfigRequest.kafka.jmx.ports[i]}
          onChange={(e) => {
            const ports: number[] = kiteConfigRequest.kafka.jmx.ports;
            ports[i] = +e.target.value;
            const update = {
              kafka: {
                ...kiteConfigRequest.kafka,
                jmx: {
                  ...kiteConfigRequest.kafka.jmx,
                  ports
                }
              }
            };
            updateKiteConfigRequest(update);
          }}
        />
      );
    }

    // Kafka > Spring
    res.push(
      <div>
        <h3>Spring</h3>
        {/* Port */}
        <TextField
          label="Port"
          id="filled-number"
          type="number"
          InputLabelProps={{ shrink: true }}
          variant="filled"
          value={kiteConfigRequest.kafka.spring.port}
          onChange={(e) => {
            const port = +e.target.value;
            const update = Object.assign({}, kiteConfigRequest, {
              kafka: {
                spring: {
                  port
                }
              }
            });
            updateKiteConfigRequest(update);
          }}
        />
      </div>
    );

    // Kafka > Brokers
    res.push(<h3>Broker Ports</h3>);
    // As many broker configuration boxes as needed
    for (let i = 0; i < kiteConfigRequest.kafka.brokers.size; i++) {
      res.push(
        <div key={`broker-port-${i}`}>
          {/* <h3>Broker {i + 1}</h3> */}
          <Box
          // sx={{
          //   display: 'grid',
          //   gridTemplateColumns: 'repeat(3, 1fr)'
          //   // margin: '0 2rem 0 0'
          // }}
          >
            {/* <TextField
              label="ID"
              // sx={{ width: 300 }}
              id="filled-number"
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
            /> */}
            <TextField
              label={`Broker ${i + 1}`}
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
            {/* <TextField
              id="filled-number"
              placeholder={(DEFAULT_JMX_PORT + i).toString()}
              onChange={(e) => {
                if (+e.target.value <= 0) return;
                const jmx: number[] =
                  kiteConfigRequest.kafka.brokers?.ports?.jmx ?? [];
                jmx[i] = +e.target.value;

                const update = Object.assign({}, kiteConfigRequest, {
                  kafka: {
                    jmx
                  }
                });
                updateKiteConfigRequest(update);
              }}
              value={kiteConfigRequest.kafka.brokers?.ports?.jmx?.[i] || ''}
              label="JMX Port"
              type="number"
              InputLabelProps={{
                shrink: true
              }}
              variant="filled"
            /> */}
          </Box>
        </div>
      );
    }

    // Kafka > Brokers
    res.push(<h3>Zookeeper Ports</h3>);
    // As many broker configuration boxes as needed
    for (let i = 0; i < kiteConfigRequest.kafka.zookeepers.size; i++) {
      res.push(
        <div key={`zookeeper-port-${i}`}>
          {/* <h3>Broker {i + 1}</h3> */}
          <TextField
            label={`Zookeeper ${i + 1}`}
            id="filled-number"
            placeholder={(DEFAULT_BROKER_PORT + i).toString()}
            onChange={(e) => {
              if (+e.target.value <= 0) return;

              const client: number[] =
                kiteConfigRequest.kafka.zookeepers.ports.client;

              client[i] = +e.target.value;

              const update = {
                kafka: {
                  ...kiteConfigRequest.kafka,
                  zookeepers: {
                    ...kiteConfigRequest.kafka.zookeepers,
                    ports: {
                      ...kiteConfigRequest.kafka.zookeepers.ports,
                      client
                    }
                  }
                }
              };
              updateKiteConfigRequest(update);
            }}
            value={kiteConfigRequest.kafka.zookeepers?.ports?.client?.[i] || ''}
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
        </div>
      );
    } // Grafana Configuration
    res.push(
      <div>
        <h2>Grafana</h2>
        {/* Port */}
        <TextField
          label="Port"
          id="filled-number"
          type="number"
          InputLabelProps={{ shrink: true }}
          variant="filled"
          value={kiteConfigRequest.grafana.port}
          onChange={(e) => {
            const port = +e.target.value;
            const update = Object.assign({}, kiteConfigRequest, {
              grafana: { port }
            });
            updateKiteConfigRequest(update);
          }}
        />
      </div>
    );

    // Prometheus
    res.push(
      <div>
        <h2>Prometheus</h2>
        {/* Prometheus: Scrape Interval */}
        <TextField
          label="Scrape Interval"
          id="filled-number"
          type="number"
          InputLabelProps={{ shrink: true }}
          variant="filled"
          value={kiteConfigRequest.prometheus.scrape_interval}
          onChange={(e) => {
            const scrape_interval = +e.target.value;
            const update = Object.assign({}, kiteConfigRequest, {
              prometheus: { scrape_interval }
            });
            updateKiteConfigRequest(update);
          }}
        />
        {/* Prometheus: Evaluation Interval */}
        <TextField
          label="Evaluation Interval"
          id="filled-number"
          type="number"
          InputLabelProps={{ shrink: true }}
          variant="filled"
          value={kiteConfigRequest.prometheus.evaluation_interval}
          onChange={(e) => {
            const evaluation_interval = +e.target.value;
            const update = Object.assign({}, kiteConfigRequest, {
              prometheus: { evaluation_interval }
            });
            updateKiteConfigRequest(update);
          }}
        />
        {/* Prometheus: Port*/}
        <TextField
          label="Port"
          id="filled-number"
          type="number"
          InputLabelProps={{ shrink: true }}
          variant="filled"
          value={kiteConfigRequest.prometheus.port}
          onChange={(e) => {
            const port = +e.target.value;
            const update = Object.assign({}, kiteConfigRequest, {
              prometheus: { port }
            });
            updateKiteConfigRequest(update);
          }}
        />
      </div>
    );

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
                      onBlur={handleOnBlurBrokers}
                      onChange={handleBrokers}
                      // value={kiteConfigRequest.kafka.brokers.size}
                      value={brokers}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                    <TextField
                      label="Replicas"
                      id="outlined-number"
                      type="number"
                      // defaultValue="2"
                      onChange={handleOnChangeReplicas}
                      onBlur={handleReplicasOnBlur}
                      value={replicas}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                    <TextField
                      id="outlined-number"
                      // defaultValue="2"
                      label="Zookeepers"
                      type="number"
                      onBlur={handleOnBlurZookeeper}
                      onChange={handleZoo}
                      // value={kiteConfigRequest.kafka.zookeepers.size}
                      value={zookeepers}
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
