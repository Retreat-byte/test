@echo off
chcp 65001 >nul
title 查看后端服务器信息

echo ========================================
echo        后端服务器信息
echo ========================================
echo.

echo 🖥️  正在获取本机IP地址...
echo.

REM 获取IPv4地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    set ip=!ip: =!
    echo ✅ 本机IP地址: !ip!
    echo.
)

echo ========================================
echo 📡 后端API配置信息
echo ========================================
echo 服务端口: 8081
echo 数据库端口: 3306
echo.
echo 🌐 前端开发者需要配置的地址：
echo.

REM 显示完整的API地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    set ip=!ip: =!
    echo    http://!ip!:8081/api
)

echo.
echo ========================================
echo.

echo 📋 前端配置步骤：
echo.
echo 1. 将上面的 API 地址发给前端开发者
echo.
echo 2. 前端修改 config.js 文件中的 baseURL：
echo    baseURL: 'http://你的IP:8081/api',
echo.
echo 3. 或者前端运行 "配置后端地址.bat" 自动配置
echo.
echo ========================================
echo.

echo 🔍 检查后端服务状态...
echo.

REM 检查8081端口是否被占用（判断服务是否启动）
netstat -ano | findstr :8081 >nul
if %errorlevel%==0 (
    echo ✅ 后端服务已启动（端口8081正在使用）
) else (
    echo ⚠️  后端服务未启动（端口8081未被占用）
    echo.
    echo 💡 请先启动后端服务：
    echo    方式1: 在IDEA中运行 HouduanApplication.java
    echo    方式2: 运行 mvn spring-boot:run
)

echo.
echo ========================================
echo.

echo 🔥 防火墙设置提醒：
echo.
echo 如果前端在其他电脑无法访问，请检查防火墙：
echo.
echo Windows防火墙：
echo   1. 控制面板 → Windows Defender 防火墙
echo   2. 高级设置 → 入站规则 → 新建规则
echo   3. 端口 → TCP → 8081 → 允许连接
echo.
echo ========================================
echo.

pause

