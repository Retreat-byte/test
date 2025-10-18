@echo off
echo ========================================
echo 第一阶段API接口开发测试脚本（无认证）
echo ========================================
echo.

echo 注意：此脚本用于开发测试，实际使用时需要有效的JWT Token
echo.

echo 1. 测试Token验证接口（需要有效Token）...
echo curl -X GET "http://localhost:8080/api/users/verify" -H "Authorization: Bearer YOUR_TOKEN"
echo.

echo 2. 测试个人设置信息接口（需要有效Token）...
echo curl -X GET "http://localhost:8080/api/profile/info" -H "Authorization: Bearer YOUR_TOKEN"
echo.

echo 3. 测试个人设置更新接口（需要有效Token）...
echo curl -X PUT "http://localhost:8080/api/profile/update" -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"nickname\":\"测试用户\",\"gender\":\"female\",\"birthday\":\"1995-06-15\"}"
echo.

echo 4. 测试心情今日状态接口（需要有效Token）...
echo curl -X GET "http://localhost:8080/api/moods/today" -H "Authorization: Bearer YOUR_TOKEN"
echo.

echo 5. 测试成就列表接口（需要有效Token）...
echo curl -X GET "http://localhost:8080/api/profile/achievements" -H "Authorization: Bearer YOUR_TOKEN"
echo.

echo ========================================
echo 开发测试说明：
echo 1. 确保后端服务正在运行（端口8080）
echo 2. 使用有效的JWT Token替换YOUR_TOKEN
echo 3. 可以通过用户登录接口获取Token
echo ========================================
pause
