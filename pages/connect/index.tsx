import Head from 'next/head';
import SidebarLayout from '../../src/layouts/SidebarLayout';
import PageTitle from '../../src/components/PageTitle';
import PageTitleWrapper from '../../src/components/PageTitleWrapper';
import {Grid} from '@mui/material';
import React from 'react';

function Forms() {

  return (
    <>
      <Head>
        <title>Connect an Existing Kafka Configuration</title>
      </Head>
      <PageTitleWrapper>
        <PageTitle
          heading="Connect an Existing Kafka Configuration"
          subHeading="Connect an existing Kafka instance to view health metrics, configure topics and partition settings, and more."
          docs="https://kafka.apache.org/"
        />
      </PageTitleWrapper>
     
          <Grid textAlign='center' item xs={12}>

          </Grid>
    
    </>
  );
}

Forms.getLayout = (page: any) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;
