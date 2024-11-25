export const radiobuttonV2Config = {
  name: 'Radio-button',
  displayName: 'Radio Button',
  description: 'Select one from multiple choices',
  component: 'RadioButtonV2',
  defaultSize: {
    width: 10,
    height: 40,
  },
  others: {
    showOnDesktop: { type: 'toggle', displayName: 'Show on desktop' },
    showOnMobile: { type: 'toggle', displayName: 'Show on mobile' },
  },
  validation: {
    customRule: {
      type: 'code',
      displayName: 'Custom validation',
      placeholder: `{{components.text2.text=='yes'&&'valid'}}`,
    },
    mandatory: { type: 'toggle', displayName: 'Make this field mandatory' },
  },
  properties: {
    label: {
      type: 'code',
      displayName: 'Label',
      validation: {
        schema: { type: 'string' },
        defaultValue: 'Select',
      },
      accordian: 'Data',
    },
    advanced: {
      type: 'toggle',
      displayName: 'Dynamic options',
      validation: {
        schema: { type: 'boolean' },
      },
      accordian: 'Options',
    },
    value: {
      type: 'code',
      displayName: 'Default value',
      conditionallyRender: {
        key: 'advanced',
        value: false,
      },
      validation: {
        schema: {
          type: 'union',
          schemas: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
        },
      },
      accordian: 'Options',
    },
    schema: {
      type: 'code',
      displayName: 'Schema',
      conditionallyRender: {
        key: 'advanced',
        value: true,
      },
      accordian: 'Options',
    },
    optionsLoadingState: {
      type: 'toggle',
      displayName: 'Options loading state',
      validation: {
        schema: { type: 'boolean' },
      },
      accordian: 'Options',
    },
    loadingState: {
      type: 'toggle',
      displayName: 'Loading state',
      validation: { schema: { type: 'boolean' }, defaultValue: true },
      section: 'additionalActions',
    },
    visibility: {
      type: 'toggle',
      displayName: 'Visibility',
      validation: { schema: { type: 'boolean' }, defaultValue: true },

      section: 'additionalActions',
    },
    disabledState: {
      type: 'toggle',
      displayName: 'Disable',
      validation: { schema: { type: 'boolean' }, defaultValue: true },
      section: 'additionalActions',
    },
    tooltip: {
      type: 'code',
      displayName: 'Tooltip',
      validation: {
        schema: { type: 'string' },
        defaultValue: 'Enter tooltip text',
      },
      section: 'additionalActions',
      placeholder: 'Enter tooltip text',
    },
  },
  events: {
    onSelectionChange: { displayName: 'On select' },
  },
  styles: {
    labelColor: {
      type: 'color',
      displayName: 'Color',
      validation: { schema: { type: 'string' }, defaultValue: '#1B1F24' },
      accordian: 'label',
    },
    alignment: {
      type: 'switch',
      displayName: 'Alignment',
      validation: { schema: { type: 'string' }, defaultValue: 'side' },
      options: [
        { displayName: 'Side', value: 'side' },
        { displayName: 'Top', value: 'top' },
      ],
      accordian: 'label',
    },
    direction: {
      type: 'switch',
      displayName: 'Direction',
      validation: { schema: { type: 'string' }, defaultValue: 'left' },
      showLabel: false,
      isIcon: true,
      options: [
        { displayName: 'alignleftinspector', value: 'left', iconName: 'alignleftinspector' },
        { displayName: 'alignrightinspector', value: 'right', iconName: 'alignrightinspector' },
      ],
      accordian: 'label',
    },
    labelWidth: {
      type: 'slider',
      displayName: 'Width',
      accordian: 'label',
      conditionallyRender: {
        key: 'alignment',
        value: 'side',
      },
      isFxNotRequired: true,
    },
    auto: {
      type: 'checkbox',
      displayName: 'auto',
      showLabel: false,
      validation: { schema: { type: 'boolean' } },
      accordian: 'label',
      conditionallyRender: {
        key: 'alignment',
        value: 'side',
      },
      isFxNotRequired: true,
    },
    borderColor: {
      type: 'color',
      displayName: 'Border',
      validation: {
        schema: { type: 'string' },
      },
      accordian: 'switch',
    },
    switchOnBackgroundColor: {
      type: 'color',
      displayName: 'Checked background',
      validation: {
        schema: { type: 'string' },
      },
      accordian: 'switch',
      tip: 'Checked background',
      tooltipStyle: {},
      tooltipPlacement: 'bottom',
    },
    switchOffBackgroundColor: {
      type: 'color',
      displayName: 'Unchecked background',
      validation: {
        schema: { type: 'string' },
      },
      accordian: 'switch',
      tip: 'Unchecked background',
      tooltipStyle: {},
      tooltipPlacement: 'bottom',
    },
    handleColor: {
      type: 'color',
      displayName: 'Handle color',
      validation: {
        schema: { type: 'string' },
      },
      accordian: 'switch',
    },
    optionsTextColor: {
      type: 'color',
      displayName: 'Text',
      validation: {
        schema: { type: 'string' },
      },
      accordian: 'switch',
    },
    padding: {
      type: 'switch',
      displayName: 'Padding',
      validation: {
        schema: { type: 'union', schemas: [{ type: 'string' }, { type: 'number' }] },
        defaultValue: 'default',
      },
      isFxNotRequired: true,
      options: [
        { displayName: 'Default', value: 'default' },
        { displayName: 'None', value: 'none' },
      ],
      accordian: 'container',
    },
  },
  actions: [
    {
      handle: 'selectOption',
      displayName: 'Select Option',
      params: [
        {
          handle: 'option',
          displayName: 'Option',
        },
      ],
    },
  ],
  exposedVariables: {},
  definition: {
    others: {
      showOnDesktop: { value: '{{true}}' },
      showOnMobile: { value: '{{false}}' },
    },
    properties: {
      label: { value: 'Select' },
      options: {
        value: [
          {
            label: 'option1',
            value: '1',
            disable: { value: false },
            visible: { value: true },
            default: { value: false },
          },
          {
            label: 'option2',
            value: '2',
            disable: { value: false },
            visible: { value: true },
            default: { value: true },
          },
          {
            label: 'option3',
            value: '3',
            disable: { value: false },
            visible: { value: true },
            default: { value: false },
          },
        ],
      },
      value: { value: '{{"1"}}' },
      values: { value: '{{["1","2","3"]}}' },
      display_values: { value: '{{["Option1", "Option2", "Option3"]}}' },
      visibility: { value: '{{true}}' },
      disabledState: { value: '{{false}}' },
      loadingState: { value: '{{false}}' },
      optionsLoadingState: { value: '{{false}}' },
      optionVisibility: { value: '{{[true, true, true]}}' },
      optionDisable: { value: '{{[false, false, false]}}' },
      schema: {
        value:
          "{{[\t{label: 'Option1',value: '1',disable: false,visible: true,default: true},{label: 'Option2',value: '2',disable: false,visible: true},{label: 'Option3',value: '3',disable: false,visible: true}\t]}}",
      },
    },
    events: [],
    styles: {
      labelColor: { value: '#1B1F24' },
      direction: { value: 'left' },
      alignment: { value: 'side' },
      auto: { value: '{{true}}' },
      labelWidth: { value: '33' },
      borderColor: { value: '#FFFFFF' },
      switchOffBackgroundColor: { value: '#FFFFFF' },
      switchOnBackgroundColor: { value: '#4368E3' },
      handleColor: { value: '#FFFFFF' },
      optionsTextColor: { value: '#1B1F24' },
      padding: { value: 'default' },
    },
  },
};
