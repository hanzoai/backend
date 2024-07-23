import { IFieldConfig } from '../../types';
import { FieldType } from '../../constants/fields';

export const ShortTextSettings: IFieldConfig['settings'] = [
  {
    type: FieldType.shortText,
    name: 'placeholder',
    label: 'Placeholder',
    defaultValue: '',
  },
  {
    type: FieldType.shortText,
    name: 'maxCharacters',
    label: 'Max characters',
    conditional: 'check',
    defaultValue: undefined,
    format: 'number',
  },
  {
    type: FieldType.singleSelect,
    name: 'format',
    label: 'Format',
    defaultValue: '',
    options: [
      { value: '', label: 'None' },
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'number', label: 'Number' },
      { value: 'url', label: 'URL' },
      { value: 'twitter', label: 'Twitter handle' },
      { value: 'linkedin', label: 'LinkedIn URL' },
    ],
  },
  {
    type: FieldType.singleSelect,
    name: 'autoComplete',
    label: 'Autocomplete Suggestion',
    defaultValue: '',
    options: [
      { value: '', label: 'None' },
      { value: 'name', label: 'Full Name' },
      { value: 'given-name', label: 'Given Name' },
      { value: 'family-name', label: 'Family Name' },
      { value: 'additional-name', label: 'Middle Name' },
      { value: 'email', label: 'Email' },
      { value: 'organization', label: 'Organisation' },
      { value: 'organization-title', label: 'Organisation title' },
      { value: 'street-address', label: 'Street address' },
      { value: 'country-name', label: 'Country name' },
      { value: 'bday', label: 'Birthday' },
      { value: 'tel', label: 'Phone number' },
      { value: 'url', label: 'URL' },
    ],
    assistiveText:
      'Phones will suggest this value when the user clicks on this field. <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete" target="_blank" rel="noopener">See all available values</a>',
    freeText: true,
  },
];

export default ShortTextSettings;
