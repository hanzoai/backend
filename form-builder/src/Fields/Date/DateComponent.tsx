import React from 'react';
import { IFieldComponentProps } from '../../types';

import {
  LocalizationProvider,
  DatePicker,
  DatePickerProps,
} from '@mui/x-date-pickers';
import { TextField, TextFieldProps } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import FieldAssistiveText from '../../FieldAssistiveText';

export interface IDateComponentProps
  extends IFieldComponentProps,
    Omit<
      DatePickerProps<Date, Date>,
      'label' | 'name' | 'onChange' | 'value' | 'ref'
    > {
  TextFieldProps: TextFieldProps;
}

export default function DateComponent({
  field: { onChange, onBlur, value, ref },
  fieldState,
  formState,

  name,
  useFormMethods,

  errorMessage,
  assistiveText,

  TextFieldProps,
  ...props
}: IDateComponentProps) {
  let transformedValue: any = null;
  if (value && 'toDate' in value) transformedValue = value.toDate();
  else if (value !== undefined) transformedValue = value;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        inputFormat="yyyy-MM-dd"
        mask="____-__-__"
        {...props}
        value={transformedValue}
        onChange={onChange}
        onClose={onBlur}
        inputRef={ref}
        // https://github.com/mui-org/material-ui/issues/10341#issuecomment-770784016
        PopperProps={{ disablePortal: true }}
        renderInput={(props) => (
          <TextField
            {...props}
            {...TextFieldProps}
            fullWidth
            onBlur={onBlur}
            error={props.error || !!errorMessage}
            FormHelperTextProps={{ component: 'div' } as any}
            helperText={
              (errorMessage || assistiveText) && (
                <>
                  {errorMessage}

                  <FieldAssistiveText
                    style={{ margin: 0 }}
                    disabled={!!props.disabled}
                  >
                    {assistiveText}
                  </FieldAssistiveText>
                </>
              )
            }
            data-type="date"
            data-label={props.label ?? ''}
            inputProps={{
              ...props.inputProps,
              required: false,
            }}
            sx={{
              '& .MuiInputBase-input': { fontVariantNumeric: 'tabular-nums' },
              ...TextFieldProps?.sx,
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
}
