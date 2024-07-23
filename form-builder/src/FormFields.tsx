import React, { useEffect, useState } from 'react';
import { Control, UseFormReturn, useWatch } from 'react-hook-form';
import useFormSettings from './useFormSettings';

import { useTheme, Grid, Checkbox } from '@mui/material';

import { Fields, CustomComponents } from './types';
import FieldWrapper, { IFieldWrapperProps } from './FieldWrapper';
import { getFieldProp } from './fields';

export interface IFormFieldsProps {
  fields: Fields;

  control: Control;
  customComponents?: CustomComponents;
  useFormMethods: UseFormReturn;
  setOmittedFields: ReturnType<typeof useFormSettings>['setOmittedFields'];
}

export default function FormFields({ fields, ...props }: IFormFieldsProps) {
  return (
    <Grid container spacing={3} style={{ marginBottom: 0 }}>
      {fields.map((field, i) => {
        // Call the field displayCondition function with values if necessary
        if (
          !!field.displayCondition &&
          typeof field.displayCondition === 'string'
        )
          return <DependentField key={i} index={i} {...field} {...props} />;

        // Otherwise, just use the field object
        // If we intentionally hide this field due to form values, don’t render
        if (!field) return null;

        // Conditional field
        if (field.conditional === 'check')
          return <ConditionalField key={i} index={i} {...field} {...props} />;

        return (
          <FieldWrapper key={field.name ?? i} index={i} {...field} {...props} />
        );
      })}
    </Grid>
  );
}

/**
 * Wrap the field declaration around this component so we can access
 * `useWatch` and it updates whenever the form’s values update
 */
function DependentField({ displayCondition, ...props }: IFieldWrapperProps) {
  const values = useWatch({ control: props.control });

  const [display, setDisplay] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line no-new-func
      const displayConditionFunction = new Function(
        'values',
        '"use strict";\n' + displayCondition!
      );
      const display = displayConditionFunction(values);
      setDisplay(display);

      props.setOmittedFields({
        name: props.name!,
        type: display ? 'unOmit' : 'omit',
      });
    } catch (e) {
      console.error('Failed to evaluate displayCondition function');
      console.error(e);
      setDisplay(false);
    }
  }, [values]);

  useEffect(() => {
    if (!display) props.useFormMethods.clearErrors(props.name!);
  }, [display]);

  if (!display) return null;

  // Conditional field
  if (props.conditional === 'check') return <ConditionalField {...props} />;

  return <FieldWrapper {...props} />;
}

/**
 * Wrap the field declaration around this component so we can access
 * `useWatch` to get the initial conditional checkbox state.
 * `getValues` does not seem to work.
 */
function ConditionalField({ conditional, ...props }: IFieldWrapperProps) {
  const theme = useTheme();

  const defaultValue = getFieldProp('defaultValue', props.type);

  const value = useWatch({ control: props.control, name: props.name! });
  const [conditionalState, setConditionalState] = useState(
    value !== undefined && value !== null && value !== defaultValue
  );

  useEffect(() => {
    props.setOmittedFields({
      name: props.name!,
      type: conditionalState ? 'unOmit' : 'omit',
    });

    if (!conditionalState) {
      props.useFormMethods.clearErrors(props.name!);
    }
  }, [conditionalState]);

  return (
    <Grid item key={props.name!} id={`conditionalField-${props.name}`} xs={12}>
      <Grid container wrap="nowrap" alignItems="flex-start">
        <Grid item>
          <Checkbox
            checked={conditionalState}
            onChange={(e) => {
              setConditionalState(e.target.checked);
            }}
            inputProps={{ 'aria-label': `Enable field ${props.label}` }}
            style={{ margin: theme.spacing(1, 2, 1, -1.5) }}
          />
        </Grid>

        <FieldWrapper
          {...props}
          disabledConditional={!conditionalState}
          gridCols={true}
          value={undefined}
        />
      </Grid>
    </Grid>
  );
}
