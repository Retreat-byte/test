@echo off
echo 测试H2控制台访问...
echo.

echo 1. 检查服务状态
netstat -an | findstr :8081
echo.

echo 2. 测试H2控制台访问
curl -X GET "http://localhost:8081/h2-console" -s -o nul
if %errorlevel% equ 0 (
    echo ✓ H2控制台可以访问
) else (
    echo ✗ H2控制台无法访问
)
echo.

echo 3. 打开H2控制台
echo 请在浏览器中访问: http://localhost:8081/h2-console
echo.
echo H2控制台登录信息:
echo - JDBC URL: jdbc:h2:mem:emotion_island
echo - 用户名: sa
echo - 密码: (留空)
echo.

pause
