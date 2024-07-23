import React from 'react';
import arrayMove from 'array-move';
import { IFieldComponentProps } from '../../types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { FormControl, Button, ButtonProps } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import ListItem from './ListItem';

import FieldLabel from '../../FieldLabel';
import FieldErrorMessage from '../../FieldErrorMessage';
import FieldAssistiveText from '../../FieldAssistiveText';

export interface IListComponentProps extends IFieldComponentProps {
  itemLabel?: string;
  placeholder?: string;
  addButtonProps?: Partial<ButtonProps>;
}

export default function ListComponent({
  field: { onChange, value: valueProp, ref },

  name,
  useFormMethods,

  label,
  errorMessage,
  assistiveText,

  required,
  disabled,

  itemLabel = 'Item',
  placeholder,
  addButtonProps = {},
}: IListComponentProps) {
  const value: string[] = Array.isArray(valueProp) ? valueProp : [];
  const add = () => onChange([...value, '']);

  const edit = (index: number) => (item: string) => {
    const newValue = [...useFormMethods.getValues(name)];
    newValue[index] = item;
    onChange(newValue);
  };

  const swap = (fromIndex: number, toIndex: number) => {
    const newValue = arrayMove(
      useFormMethods.getValues(name),
      fromIndex,
      toIndex
    );
    onChange(newValue);
  };

  const remove = (index: number) => () => {
    const newValue = [...useFormMethods.getValues(name)];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <FormControl
      component="fieldset"
      style={{ display: 'flex' }}
      data-type="text-list"
      data-label={label ?? ''}
      error={!!errorMessage}
      disabled={disabled}
      ref={ref as any}
      tabIndex={-1}
    >
      <FieldLabel
        error={!!errorMessage}
        disabled={!!disabled}
        required={!!required}
      >
        {label}
      </FieldLabel>

      <DndProvider backend={HTML5Backend} context={window}>
        {value.map((item, index) => (
          <ListItem
            key={index}
            name={name}
            index={index}
            item={item}
            edit={edit(index)}
            swap={swap}
            remove={remove(index)}
            itemLabel={itemLabel}
            placeholder={placeholder}
            disabled={disabled}
          />
        ))}
      </DndProvider>

      <div>
        <Button
          startIcon={
            <AddCircleIcon
              sx={{ mr: 2, '&:first-child': { fontSize: '1.5rem' } }}
            />
          }
          color="secondary"
          {...addButtonProps}
          onClick={add}
          sx={[
            { m: 0, ml: -0.5 },
            ...(Array.isArray(addButtonProps.sx)
              ? addButtonProps.sx
              : addButtonProps.sx
              ? [addButtonProps.sx]
              : []),
          ]}
          disabled={disabled}
        >
          Add {itemLabel}
        </Button>
      </div>

      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
      <FieldAssistiveText disabled={!!disabled}>
        {assistiveText}
      </FieldAssistiveText>
    </FormControl>
  );
}
