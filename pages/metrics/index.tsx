import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { ChangeEvent, useState, useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import Footer from '@/components/Footer';
import { KiteState } from '@../../src/common/kite/constants';
import {
  Grid,
  Tab,
  Tabs,
  Divider,
  Container,
  Card,
  Box,
  useTheme,
  styled,
  ListItem
} from '@mui/material';
import PageTitleWrapper from '@/components/PageTitleWrapper';

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

function DashboardTasks() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('analytics');
  const [connected, setConnected] = useState(2);
  const [grafanaPort, setGrafanaPort] = useState<string>('');

  useEffect(() => {
    checkActive();
    getSetup();
  }, []);

  const checkActive = async () => {
    try {
      const response = await fetch('/api/kite/getKiteState');
      const data = await response.text();
      if (data === KiteState.Running) {
        setConnected(0);
      } else {
        setConnected(1);
      }
    } catch (err) {
      setConnected(1);
      console.log(err);
    }
  };

  const getSetup = async () => {
    try {
      if(connected){
      const {grafana} = await fetch('/api/kite/getSetup').then(data => data.json());
      console.log(grafana.port) 
      setGrafanaPort(grafana.port.toString())
      }
    } catch (err) {
      setConnected(1);
      console.log(err);
    }
  };


  const pageMessage = () => {
    return (
      <PageTitle
          heading="You Do Not Have an Active Deployment"
          subHeading="Navigate to 'Create Data Pipeline' to configure and deploy a Kafka instance, or 'connect existing' to connect an existing deployment in order to view metrics."
        />
    )
  }

  const tabs = [
    { value: 'analytics', label: 'Analytics Overview' },
    { value: 'taskSearch', label: 'Cluster Health' },
    { value: 'consumer', label: 'Consumer Metrics' },
    { value: 'producer', label: 'Producer Metrics' },
    { value: 'partitions', label: 'Partition Metrics' },
    { value: 'docker', label: 'Docker Metrics' }
  ];

  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  return (
    <>
      <Head>
        <title>View Kafka Metrics</title>
      </Head>
      <PageTitleWrapper>
        {connected === 1 && pageMessage()}
      </PageTitleWrapper>
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
        <Card variant="outlined">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={0}
          >
            {currentTab === 'analytics' && (
              <>
                <Grid item xs={12} >
                  <Box p={4}>
                  <Grid container spacing={3} >
                  <Grid item xs={3}>
                  <div>
                    <h3 className='metric-header'>Brokers Online</h3>
                    <iframe src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=647&kiosk`}></iframe>
                  </div>
                  </Grid>
                  <Grid item xs={3}>
                  <div>
                    <h3 className='metric-header'>Active Controllers</h3>
                    <iframe src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=233&kiosk`}></iframe>
                  </div>
                  </Grid>
                  <Grid item xs={3}>
                  <div>
                    <h3 className='metric-header'>Total Topics</h3>
                    <iframe src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=625&kiosk`}></iframe>
                  </div>
                  </Grid>
                  <Grid item xs={3}>
                  <div>
                    <h3 className='metric-header'>Online Partitions</h3>
                    <iframe src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=40&kiosk`}></iframe>
                  </div>
                  </Grid>
                  </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                  <Box
                    p={4}
                    sx={{
                      background: `${theme.colors.alpha.black[5]}`
                    }}
                  >
                    <Grid container spacing={4}>
                      <Grid item xs={12} sm={6} md={8}>
                        <Box 
                         mb={2}
                         display="flex"
                         alignItems="center"
                         justifyContent="center"
                        >
                        <div>
                          <h3 className='metric-header'>Message Throughput</h3>
                          <iframe
                            src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&kiosk&viewPanel=152`}
                            width='800'
                            height='300'
                          ></iframe>
                        </div>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                      <div>
                        <h3 className='metric-header'>Producer Latency</h3>
                        <iframe
                          src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=192&kiosk`}
                          width='400'
                          height='300'
                        ></iframe>
                      </div>
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider />
                </Grid>
              </>
            )}
            {currentTab === 'taskSearch' && (
              <Grid item xs={12}>
                <Box p={4}>
                <Box p={4} alignContent={'center'} justifyContent={'space-evenly'}>
                <Grid container  rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} style={{'margin':'auto'}}>
                  <Grid item xs={6} >
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Failed Produce Requests Per Broker</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=612&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Failed Produce Requests Per Topic</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=614&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Failed Fetch Requests Per Broker</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=613&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Failed Fetch Requests Per Topic</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=615&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                </Grid>
                </Box>
                </Box>
              </Grid>
            )}
            {currentTab === 'consumer' && (
              <Grid item xs={12}>
                <Box p={4}>
                <Box p={4} alignContent={'center'} justifyContent={'space-evenly'}>
                <Grid container  rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} style={{'margin':'auto'}}>
                  <Grid item xs={6} >
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Total Fetch Consumer Latency</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=677&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Fetch Consumer Latency Per Broker</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=666&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Fetch Consumer Requests Per Broker</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=178&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Total Fetch Requests Per Broker</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=56&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                </Grid>
                </Box>
                </Box>
              </Grid>
            )}
            {currentTab === 'producer' && (
              <Grid item xs={12}>
                <Box p={4}>
                <Box p={4} alignContent={'center'} justifyContent={'space-evenly'}>
                <Grid container  rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} style={{'margin':'auto'}}>
                  <Grid item xs={6} >
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Total Time Producer Latency</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=192&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Producer Latency Per Broker</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=665&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Total Produce Request Rate Per Topic</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=50&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Produce Requests Per Broker</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=176&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                </Grid>
                </Box>
                </Box>
              </Grid>
            )}
            {currentTab === 'partitions' && (
              <Grid item xs={12}>
                <Box p={4}>
                <Box p={4} alignContent={'center'} justifyContent={'space-evenly'}>
                <Grid container  rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} style={{'margin':'auto'}}>
                  <Grid item xs={6} >
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Under-Replicated Partitions</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=30&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Partitions Leader and Replica Per Broker</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=619&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Partitions Leader Per Broker </h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=628&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Count of Partitions Per Broker</h3>
                    <iframe
                      src={`http://localhost:${grafanaPort}/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=603&kiosk`}
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                </Grid>
                </Box>
                </Box>
              </Grid>
            )}
            {currentTab === 'docker' && (
              <Grid item xs={12}>
                <Box p={4}>
                <Box p={4} alignContent={'center'} justifyContent={'space-evenly'}>
                <Grid container  rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} style={{'margin':'auto'}}>
                  <Grid item xs={6} >
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Docker containers</h3>
                    <iframe
                      src='http://localhost:3050/d/huLqhzaVk/docker?orgId=1&from=1678193575700&to=1678215175701&kiosk'
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>CPU Load</h3>
                    <iframe
                      src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=619&kiosk'
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Partitions Leader Per Broker </h3>
                    <iframe
                      src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=628&kiosk'
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                    <div>
                    <h3 className='metric-header'>Count of Partitions Per Broker</h3>
                    <iframe
                      src='http://localhost:3050/d/5nhADrDWk/kafka-metrics?orgId=1&refresh=5s&viewPanel=603&kiosk'
                      width='600'
                      height='300'
                    ></iframe>
                  </div>
                    </ListItem>
                  </Grid>
                </Grid>
                </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Card>
      </Container>
      <Footer />
    </>
  );
}

DashboardTasks.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default DashboardTasks;
