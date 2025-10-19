@echo off
chcp 65001 >nul
echo ========================================
echo 测试API端口修复
echo ========================================
echo.

echo 🔍 检查后端服务状态...
curl -s http://localhost:8081/api/users/register -X POST -H "Content-Type: application/json" -d "{\"phone\":\"test\",\"password\":\"test\"}" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 后端服务未运行，请先启动后端服务
    echo 运行: cd houduan && mvn spring-boot:run
    pause
    exit /b 1
)
echo ✅ 后端服务运行正常 (端口8081)

echo.
echo 🔍 检查前端服务状态...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 前端服务未运行，请先启动前端服务
    echo 运行: cd 前端代码 && python -m http.server 3000
    pause
    exit /b 1
)
echo ✅ 前端服务运行正常 (端口3000)

echo.
echo 🧪 测试步骤:
echo 1. 打开浏览器访问: http://localhost:3000/tools.html
echo 2. 点击右上角"登录"按钮
echo 3. 使用测试账号登录:
echo    - 手机号: 13800138000
echo    - 密码: 123456
echo 4. 完成一次呼吸练习
echo 5. 查看控制台应该显示:
echo    ✅ 练习记录已保存到服务器
echo    ✅ 不再出现404错误
echo.
echo 📊 检查数据库记录:
echo 访问: http://localhost:8081/h2-console
echo JDBC URL: jdbc:h2:mem:testdb
echo 用户名: sa
echo 密码: (空)
echo 执行SQL: SELECT * FROM PRACTICE_HISTORY ORDER BY CREATED_AT DESC LIMIT 5;
echo.
echo 🎯 修复内容:
echo ✅ 修复了API端点从 localhost:8080 到 localhost:8081
echo ✅ 修复了token获取逻辑
echo ✅ 现在应该能正常保存到数据库
echo.
pause
