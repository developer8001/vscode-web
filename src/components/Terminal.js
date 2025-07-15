import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import 'xterm/css/xterm.css';

const Terminal = ({ serverIp }) => {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!terminalRef.current || xtermRef.current) return;

        // Xterm.js 인스턴스 생성 및 설정
        const xterm = new XTerm({
            cursorBlink: true,
            theme: {
                background: '#1e1e1e',
                foreground: '#cccccc',
                cursor: '#ffffff',
            }
        });
        xtermRef.current = xterm;
        xterm.open(terminalRef.current);

        const wsUrl = `ws://${serverIp}:3000/ws/terminal`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            xterm.writeln('Welcome to Cloud IDE Terminal!');
            xterm.writeln('Successfully connected to server.');
        };

        // 서버로부터 메시지 수신 -> 터미널에 출력
        ws.onmessage = (event) => {
            xterm.write(event.data);
        };

        ws.onclose = () => {
            xterm.writeln('\n\n[Connection to server closed]');
        };

        ws.onerror = (err) => {
            xterm.writeln(`\n\n[WebSocket Error: ${err.message}]`);
        };
        
        // 터미널 입력 -> 서버로 전송
        const disposable = xterm.onData(data => {
            ws.send(data);
        });

        // 컴포넌트가 언마운트될 때 연결 종료
        return () => {
            disposable.dispose();
            ws.close();
            xterm.dispose();
        };
    }, [serverIp]);

    return <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />;
};

export default Terminal;
