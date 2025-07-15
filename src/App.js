import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

import ActivityBar from './components/ActivityBar';
import FileBrowser from './components/FileBrowser';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import StatusBar from './components/StatusBar';

// ⭐️ 중요: 실제 백엔드 서버의 IP 주소를 입력하세요.
const SERVER_IP = 'YOUR_SERVER_IP'; 

function App() {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState('');
  const [code, setCode] = useState('// Select a file to start coding or create a new one.');
  const [language, setLanguage] = useState('javascript');
  const [activeActivity, setActiveActivity] = useState('explorer');

  // 파일 목록 불러오기
  const fetchFiles = useCallback(async () => {
    try {
      const response = await axios.get(`http://${SERVER_IP}:3000/api/files`);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // 파일 선택 처리
  const handleFileSelect = async (fileName) => {
    try {
      const response = await axios.get(`http://${SERVER_IP}:3000/api/files/${fileName}`);
      setActiveFile(fileName);
      setCode(response.data);
      // 파일 확장자에 따라 언어 설정
      const extension = fileName.split('.').pop();
      switch (extension) {
        case 'js': setLanguage('javascript'); break;
        case 'html': setLanguage('html'); break;
        case 'css': setLanguage('css'); break;
        case 'json': setLanguage('json'); break;
        case 'md': setLanguage('markdown'); break;
        default: setLanguage('plaintext'); break;
      }
    } catch (error) {
      console.error(`Error fetching file ${fileName}:`, error);
    }
  };

  // 코드 변경 처리
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };
  
  // 파일 저장 처리 (단축키를 위해 콜백으로 구현)
  const handleSave = useCallback(async () => {
    if (!activeFile) return;
    try {
      await axios.post(`http://${SERVER_IP}:3000/api/files/${activeFile}`, code, {
        headers: { 'Content-Type': 'text/plain' }
      });
      console.log(`${activeFile} saved successfully.`);
      // 터미널에 저장 완료 메시지를 표시하는 기능은 Terminal 컴포넌트와의 연동이 필요
    } catch (error) {
      console.error(`Error saving file ${activeFile}:`, error);
    }
  }, [activeFile, code]);

  // Ctrl+S 또는 Cmd+S 단축키로 저장 기능
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);


  return (
    <div className="app">
      <main className="main-layout">
        <ActivityBar onActivityChange={setActiveActivity} activeActivity={activeActivity} />
        {activeActivity === 'explorer' && <FileBrowser files={files} onFileSelect={handleFileSelect} />}
        <div className="main-content">
          <Editor code={code} onCodeChange={handleCodeChange} language={language} />
          <div className="panel-pane">
            <Terminal serverIp={SERVER_IP} />
          </div>
        </div>
      </main>
      <StatusBar fileName={activeFile} />
    </div>
  );
}

export default App;
