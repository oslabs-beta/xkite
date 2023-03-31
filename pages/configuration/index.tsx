import Footer from '@/components/Footer';
import PageTitle from '@/components/PageTitle';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import SidebarLayout from '@/layouts/SidebarLayout';
import { _ports_ } from '@/common/constants';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KiteConfig } from 'xkite-core/lib/cjs/types';
import BasicNumberInput from '@/components/configuration/BasicNumberInput';
import Button from '@mui/material/Button';
import {
  FormSchema,
  FormSchemaType
} from '@/components/configuration/FormSchema';
import BrokersPortsFieldsArray from '@/components/configuration/BrokersPortsFieldsArray';

const defaultValues: FormSchemaType = {
  brokers: 0,
  replicas: 0,
  zookeepers: 0,
  brokersAdvanced: []
};

function Forms() {
  const [kiteConfig, setKiteConfig] = useState<KiteConfig | undefined>();
  // get all the methods as an object to be passed into FormProvider
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(FormSchema)
  });
  // destructure methods for use on top level
  const {
    control,
    reset,
    handleSubmit,
    watch
    // formState: { errors }
  } = methods;

  // load the initial state into the form
  useEffect(() => {
    fetch('/api/kite/getConfig')
      .then((data) => data.json())
      .then((kiteConfig: KiteConfig) => {
        setKiteConfig(kiteConfig);
        reset({
          brokers: kiteConfig.kafka.brokers.size,
          replicas: kiteConfig.kafka.brokers.replicas,
          zookeepers: kiteConfig.kafka.zookeepers.size
        });
      });
  }, [reset]);

  const onSubmit = (data: any) => console.log(data);

  return (
    <FormProvider {...methods}>
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
      {/* This <Box> is really a <form> */}
      <Box
        component="form"
        key={`form-box`}
        sx={{
          // TODO: Fix this spacing
          '& .MuiTextField-root': { m: 2, width: '30ch' }
        }}
        onSubmit={handleSubmit(onSubmit)}
        // autoComplete="off"
      >
        <Container maxWidth="lg">
          <Card>
            <CardHeader title="Required Settings" />
            <Divider />
            <CardContent>
              <BasicNumberInput name="brokers" />
              <BasicNumberInput name="replicas" />
              <BasicNumberInput name="zookeepers" />
            </CardContent>
          </Card>
          <Grid container spacing={2} margin={2}>
            <BrokersPortsFieldsArray kiteConfig={kiteConfig} />
          </Grid>
          <Grid container justifyContent={'center'}>
            <Button size="large" variant="contained" type="submit">
              Submit
            </Button>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </FormProvider>
  );
}

Forms.getLayout = (page: any) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;
