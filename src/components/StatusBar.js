import React from 'react';

const StatusBar = ({ fileName }) => {
  return (
    <div className="status-bar">
      <div>main</div>
      <div>{fileName || 'No file selected'}</div>
      <div>UTF-8</div>
    </div>
  );
};

export default StatusBar;
