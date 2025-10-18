@echo off
echo ========================================
echo 获取用户Token测试脚本
echo ========================================
echo.

echo 1. 测试用户登录接口（获取Token）...
curl -X POST "http://localhost:8080/api/users/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138000\",\"password\":\"123456\"}"
echo.
echo.

echo 2. 测试用户注册接口...
curl -X POST "http://localhost:8080/api/users/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"13800138001\",\"password\":\"123456\",\"confirmPassword\":\"123456\",\"verificationCode\":\"123456\"}"
echo.
echo.

echo ========================================
echo 说明：
echo 1. 如果登录成功，会返回包含token的响应
echo 2. 复制返回的token用于其他接口测试
echo 3. 将token替换到test-phase1-apis.bat中的YOUR_REAL_TOKEN_HERE
echo ========================================
pause
