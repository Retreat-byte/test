@echo off
echo ========================================
echo 完整的API测试流程
echo ========================================
echo.

echo 步骤1: 注册新用户...
curl -X POST "http://localhost:8080/api/users/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138999\",\"password\":\"123456\",\"confirmPassword\":\"123456\",\"verificationCode\":\"123456\"}"
echo.
echo.

echo 步骤2: 使用新用户登录获取Token...
curl -X POST "http://localhost:8080/api/users/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138999\",\"password\":\"123456\"}"
echo.
echo.

echo 步骤3: 使用获取到的Token测试其他接口...
echo 请复制上面登录响应中的token，然后手动测试以下接口：
echo.
echo curl -X GET "http://localhost:8080/api/users/verify" -H "Authorization: Bearer YOUR_TOKEN"
echo.
echo curl -X GET "http://localhost:8080/api/profile/info" -H "Authorization: Bearer YOUR_TOKEN"
echo.
echo curl -X GET "http://localhost:8080/api/moods/today" -H "Authorization: Bearer YOUR_TOKEN"
echo.
echo curl -X GET "http://localhost:8080/api/profile/achievements" -H "Authorization: Bearer YOUR_TOKEN"
echo.

echo ========================================
echo 测试完成！
echo ========================================
pause
