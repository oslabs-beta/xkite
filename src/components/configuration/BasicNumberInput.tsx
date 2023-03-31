import TextField from '@mui/material/TextField';
import { Controller } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

interface BasicNumberInputProps {
  name: string;
}

const BasicNumberInput = ({ name }: BasicNumberInputProps) => {
  const {
    control,
    formState: { errors }
  } = useFormContext();

  const label = name[0].toUpperCase() + name.slice(1);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          label={label}
          error={Boolean(errors[name])}
          helperText={errors[name]?.message ?? ''}
          type={'number'}
          {...field}
          // onChange={(event) => field.onChange(parseInt(event.target.value))}
          InputLabelProps={{
            shrink: true
          }}
        />
      )}
    />
  );
};

export default BasicNumberInput;
