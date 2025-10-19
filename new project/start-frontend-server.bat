@echo off
chcp 65001 >nul
echo 启动前端HTTP服务器...
echo 前端地址: http://localhost:8080
echo 按Ctrl+C停止服务器
echo.

cd "前端代码"

REM 尝试使用Node.js的http-server
D:\nodejs\node-v22.20.0-win-x64\node.exe --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用Node.js启动服务器...
    D:\nodejs\node-v22.20.0-win-x64\node.exe -e "const http = require('http'); const fs = require('fs'); const path = require('path'); const mimeTypes = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'}; const server = http.createServer((req, res) => { let filePath = '.' + req.url; if (filePath === './') filePath = './index.html'; const extname = String(path.extname(filePath)).toLowerCase(); const contentType = mimeTypes[extname] || 'application/octet-stream'; fs.readFile(filePath, (error, content) => { if (error) { if (error.code === 'ENOENT') { res.writeHead(404, {'Content-Type': 'text/html'}); res.end('<h1>404 Not Found</h1>'); } else { res.writeHead(500); res.end('Server Error: ' + error.code); } } else { res.writeHead(200, {'Content-Type': contentType}); res.end(content, 'utf-8'); } }); }); server.listen(8080, () => console.log('Server running at http://localhost:8080/'));"
) else (
    echo Node.js不可用，尝试使用Python...
    python -m http.server 8080
)
