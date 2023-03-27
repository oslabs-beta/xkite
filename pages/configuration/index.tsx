import Footer from '@/components/Footer';
import PageTitle from '@/components/PageTitle';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import SidebarLayout from '@/layouts/SidebarLayout';
import { TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Head from 'next/head';
import { Controller, useForm } from 'react-hook-form';
import { KiteConfig } from 'xkite-core';

interface FormData {
  brokers: number;
}

const fetchAndSetFormDefaults = async (): Promise<FormData> => {
  const initialState: KiteConfig = await fetch('/api/kite/getConfig').then(
    (data) => data.json()
  );

  return {
    brokers: initialState.kafka.brokers.size
  };
};

function Forms() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: fetchAndSetFormDefaults
  });
  const onSubmit = (data: any) => console.log(data);

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
      {/* Main Form Area */}
      <form onSubmit={handleSubmit(onSubmit)}>
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
                    key={`form-box`}
                    component="form"
                    sx={{
                      '& .MuiTextField-root': { m: 2, width: '30ch' }
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <div key={`required`}>
                      <Controller
                        name={'brokers'}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            label="Brokers"
                            {...field}
                            InputLabelProps={{
                              shrink: true
                            }}
                          />
                        )}
                      ></Controller>
                      <Controller
                        name={'textValue'}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            onChange={onChange}
                            value={value}
                            label={'Text Value'}
                          />
                        )}
                      />
                    </div>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
        <input type="submit" />
      </form>
      <Footer />
    </>
  );
}

Forms.getLayout = (page: any) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;
