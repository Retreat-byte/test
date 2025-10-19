@echo off
chcp 65001 >nul
echo ========================================
echo 测试呼吸练习修复验证
echo ========================================
echo.

echo 🔍 检查后端服务状态...
curl -s http://localhost:8081/actuator/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 后端服务未运行，请先启动后端服务
    echo 运行: cd houduan && mvn spring-boot:run
    pause
    exit /b 1
)
echo ✅ 后端服务运行正常

echo.
echo 🔍 检查前端服务状态...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 前端服务未运行，请先启动前端服务
    echo 运行: cd 前端代码 && python -m http.server 3000
    pause
    exit /b 1
)
echo ✅ 前端服务运行正常

echo.
echo 🧪 测试练习记录API...
echo 发送测试数据到后端...

curl -X POST http://localhost:8081/api/practices ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer test-token" ^
  -d "{\"type\":\"breathing\",\"name\":\"正念呼吸\",\"duration\":60,\"description\":\"测试呼吸练习\",\"tags\":\"测试,呼吸\"}" ^
  -w "\nHTTP状态码: %%{http_code}\n" ^
  -s

echo.
echo 📊 检查数据库中的练习记录...
echo 请在H2控制台中执行以下SQL查询:
echo.
echo SELECT * FROM PRACTICE_HISTORY ORDER BY CREATED_AT DESC LIMIT 5;
echo.
echo 如果看到新记录，说明修复成功！
echo.
echo 🎯 现在请:
echo 1. 打开浏览器访问: http://localhost:3000/tools.html
echo 2. 完成一次呼吸练习
echo 3. 查看控制台是否有保存成功的日志
echo 4. 检查个人中心练习次数是否更新
echo.
pause
