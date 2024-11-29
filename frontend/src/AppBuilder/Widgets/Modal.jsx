import React, { useRef, useState, useEffect } from 'react';
import { default as BootstrapModal } from 'react-bootstrap/Modal';
import { Container as SubContainer } from '@/AppBuilder/AppCanvas/Container';
import { ConfigHandle } from '@/AppBuilder/AppCanvas/ConfigHandle/ConfigHandle';
import { useGridStore } from '@/_stores/gridStore';
import useStore from '@/AppBuilder/_stores/store';
import { shallow } from 'zustand/shallow';
var tinycolor = require('tinycolor2');

export const Modal = function Modal({
  id,
  component,
  darkMode,
  properties,
  styles,
  setExposedVariable,
  setExposedVariables,
  fireEvent,
  dataCy,
  height,
}) {
  const [showModal, setShowModal] = useState(false);
  const {
    closeOnClickingOutside = false,
    hideOnEsc,
    hideCloseButton,
    hideTitleBar,
    loadingState,
    useDefaultButton,
    triggerButtonLabel,
    modalHeight,
  } = properties;
  const {
    headerBackgroundColor,
    headerTextColor,
    bodyBackgroundColor,
    disabledState,
    visibility,
    triggerButtonBackgroundColor,
    triggerButtonTextColor,
    boxShadow,
  } = styles;
  const parentRef = useRef(null);
  const controlBoxRef = useRef(null);
  const isInitialRender = useRef(true);
  const title = properties.title ?? '';
  const titleAlignment = properties.titleAlignment ?? 'left';
  const size = properties.size ?? 'lg';
  const [modalWidth, setModalWidth] = useState();
  const mode = useStore((state) => state.currentMode, shallow);

  /**** Start - Logic to reset the zIndex of modal control box ****/
  useEffect(() => {
    if (!showModal && mode === 'edit') {
      controlBoxRef.current?.classList?.remove('modal-moveable');
      controlBoxRef.current = null;
    }
    if (showModal) {
      useGridStore.getState().actions.setOpenModalWidgetId(id);
    } else {
      if (useGridStore.getState().openModalWidgetId === id) {
        useGridStore.getState().actions.setOpenModalWidgetId(null);
      }
    }
  }, [showModal, id, mode]);
  /**** End - Logic to reset the zIndex of modal control box ****/

  // Side effects for modal, which include dom manipulation to hide overflow when opening
  // And cleaning up dom when modal is closed

  const onShowSideEffects = () => {
    openModal();
    const canvasElement = document.querySelector('.page-container.canvas-container');
    const realCanvasEl = document.getElementsByClassName('real-canvas')[0];
    const modalContainer = realCanvasEl.querySelector('.modal');

    if (canvasElement && realCanvasEl && modalContainer) {
      const currentScroll = canvasElement.scrollTop;
      canvasElement.style.overflow = 'hidden';

      modalContainer.style.height = `${canvasElement.offsetHeight}px`;
      modalContainer.style.top = `${currentScroll}px`;
    }
  };

  const onHideSideEffects = () => {
    const canvasElement = document.querySelector('.page-container.canvas-container');
    const realCanvasEl = document.getElementsByClassName('real-canvas')[0];
    const modalContainer = realCanvasEl.querySelector('.modal');

    if (canvasElement && realCanvasEl && modalContainer) {
      canvasElement.style.overflow = 'auto';
      modalContainer.style.height = ``;
      modalContainer.style.top = ``;
    }

    hideModal();
  };

  useEffect(() => {
    const exposedVariables = {
      open: async function () {
        setExposedVariable('show', true);
        onShowSideEffects();
      },
      close: async function () {
        onHideSideEffects();
        setExposedVariable('show', false);
      },
    };
    setExposedVariables(exposedVariables);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    fireEvent(!showModal ? 'onClose' : 'onOpen');
    const inputRef = document?.getElementsByClassName('tj-text-input-widget')?.[0];
    inputRef?.blur();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      onShowSideEffects();
    } else {
      if (document.getElementsByClassName('modal-content')[0] == undefined) {
        onHideSideEffects();
      }
    }

    // Cleanup the effect
    return () => {
      if (document.getElementsByClassName('modal-content')[0] == undefined) {
        onHideSideEffects();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalHeight]);

  function hideModal() {
    setShowModal(false);
    setExposedVariable('show', false);
  }

  function openModal() {
    setShowModal(true);
    setExposedVariable('show', true);
  }

  const backwardCompatibilityCheck = height == '34' || modalHeight != undefined ? true : false;

  const customStyles = {
    modalBody: {
      height: backwardCompatibilityCheck ? modalHeight : height,
      backgroundColor:
        ['#fff', '#ffffffff'].includes(bodyBackgroundColor) && darkMode ? '#1F2837' : bodyBackgroundColor,
      overflowX: 'hidden',
      overflowY: 'auto',
    },
    modalHeader: {
      backgroundColor:
        ['#fff', '#ffffffff'].includes(headerBackgroundColor) && darkMode ? '#1F2837' : headerBackgroundColor,
      color: ['#000', '#000000', '#000000ff'].includes(headerTextColor) && darkMode ? '#fff' : headerTextColor,
    },
    buttonStyles: {
      backgroundColor: triggerButtonBackgroundColor,
      color: triggerButtonTextColor,
      width: '100%',
      display: visibility ? '' : 'none',
      '--tblr-btn-color-darker': tinycolor(triggerButtonBackgroundColor).darken(8).toString(),
      boxShadow,
    },
  };

  useEffect(() => {
    if (closeOnClickingOutside) {
      const handleClickOutside = (event) => {
        const modalRef = parentRef?.current?.parentElement?.parentElement?.parentElement;

        if (modalRef && modalRef === event.target) {
          onHideSideEffects();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeOnClickingOutside, parentRef]);

  useEffect(() => {
    if (showModal && parentRef.current) {
      setModalWidth(parentRef.current.offsetWidth);
    }
  }, [showModal, properties.size, id]);

  return (
    <div
      className="container d-flex align-items-center"
      data-disabled={disabledState}
      data-cy={dataCy}
      style={{ height }}
    >
      {useDefaultButton && (
        <button
          disabled={disabledState}
          className="jet-button btn btn-primary p-1 overflow-hidden"
          style={customStyles.buttonStyles}
          onClick={(event) => {
            /**** Start - Logic to reduce the zIndex of modal control box ****/
            controlBoxRef.current = document.querySelector(`.selected-component.sc-${id}`)?.parentElement;
            if (mode === 'edit' && controlBoxRef.current) {
              controlBoxRef.current.classList.add('modal-moveable');
            }
            /**** End - Logic to reduce the zIndex of modal control box ****/

            event.stopPropagation();
            setShowModal(true);
          }}
          data-cy={`${dataCy}-launch-button`}
        >
          {triggerButtonLabel ?? 'Show Modal'}
        </button>
      )}

      <Modal.Component
        show={showModal}
        contentClassName="modal-component"
        container={document.getElementsByClassName('real-canvas')[0]}
        size={size}
        keyboard={true}
        enforceFocus={false}
        animation={false}
        onShow={() => onShowSideEffects()}
        onHide={() => onHideSideEffects()}
        onEscapeKeyDown={() => hideOnEsc && onHideSideEffects()}
        id="modal-container"
        component-id={id}
        backdrop={'static'}
        scrollable={true}
        modalProps={{
          customStyles,
          parentRef,
          id,
          title,
          titleAlignment,
          hideTitleBar,
          hideCloseButton,
          hideModal,
          component,
          showConfigHandler: mode === 'edit',
        }}
      >
        {!loadingState ? (
          <>
            <SubContainer
              id={`${id}`}
              canvasHeight={modalHeight}
              styles={{ backgroundColor: customStyles.modalBody.backgroundColor, height: modalHeight }}
              canvasWidth={modalWidth}
              darkMode={darkMode}
            />
          </>
        ) : (
          <div className="p-2">
            <center>
              <div className="spinner-border mt-5" role="status"></div>
            </center>
          </div>
        )}
      </Modal.Component>
    </div>
  );
};

const Component = ({ children, ...restProps }) => {
  const { customStyles, parentRef, id, title, titleAlignment, hideTitleBar, hideCloseButton, showConfigHandler } =
    restProps['modalProps'];

  const setSelectedComponentAsModal = useStore((state) => state.setSelectedComponentAsModal, shallow);

  console.log('Show modal', restProps.show);
  return (
    <BootstrapModal {...restProps}>
      {showConfigHandler && (
        <ConfigHandle
          id={id}
          customClassName={hideTitleBar ? 'modalWidget-config-handle' : ''}
          showHandle={showConfigHandler}
          setSelectedComponentAsModal={setSelectedComponentAsModal}
          componentType="Modal"
          isModalOpen={true}
        />
      )}
      {!hideTitleBar && (
        <BootstrapModal.Header
          style={{ ...customStyles.modalHeader }}
          data-cy={`modal-header`}
          closeButton={!hideCloseButton}
        >
          <BootstrapModal.Title
            style={{
              textAlign: titleAlignment,
              width: '100%',
            }}
            id="contained-modal-title-vcenter"
            data-cy={`modal-title`}
          >
            {title}
          </BootstrapModal.Title>
        </BootstrapModal.Header>
      )}
      <BootstrapModal.Body style={{ ...customStyles.modalBody }} ref={parentRef} id={id} data-cy={`modal-body`}>
        {children}
      </BootstrapModal.Body>
    </BootstrapModal>
  );
};

Modal.Component = Component;
