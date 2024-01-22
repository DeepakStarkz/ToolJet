/* eslint-disable import/no-unresolved */
import React, { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
import { autocompletion } from '@codemirror/autocomplete';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { githubLight } from '@uiw/codemirror-theme-github';
import { generateHints } from './autocompleteExtensionConfig';
import ErrorBoundary from '../ErrorBoundary';
import NewCodeHinter from './NewCodeHinter';
const langSupport = Object.freeze({
  javascript: javascript(),
  python: python(),
  sql: sql(),
  jsx: javascript({ jsx: true }),
});

const MultiLineCodeEditor = (props) => {
  const {
    darkMode,
    height,
    initialValue,
    lang,
    className,
    onChange,
    componentName,
    cyLabel,
    currentState,
    lineNumbers,
    placeholder,
    hideSuggestion,
    suggestions: hints,
    portalProps,
  } = props;

  const [currentValue, setCurrentValue] = React.useState(() => initialValue);
  const diffOfCurrentValue = React.useRef(null);

  const handleChange = React.useCallback((val) => {
    setCurrentValue(val);

    const diff = val.length - currentValue.length;

    if (diff > 0) {
      diffOfCurrentValue.current = val.slice(-diff);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnBlur = React.useCallback(() => {
    onChange(currentValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  useEffect(() => {
    setCurrentValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const heightInPx = typeof height === 'string' && height?.includes('px') ? height : `${height}px`;

  const theme = darkMode ? okaidia : githubLight;
  const langExtention = langSupport[lang] ?? null;

  const setupConfig = {
    lineNumbers: lineNumbers ?? true,
    syntaxHighlighting: true,
    bracketMatching: true,
    foldGutter: true,
    highlightActiveLine: false,
    autocompletion: hideSuggestion ?? true,
  };

  function autoCompleteExtensionConfig(context) {
    const lasttWord = context.state.doc.text
      .map((element) => element.trim())
      .join(' ')
      .split(' ')
      .filter((element) => {
        if (element === '' || element === ' ') {
          return false;
        }
        return true;
      });

    const currentWord = lasttWord[lasttWord.length - 1];

    let JSLangHints = [];
    if (lang === 'javascript') {
      JSLangHints = Object.keys(hints['jsHints'])
        .map((key) => {
          return hints['jsHints'][key]['methods'].map((hint) => ({
            hint: hint,
            type: 'js_method',
          }));
        })
        .flat();

      JSLangHints = JSLangHints.filter((cm) => {
        let lastWordAfterDot = currentWord.split('.');

        lastWordAfterDot = lastWordAfterDot[lastWordAfterDot.length - 1];

        if (cm.hint.includes(lastWordAfterDot)) return true;
      });
    }

    const appHints = hints['appHints'];

    let autoSuggestionList = appHints.filter((suggestion) => {
      if (currentWord.length === 0) return true;

      return suggestion.hint.includes(currentWord);
    });

    const suggestions = generateHints([...JSLangHints, ...autoSuggestionList]).map((hint) => {
      delete hint['apply'];

      hint.apply = (view, completion, from, to) => {
        const doc = view.state.doc;

        const start = doc.lineAt(from).text.slice(0, from - 1);

        const word = start.split(' ').pop();

        const index = start.lastIndexOf(word);

        const changesStartIndexFromDocLine = doc.lineAt(from).from;

        const changeIndex = changesStartIndexFromDocLine > 0 ? changesStartIndexFromDocLine + index : index;
        const endIndex = changesStartIndexFromDocLine > 0 ? to : to;

        view.dispatch({
          changes: {
            from: changeIndex,
            to: endIndex,
            insert: completion.label,
          },
        });
      };
      return hint;
    });

    return {
      from: context.pos,
      options: [...suggestions],
    };
  }

  const autoCompleteConfig = autocompletion({
    override: [autoCompleteExtensionConfig],
    compareCompletions: (a, b) => {
      return a.label < b.label ? -1 : 1;
    },
    aboveCursor: false,
    defaultKeymap: true,
  });

  const { handleTogglePopupExapand, isOpen, setIsOpen, forceUpdate } = portalProps;

  return (
    <div className="code-hinter-wrapper position-relative" style={{ width: '100%' }}>
      <div className={`${className} ${darkMode && 'cm-codehinter-dark-themed'}`} cyLabel={cyLabel}>
        <NewCodeHinter.PopupIcon
          callback={handleTogglePopupExapand}
          icon="portal-open"
          tip="Pop out code editor into a new window"
          transformation={componentName === 'transformation'}
        />
        <NewCodeHinter.Portal
          isCopilotEnabled={false}
          isOpen={isOpen}
          callback={setIsOpen}
          componentName={componentName}
          key={componentName}
          forceUpdate={forceUpdate}
          optionalProps={{ styles: { height: 300 }, cls: '' }}
          darkMode={darkMode}
          selectors={{ className: 'preview-block-portal' }}
          dragResizePortal={true}
          callgpt={null}
        >
          <ErrorBoundary>
            <div className="codehinter-container w-100 ">
              <CodeMirror
                value={currentValue}
                placeholder={placeholder}
                height={'100%'}
                minHeight={heightInPx}
                maxHeight={heightInPx}
                width="100%"
                theme={theme}
                extensions={[langExtention, autoCompleteConfig]}
                onChange={handleChange}
                onBlur={handleOnBlur}
                basicSetup={setupConfig}
                style={{
                  overflowY: 'auto',
                }}
              />
            </div>
          </ErrorBoundary>
        </NewCodeHinter.Portal>
      </div>
    </div>
  );
};

export default MultiLineCodeEditor;