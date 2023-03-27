import Footer from '@/components/Footer';
import PageTitle from '@/components/PageTitle';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import SidebarLayout from '@/layouts/SidebarLayout';
// import { defaultCfg } from '@/common/constants';
import { _ports_ } from '@/common/constants';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KiteConfig } from 'xkite-core';

const FormSchema = z.object({
  brokers: z.number().min(1, { message: 'At least one broker is required' }),
  brokersAdvanced: z.array(z.object({ port: z.number() }))
});

type FormSchema = z.infer<typeof FormSchema>;

const defaultValues: FormSchema = {
  brokers: 0,
  brokersAdvanced: []
};

// const fetchAndSetFormDefaults = async (): Promise<FormSchema> => {
//   const initialState: KiteConfig = await fetch('/api/kite/getConfig').then(
//     (data) => data.json()
//   );

//   return {
//     brokers: initialState.kafka.brokers.size,
//     brokersAdvanced: [{ port: 5000 }]
//   };
// };

function Forms() {
  const [kiteConfig, setKiteConfig] = useState<KiteConfig | undefined>();
  const {
    control,
    reset,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues,
    resolver: zodResolver(FormSchema)
  });
  const { fields, append, remove } = useFieldArray({
    name: 'brokersAdvanced',
    control
  });

  // This will solve the type error that the name fields are nevers, but it's not ideal either
  useEffect(() => {
    fetch('/api/kite/getConfig')
      .then((data) => data.json())
      .then((kiteConfig: KiteConfig) => {
        setKiteConfig(kiteConfig);
        reset({
          brokers: kiteConfig.kafka.brokers.size
        });
      });
  }, [reset]);

  // watch to enable re-render whenever the number of brokers is changed
  const numberOfBrokers = watch('brokers');
  useEffect(() => {
    const newVal = numberOfBrokers || 0;
    const oldVal = fields.length;
    if (newVal > oldVal) {
      // append broker configs to field array
      for (let i = oldVal; i < newVal; i++) {
        // either get the port from kiteConfig or generate the next number
        const port =
          kiteConfig?.kafka.brokers.ports?.brokers?.[i] ??
          _ports_.kafka.broker.external + i;
        append({ port });
      }
    } else {
      // remove as needed
      for (let i = oldVal; i > newVal; i--) {
        remove(i - 1);
      }
    }
  }, [numberOfBrokers]);
  console.log(kiteConfig);

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
                  <div>
                    <Controller
                      name={'brokers'}
                      control={control}
                      rules={{
                        required: 'Please specify the number of brokers',
                        min: {
                          value: 1,
                          message: 'At least one broker is required'
                        },
                        max: {
                          value: 50,
                          message: '50 is the maximum'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          label="Brokers"
                          error={Boolean(errors.brokers)}
                          helperText={errors.brokers?.message ?? ''}
                          type={'number'}
                          {...field}
                          InputLabelProps={{
                            shrink: true
                          }}
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
      {fields.map((item, index) => (
        <div key={item.id}>
          <Controller
            name={`brokersAdvanced.${index}.port`}
            control={control}
            render={({ field }) => (
              <TextField
                label={`Broker ${index + 1} Port`}
                // error={Boolean(errors.brokers)}
                // helperText={errors.brokers?.message ?? ''}
                type={'number'}
                {...field}
                InputLabelProps={{
                  shrink: true
                }}
              />
            )}
          />
        </div>
      ))}
      <button type="button" onClick={handleSubmit(onSubmit)}>
        Submit
      </button>
      <Footer />
    </>
  );
}

Forms.getLayout = (page: any) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;
