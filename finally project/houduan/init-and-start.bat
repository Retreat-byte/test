@echo off
chcp 65001 >nul
echo ========================================
echo 情绪岛后端 - 初始化并启动
echo ========================================
echo.

echo [步骤1] 检查MySQL是否运行...
netstat -an | findstr "LISTENING" | findstr ":3306" >nul
if %errorlevel% neq 0 (
    echo ✗ MySQL未运行，请先启动MySQL服务
    pause
    exit /b 1
)
echo ✓ MySQL正在运行
echo.

echo [步骤2] 创建数据库（使用SQL脚本）...
echo 请确保MySQL root密码为: 123456
echo 如果密码不同，请修改 application.properties
echo.

echo [步骤3] 编译应用...
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 (
    echo ✗ 编译失败
    pause
    exit /b 1
)
echo ✓ 编译成功
echo.

echo [步骤4] 启动应用...
echo 应用将在8080端口运行
echo 按Ctrl+C可以停止应用
echo.
call mvnw.cmd spring-boot:run


