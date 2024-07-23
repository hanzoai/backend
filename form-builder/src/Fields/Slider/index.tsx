import React, { lazy } from 'react';
import { IFieldConfig } from '../../types';
import { FieldType } from '../../constants/fields';

import GestureSwipeHorizontal from 'mdi-material-ui/GestureSwipeHorizontal';

import Settings from './SliderSettings';
const Component = lazy(
  () => import('./SliderComponent') /* webpackChunkName: FormBuilder-Slider */
);

export const SliderConfig: IFieldConfig = {
  type: FieldType.slider,
  name: 'Slider',
  group: 'input',
  icon: <GestureSwipeHorizontal />,
  dataType: 'number',
  defaultValue: 0,
  component: Component,
  settings: Settings,
  validation: (config: Record<string, any>) => {
    const validation: any[][] = [['number']];

    if (typeof config.min === 'number')
      validation.push([
        'min',
        config.min,
        'Please use the slider to set the value',
      ]);

    if (typeof config.max === 'number')
      validation.push([
        'max',
        config.max,
        'Please use the slider to set the value',
      ]);

    return validation;
  },
};
export default SliderConfig;
