import { resolveReferences } from '@/_helpers/utils';
import { useCurrentState } from '@/_stores/currentStateStore';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import Label from '@/_ui/Label';
import cx from 'classnames';
import './radioButtonV2.scss';

export const RadioButtonV2 = ({
  id,
  height,
  width,
  properties,
  styles,
  fireEvent,
  setExposedVariable,
  setExposedVariables,
  darkMode,
  dataCy,
  component,
  componentName,
  validate,
}) => {
  const {
    label,
    value,
    values,
    display_values,
    disabledState,
    optionVisibility,
    optionDisable,
    advanced,
    schema,
    optionsLoadingState,
    loadingState,
    options,
  } = properties;

  const {
    activeColor,
    boxShadow,
    labelAlignment,
    direction,
    auto: labelAutoWidth,
    labelWidth,
    optionsTextColor,
    borderColor,
    switchOffBackgroundColor,
    handleColor,
    switchOnBackgroundColor,
    padding,
    labelColor,
    alignment,
    errTextColor,
  } = styles;

  const textColor = darkMode && styles.textColor === '#000' ? '#fff' : styles.textColor;
  const [checkedValue, setValue] = useState(() => value);
  const currentState = useCurrentState();
  const isMandatory = resolveReferences(component?.definition?.validation?.mandatory?.value, currentState);
  const [visibility, setVisibility] = useState(properties.visibility);
  const [isLoading, setIsLoading] = useState(loadingState);
  const [isDisabled, setIsDisabled] = useState(disabledState);
  const validationData = validate(checkedValue);
  const { isValid, validationError } = validationData;
  const labelRef = useRef();
  const radioBtnRef = useRef();

  useEffect(() => setValue(value), [value]);

  const selectOptions = useMemo(() => {
    let _options = advanced ? schema : options;
    if (Array.isArray(_options)) {
      let _selectOptions = _options
        .filter((data) => data.visible)
        .map((value) => ({
          ...value,
          isDisabled: value.disable,
        }));
      return _selectOptions;
    } else {
      return [];
    }
  }, [advanced, schema, options]);

  function onSelect(selection) {
    setValue(selection);
    setExposedVariable('value', selection);
    fireEvent('onSelectionChange');
  }

  function deselectOption() {
    setValue(null);
    setExposedVariable('value', null);
    fireEvent('onSelectionChange');
  }

  useEffect(() => {
    const exposedVariables = {
      value: value,
      selectOption: async function (option) {
        onSelect(option);
      },
      deselectOption: async function () {
        deselectOption();
      },
    };
    setExposedVariables(exposedVariables);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, setValue]);

  useEffect(() => {
    if (visibility !== properties.visibility) setVisibility(properties.visibility);
    if (isLoading !== loadingState) setIsLoading(loadingState);
    if (isDisabled !== disabledState) setIsDisabled(disabledState);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.visibility, loadingState, disabledState]);

  useEffect(() => {
    setExposedVariable('isVisible', properties.visibility);
    setExposedVariable('isLoading', loadingState);
    setExposedVariable('isDisabled', disabledState);
    setExposedVariable('isMandatory', isMandatory);
    setExposedVariable('label', label);
    setExposedVariable('options', selectOptions);
    setExposedVariable('isValid', isValid);
    setExposedVariable('setVisibility', async function (value) {
      setVisibility(value);
    });
    setExposedVariable('setLoading', async function (value) {
      setIsLoading(value);
    });
    setExposedVariable('setDisabled', async function (value) {
      setIsDisabled(value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.visibility, loadingState, disabledState, isMandatory, label, isValid]);

  if (loadingState) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ width: '100%', height }}>
        <center>
          <div className="spinner-border" role="status"></div>
        </center>
      </div>
    );
  }
  const _width = (labelWidth / 100) * 70; // Max width which label can go is 70% for better UX calculate width based on this value

  return (
    <>
      <div
        data-cy={`label-${String(componentName).toLowerCase()} `}
        id={String(componentName)}
        className={cx('radio-button,', 'd-flex', {
          [alignment === 'top' &&
          ((labelWidth != 0 && label?.length != 0) ||
            (labelAutoWidth && labelWidth == 0 && label && label?.length != 0))
            ? 'flex-column'
            : '']: true,
          'flex-row-reverse': direction === 'right' && alignment === 'side',
          'text-right': direction === 'right' && alignment === 'top',
          invisible: !visibility,
          visibility: visibility,
        })}
        style={{
          position: 'relative',
          width: '100%',
          paddingLeft: '0px',
        }}
      >
        <Label
          label={label}
          width={labelWidth}
          labelRef={labelRef}
          darkMode={darkMode}
          color={labelColor}
          defaultAlignment={alignment}
          direction={direction}
          auto={labelAutoWidth}
          isMandatory={isMandatory}
          _width={_width}
        />

        <div className="px-0 h-100 w-100" ref={radioBtnRef}>
          <div className="">
            {selectOptions.map((option, index) => {
              const isChecked = checkedValue == option.value;
              return (
                <label key={index} className="radio-button-container">
                  <span style={{ color: optionsTextColor }}>{option.label}</span>
                  <input
                    style={{
                      marginTop: '1px',
                      backgroundColor: checkedValue === option.value ? `${activeColor}` : 'white',
                    }}
                    checked={checkedValue == option.value}
                    type="radio"
                    value={option.value}
                    onChange={() => onSelect(option.value)}
                    disabled={option.isDisabled}
                  />
                  <span
                    className="checkmark"
                    style={{
                      backgroundColor: !isChecked && switchOffBackgroundColor,
                      '--selected-background-color': switchOnBackgroundColor,
                      '--selected-border-color': borderColor,
                      '--selected-handle-color': handleColor,
                      border: !isChecked && `1px solid ${borderColor}`,
                    }}
                  ></span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
      <div
        className={`${isValid ? '' : visibility ? 'd-flex' : 'none'}`}
        style={{
          color: errTextColor,
          justifyContent: direction === 'right' ? 'flex-start' : 'flex-end',
          fontSize: '11px',
          fontWeight: '400',
          lineHeight: '16px',
        }}
      >
        {!isValid && validationError}
      </div>
    </>
  );
};
