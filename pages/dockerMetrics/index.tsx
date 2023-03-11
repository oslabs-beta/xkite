import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitle from '@/components/PageTitle';
import { useState, useEffect } from 'react';
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

function Forms() {
  interface Data {
    id: string;
    names: string;
    created: string;
    status: string;
    ports: string;
  }

  const [data, setData] = useState<Data[]>([]);
  const [inactiveData, setInactiveData] = useState<Data[]>([]);
  const fetchData = () => {
    fetch('/api/docker?containerStatus=active')
      .then((response) => response.json())
      .then((data) => {
        setData(data.containers);
        console.log('Dataa 1 is:  ', data);
        console.log(typeof data, 'type of data');
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
      //   fetch('/api/docker?containerStatus=active')
      //     .then((response) => response.json())
      //     .then((data) => {
      //       setData(data.containers);
      //       console.log('Dataa 1 is:  ', data);
      //       console.log(typeof data, 'type of data');
      //     });

      //   fetch('/api/docker?containerStatus=inactive')
      //     .then((response) => response.json())
      //     .then((data) => {
      //       setInactiveData(data.containers);
      //       console.log('Inactive containers:', data.containers);
      //     });
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
                      <label htmlFor=""> Inactive containers</label>
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
                            <TableCell>{row.status}</TableCell>
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
                          <TableCell>Ports</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.names}</TableCell>
                            <TableCell>{row.created}</TableCell>
                            <TableCell>{row.status}</TableCell>
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

Forms.getLayout = (page: any) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;
