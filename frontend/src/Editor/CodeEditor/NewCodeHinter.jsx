import React from 'react';
import PropTypes from 'prop-types';
import { useResolveStore } from '@/_stores/resolverStore';
import { shallow } from 'zustand/shallow';
import './styles.scss';
import SingleLineCodeEditor from './SingleLineCodeEditor';
import MultiLineCodeEditor from './MultiLineCodeEditor';
import usePortal from '@/_hooks/use-portal';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

const CODE_EDITOR_TYPE = {
  fxEditor: SingleLineCodeEditor.EditorBridge,
  basic: SingleLineCodeEditor,
  multiline: MultiLineCodeEditor,
};

const NewCodeHinter = ({ type = 'basic', initialValue, componentName, ...restProps }) => {
  const { suggestions } = useResolveStore(
    (state) => ({
      suggestions: state.suggestions,
    }),
    shallow
  );

  const darkMode = localStorage.getItem('darkMode') === 'true';

  const [isOpen, setIsOpen] = React.useState(false);

  const handleTogglePopupExapand = () => {
    const changeOpen = (newOpen) => {
      setIsOpen(newOpen);
      if (typeof restProps?.popOverCallback === 'function') restProps?.popOverCallback(newOpen);
    };

    if (!isOpen) {
      changeOpen(true);
    }

    return new Promise((resolve) => {
      const element = document.getElementsByClassName('portal-container');
      if (element) {
        const checkPortalExits = element[0]?.classList.contains(componentName);

        if (checkPortalExits === false) {
          const parent = element[0].parentNode;
          parent.removeChild(element[0]);
        }

        changeOpen(false);
        resolve();
      }
    }).then(() => {
      changeOpen(true);
      forceUpdate();
    });
  };
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const RenderCodeEditor = CODE_EDITOR_TYPE[type];

  return (
    <RenderCodeEditor
      type={type}
      initialValue={initialValue}
      suggestions={suggestions}
      darkMode={darkMode}
      portalProps={{
        isOpen,
        setIsOpen,
        handleTogglePopupExapand,
        forceUpdate,
      }}
      componentName={componentName}
      {...restProps}
    />
  );
};

const Portal = ({ children, ...restProps }) => {
  const renderPortal = usePortal({ children, ...restProps });

  return <React.Fragment>{renderPortal}</React.Fragment>;
};

const PopupIcon = ({ callback, icon, tip, transformation = false }) => {
  const size = transformation ? 20 : 12;

  return (
    <div className="d-flex justify-content-end w-100 position-absolute" style={{ top: 0 }}>
      <OverlayTrigger
        trigger={['hover', 'focus']}
        placement="top"
        delay={{ show: 800, hide: 100 }}
        overlay={<Tooltip id="button-tooltip">{tip}</Tooltip>}
      >
        <img
          style={{ zIndex: 100000 }}
          className="svg-icon m-2 popup-btn"
          src={`assets/images/icons/${icon}.svg`}
          width={size}
          height={size}
          onClick={(e) => {
            e.stopPropagation();
            callback();
          }}
        />
      </OverlayTrigger>
    </div>
  );
};

NewCodeHinter.Portal = Portal;
NewCodeHinter.PopupIcon = PopupIcon;

NewCodeHinter.propTypes = {
  type: PropTypes.string.isRequired,
};

export default NewCodeHinter;