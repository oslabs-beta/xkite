import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitle from '@/components/PageTitle';
import { useState, SyntheticEvent, CSSProperties, useEffect } from 'react';
import defaultCfg from '@/common/kite/constants';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HashLoader from "react-spinners/HashLoader";
import axios from 'axios';
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
  Typography,
} from '@mui/material';
import Footer from 'src/components/Footer';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ExportConfigBtn from '@/content/Dashboards/Tasks/ExportConfigBtn';

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
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const dataSources = [
  {
    value: 'postgresql',
    label: 'PostgreSQL'
  },
  {
    value: 'KSQL',
    label: 'KSQL'
  },
];

const dataSinks = [
  {
    value: 'jupyter',
    label: 'Jupyter'
  },
  {
    value: 'Spark',
    label: 'Spark'
  },
];

const DEFAULT_BROKER_ID = 101;
const DEFAULT_JMX_PORT = 9991;
const DEFAULT_BROKER_PORT = 9091;

function Forms() {
  const [portsOpen, setPortsOpen] = useState<PortsOpen>({});
  const [kiteConfigRequest, setKiteConfigRequest] = useState(defaultCfg);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [loader, setLoader] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    checkActive();
  }, []);

  const checkActive = async () => {
      try {
        const response = await fetch('http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=603&kiosk', {
          mode: 'no-cors',
          headers: {
            'Access-Control-Allow-Origin':'*'
          }
        });
        console.log(response.status, 'this is status')
        if (response.status === 0) {
          setActive(1);
        } else {
          setActive(0);
        }
      } catch (err) {
        console.log(err);
      }
  }

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  function updateKiteConfigRequest(update: Partial<KiteConfig>): void {
    setKiteConfigRequest((kiteConfigRequest) => {
      return {
        ...kiteConfigRequest,
        ...update,
      };
    });
  }

  const isActive = () => {
    return (
      <div className="sweet-loading">
      <p>You have an active Kite deployment. To start over, select "Disconnect" below.</p>
      </div>
    )
  }

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
      <p>Please stand by while containers are deployed</p>
      </div>
    )
  }

  const queryMetrics = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=603&kiosk', {
          mode: 'no-cors',
          headers: {
            'Access-Control-Allow-Origin':'*'
          }
        });
        console.log(response.status, 'this is status')
        if (response.status === 0) {
          clearInterval(interval);
            window.location.href = '/metrics';
        } 
      } catch (err) {
        console.log(err);
      }
    }, 1000)
  }

  function ShutDownBtn() {
    const [shuttingDown, setShuttingDown] = useState(false);
  
    async function disconnectHandler(event: SyntheticEvent): Promise<void> {
      console.log(event);
      setShuttingDown(true);
      console.log('Disconnecting…');
      try {
        const response = await axios.delete('/api/kite/shutdown');
        console.log(response);
      } catch (error) {
        console.error('Error occurred during shutdown:', error);
      }
      setActive(0);
    }
  
    return (
      
        <Button size="large"  variant="outlined" sx={{ margin: 1 }} color="secondary" onClick={disconnectHandler} disabled={shuttingDown}>
        Disconnect
        </Button>
    );
  }

  const checkPortOpen: CheckPortOpen = async (index, type, port) => {
    //console.log({ index, type, port });
    const isOpen = await isPortOpen(port);
    console.log(portsOpen[`broker-0`], '187')
    setPortsOpen((portsOpen) => ({
      ...portsOpen,
      [index]: {
        ...portsOpen[index],
        [type]: isOpen,
      },
    }));
    //console.log(isOpen);

    return isOpen;
  };

  async function isPortOpen(port: number): Promise<boolean> {
    const { isOpen } = await fetch('/api/checkPort', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ port }),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error(error.message);
      });

    return isOpen;
  }

  function submitHandler(event: SyntheticEvent) {
    event.preventDefault();
    setLoader(1);
    queryMetrics();
    // TODO: Prevent state for deleted brokers from being submitted
    //console.log(kiteConfigRequest)
    console.log('sending configuration…');
    //console.log(defaultCfg);
    fetch('/api/kite/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kiteConfigRequest),
    })
      .then((response) => {
        console.dir(response);
      })
      .catch((error) => {
        console.error(error.message);
      });
    // setSubmit(false);
  }


  const handleData = (event) => {
    updateKiteConfigRequest({
      db: {
        name: event.target.value,
      },
    });
  };

  const handleBrokers = (event) => {
    const size = event.target.value;
    if (size <= 0) return;
    const update = {
      kafka: {
        ...kiteConfigRequest.kafka,
        brokers: {
          ...kiteConfigRequest.kafka.brokers,
          size,
        },
      },
    };
    updateKiteConfigRequest(update);
  };

  const handleZoo = (event) => {
    const size = event.target.value;
    if (size <= 0) return;
    const update = {
      kafka: {
        ...kiteConfigRequest.kafka,
        zookeepers: {
          ...kiteConfigRequest.kafka.zookeepers,
          size,
        },
      },
    };
    updateKiteConfigRequest(update);
  };

  const handleSink = (event) => {
    updateKiteConfigRequest({
      sink: {
        name: event.target.value,
      },
    });
  };

  const renderAdvanced = () => {
    const res: JSX.Element[] = [];
    for(let i = 0; i < kiteConfigRequest.kafka.brokers.size; i++){
      res.push(
      <>
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
                  id,
                },
              },
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
                    brokers,
                  },
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
          value={
            kiteConfigRequest.kafka.brokers?.ports?.brokers?.[i] || ''
          }
          label="Port"
          type="number"
          InputLabelProps={{
            shrink: true
          }}
          
          error={
            portsOpen
              ? Object.hasOwn(portsOpen, `broker-${i}`)
              ?  !portsOpen[`broker-${i}`].port : false
              : false
          }
          
          onBlur={(e) =>
            checkPortOpen(
              `broker-${i}`,
              'port',
              Number(e.target.value)
            )}
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
                    jmx,
                  },
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
          value={
            kiteConfigRequest.kafka.brokers?.ports?.jmx?.[i] || ''
          }
          label="JMX Port"
          type="number"
          InputLabelProps={{
            shrink: true
          }}
          variant="filled"
        />
      </>)
    }
    return res;
  }

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
                      defaultValue="2"
                      onChange={handleBrokers}
                      value={kiteConfigRequest.kafka.brokers.size}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                    <TextField
                      id="outlined-number"
                      defaultValue="2"
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
          <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4bh-content"
          id="panel4bh-header"
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card >
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
          <Grid textAlign='center' item xs={12}>
            {(active === 1) && isActive()}
            {(active === 0) && (loader === 0) && <Button sx={{ margin: 2 }} variant="contained" onClick={submitHandler}>
              Submit
            </Button>}
            {(active === 0) && (loader === 1) && isLoading()}
            <Card>
              <Box textAlign='center'>
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

Forms.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;
