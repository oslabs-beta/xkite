import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitle from '@/components/PageTitle';
import {
  useState,
  useEffect,
  ReactChild,
  ReactFragment,
  ReactPortal
} from 'react';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import Footer from 'src/components/Footer';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';

function Forms() {
  interface Data {
    id: string;
    names: string;
    created: string;
    status: string;
    ports: string;
  }

  const blink = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

  type DivProps = {
    myColor: string;
  };

  const BlinkedBox = styled('div')<DivProps>(({ myColor }) => ({
    backgroundColor: myColor,
    width: 20,
    height: 20,
    animation: `${blink} 1.5s linear infinite`,
    borderRadius: 25,
    marginLeft: 10
  }));

  const [data, setData] = useState<Data[]>([]);
  const [inactiveData, setInactiveData] = useState<Data[]>([]);
  const fetchData = () => {
    fetch('/api/docker?containerStatus=active')
      .then((response) => response.json())
      .then((data) => {
        data.containers.forEach(
          (element: { names?: string; ports: string }) => {
            console.log('name is: ', element.names);
            if (!element.names) {
              console.log('Got inside');
              element.names = element.ports;
              element.ports = 'N/A';
              console.log('New data is: ', element);
            }
          }
        );
        setData(data.containers);
      });

    fetch('/api/docker?containerStatus=inactive')
      .then((response) => response.json())
      .then((data) => {
        setInactiveData(data.containers);
        console.log('Inactive containers:', data.containers);
      });
  };
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <PageTitleWrapper>
        <PageTitle heading="Docker metrics" />
        <p>
          Please review any inactive conatiners since they may cause issues with
          the application functionality.
        </p>
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
                    <List>
                      <label htmlFor=""> Inactive containers </label>
                    </List>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inactiveData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.ports}</TableCell>
                            <TableCell>{row.created}</TableCell>
                            <TableCell>{row.status} </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
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
                    <List>
                      <label htmlFor=""> Running Containers</label>
                    </List>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Notice</TableCell>
                          <TableCell>Ports</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.names}</TableCell>
                            <TableCell>{row.created}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>
                            <BlinkedBox myColor={row.status.includes('Paused')  ? "red" : "green"}/>
                            </TableCell>
                            <TableCell>{row.ports}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid textAlign="center" item xs={12}></Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

Forms.getLayout = (
  page: boolean | ReactChild | ReactFragment | ReactPortal
) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;
