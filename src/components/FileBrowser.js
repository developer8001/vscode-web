import React from 'react';

const FileBrowser = ({ files, onFileSelect }) => {
  return (
    <div className="sidebar">
      <h3>EXPLORER</h3>
      <ul className="file-list">
        {files.map(file => (
          <li key={file.id} className="file-item" onClick={() => onFileSelect(file.name)}>
            <span>{file.isDirectory ? '📁' : '📄'}</span>
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileBrowser;
