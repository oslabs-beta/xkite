import { z } from 'zod';

export const FormSchema = z.object({
  brokers: z.coerce
    .number({
      required_error: 'Please specify the number of brokers',
      invalid_type_error: 'At least one broker is required' // catches empty input showing up as NaN
    })
    .min(1, { message: 'At least one broker is required' })
    .max(50, { message: 'No more than 50 brokers allowed' }),
  replicas: z.coerce
    .number({
      required_error: 'Please specify the number of replicas',
      invalid_type_error: 'At least one replica is required' // catches empty input showing up as NaN
    })
    .min(1, { message: 'At least one replica is required' })
    .max(50, { message: 'No more than 50 replicas allowed' }),
  zookeepers: z.coerce
    .number({
      required_error: 'Please specify the number of zookeepers',
      invalid_type_error: 'At least one zookeeper is required' // catches empty input showing up as NaN
    })
    .min(1, { message: 'At least one zookeeper is required' })
    .max(50, { message: 'No more than 50 zookeepers allowed' }),
  brokersAdvanced: z.array(z.object({ port: z.number() }))
});

export type FormSchemaType = z.infer<typeof FormSchema>;
