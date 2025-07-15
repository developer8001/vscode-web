import React from 'react';
import MonacoEditor from '@monaco-editor/react';

const Editor = ({ code, onCodeChange, language }) => {
  return (
    <div className="editor-pane">
      <MonacoEditor
        height="100%"
        language={language}
        theme="vs-dark" // VS Code 다크 테마 적용
        value={code}
        onChange={onCodeChange}
        options={{
          selectOnLineNumbers: true,
          minimap: { enabled: true },
        }}
      />
    </div>
  );
};

export default Editor;
