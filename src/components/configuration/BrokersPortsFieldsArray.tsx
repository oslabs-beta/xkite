import { _ports_ } from '@/common/constants';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useEffect } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { KiteConfig } from 'xkite-core';

interface BrokersPortsFieldsArrayType {
  kiteConfig: KiteConfig;
}

const BrokersPortsFieldsArray = ({ kiteConfig }) => {
  const {
    control,
    watch,
    formState: { errors }
  } = useFormContext();
  // Array of port configuration fields; one for each broker
  const {
    fields: fieldsBrokersAdvanced,
    append: appendBrokersAdvanced,
    remove: removeBrokersAdvanced
  } = useFieldArray({
    name: 'brokersAdvanced',
    control
  });

  // watch to enable re-render whenever the number of brokers is changed
  const numberOfBrokers = watch('brokers');
  useEffect(() => {
    const newVal = numberOfBrokers || 0;
    const oldVal = fieldsBrokersAdvanced.length;
    if (newVal > oldVal) {
      // append broker configs to field array
      for (let i = oldVal; i < newVal; i++) {
        // either get the port from kiteConfig or generate the next number
        const port =
          kiteConfig?.kafka.brokers.ports?.brokers?.[i] ??
          _ports_.kafka.broker.external + i;
        appendBrokersAdvanced({ port });
      }
    } else {
      // remove as needed
      for (let i = oldVal; i > newVal; i--) {
        removeBrokersAdvanced(i - 1);
      }
    }
  }, [numberOfBrokers]);

  return (
    <>
      {fieldsBrokersAdvanced.map((item, index) => (
        <Grid xs={3} key={item.id}>
          <Controller
            name={`brokersAdvanced.${index}.port`}
            control={control}
            render={({ field }) => (
              <TextField
                label={`Broker ${index + 1} Port`}
                type={'number'}
                {...field}
                InputLabelProps={{
                  shrink: true
                }}
                // InputProps={{ sx: { width: '200px' } }}
              />
            )}
          />
        </Grid>
      ))}
    </>
  );
};
export default BrokersPortsFieldsArray;
