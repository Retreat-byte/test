@echo off
echo ========================================
echo 第一阶段API接口测试脚本
echo ========================================
echo.

echo 1. 测试Token验证接口...
curl -X GET "http://localhost:8080/api/users/verify" ^
  -H "Authorization: Bearer YOUR_REAL_TOKEN_HERE" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 2. 测试个人设置信息接口...
curl -X GET "http://localhost:8080/api/profile/info" ^
  -H "Authorization: Bearer YOUR_REAL_TOKEN_HERE" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 3. 测试个人设置更新接口...
curl -X PUT "http://localhost:8080/api/profile/update" ^
  -H "Authorization: Bearer YOUR_REAL_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"nickname\":\"测试用户\",\"gender\":\"female\",\"birthday\":\"1995-06-15\"}"
echo.
echo.

echo 4. 测试心情今日状态接口...
curl -X GET "http://localhost:8080/api/moods/today" ^
  -H "Authorization: Bearer YOUR_REAL_TOKEN_HERE" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 5. 测试成就列表接口...
curl -X GET "http://localhost:8080/api/profile/achievements" ^
  -H "Authorization: Bearer YOUR_REAL_TOKEN_HERE" ^
  -H "Content-Type: application/json"
echo.
echo.

echo ========================================
echo 测试完成！
echo ========================================
pause
