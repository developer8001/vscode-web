const express = require('express');
const http = require('http');
const pty = require('node-pty');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
require('express-ws')(app, server);

const PORT = process.env.PORT || 3000;

// Render.com 배포 환경에 맞춘 CORS 및 Workspace 경로 설정
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const WORKSPACE_DIR = process.env.RENDER_DISK_MOUNT_PATH || path.join(__dirname, 'workspace');

// 미들웨어 설정
app.use(cors({ origin: frontendUrl }));
app.use(express.text());

// --- 파일 관리를 위한 REST API ---

// 파일 목록 가져오기
app.get('/api/files', async (req, res) => {
    try {
        await fs.mkdir(WORKSPACE_DIR, { recursive: true }); // workspace 폴더가 없으면 생성
        const items = await fs.readdir(WORKSPACE_DIR);
        const fileDetails = await Promise.all(items.map(async (item) => {
            const itemPath = path.join(WORKSPACE_DIR, item);
            const stats = await fs.stat(itemPath);
            return { name: item, isDirectory: stats.isDirectory(), id: item };
        }));
        res.json(fileDetails);
    } catch (error) {
        console.error('Error reading file list:', error);
        res.status(500).send('Error reading file list');
    }
});

// 특정 파일 내용 가져오기
app.get('/api/files/:filename', async (req, res) => {
    const safeFilePath = path.join(WORKSPACE_DIR, path.basename(req.params.filename));
    if (!safeFilePath.startsWith(WORKSPACE_DIR)) return res.status(403).send('Forbidden');
    try {
        const content = await fs.readFile(safeFilePath, 'utf-8');
        res.send(content);
    } catch (error) {
        res.status(404).send('File not found');
    }
});

// 파일 내용 저장하기
app.post('/api/files/:filename', async (req, res) => {
    const safeFilePath = path.join(WORKSPACE_DIR, path.basename(req.params.filename));
    if (!safeFilePath.startsWith(WORKSPACE_DIR)) return res.status(403).send('Forbidden');
    try {
        await fs.writeFile(safeFilePath, req.body, 'utf-8');
        res.status(200).send('File saved successfully');
    } catch (error) {
        res.status(500).send('Error saving file');
    }
});

// --- 터미널을 위한 WebSocket ---

app.ws('/ws/terminal', (ws, req) => {
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: WORKSPACE_DIR,
        env: process.env
    });

    ptyProcess.on('data', (data) => ws.send(data));
    ws.on('message', (msg) => ptyProcess.write(msg));
    ws.on('close', () => ptyProcess.kill());
});

// 서버 시작
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
