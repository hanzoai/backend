import React from 'react';
import { IFieldComponentProps } from '../../types';
import MultiSelect, { MultiSelectProps } from '@hanzo/multiselect';

import { TextField, FilledTextFieldProps, MenuItem } from '@mui/material';

import FieldAssistiveText from '../../FieldAssistiveText';

export interface ISingleSelectComponentProps
  extends IFieldComponentProps,
    Omit<
      FilledTextFieldProps,
      'variant' | 'label' | 'name' | 'onBlur' | 'onChange' | 'ref' | 'value'
    >,
    Partial<
      Omit<MultiSelectProps<string>, 'value' | 'onChange' | 'options' | 'label'>
    > {
  options: (string | { value: string; label: React.ReactNode })[];
}

export default function SingleSelectComponent({
  field: { onChange, onBlur, value, ref },
  fieldState,
  formState,

  name,
  useFormMethods,

  errorMessage,
  assistiveText,

  options = [],
  ...props
}: ISingleSelectComponentProps) {
  const sanitisedValue = (Array.isArray(value) ? value[0] : value) ?? '';

  // Render MultiSelect if one of the following props is defined
  if (
    [
      props.searchable,
      props.labelPlural,
      props.freeText,
      props.clearable,
    ].reduce((a, c) => a || c !== undefined, false)
  )
    return (
      <MultiSelect
        {...(props as any)}
        multiple={false}
        options={options}
        value={sanitisedValue ?? null}
        onChange={(value) => onChange(value ?? '')}
        onBlur={onBlur}
        TextFieldProps={{
          ...props.TextFieldProps,
          error: !!errorMessage,
          InputLabelProps: {
            required: props.required,
            ...props.TextFieldProps?.InputLabelProps,
          },
          FormHelperTextProps: {
            component: 'div',
            ...props.TextFieldProps?.FormHelperTextProps,
          },
          helperText: (errorMessage || assistiveText) && (
            <>
              {errorMessage}

              <FieldAssistiveText
                style={{ margin: 0 }}
                disabled={!!props.disabled}
              >
                {assistiveText}
              </FieldAssistiveText>
            </>
          ),
          onBlur,
          'data-type': 'multi-select-single',
          'data-label': props.label ?? '',
          inputRef: ref,
        }}
        clearable={props.clearable === true}
      />
    );

  // Render basic Material-UI select
  return (
    <TextField
      fullWidth
      select
      error={!!errorMessage}
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
      {...props}
      onChange={onChange}
      onBlur={onBlur}
      // Convert string[] value to string
      // And remove MUI error when `undefined` or `null` is passed
      value={(Array.isArray(value) ? value[0] : value) ?? ''}
      data-label={props.label ?? ''}
      data-type={'single-select'}
      inputProps={{ required: false, ...props.inputProps }}
      inputRef={ref}
    >
      {options.map((option) => {
        if (typeof option === 'object')
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        return (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        );
      })}
    </TextField>
  );
}
