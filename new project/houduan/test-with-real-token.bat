@echo off
echo ========================================
echo 使用真实Token测试第一阶段API接口
echo ========================================
echo.

set TOKEN=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzgwMDEzODk5OSIsImlhdCI6MTc2MDcwMDkzNCwiZXhwIjoxNzYwNzg3MzM0fQ.-cGoHP_XfKupz7tI-yzxs98UldJ3PN-tL9vdPuwbL9l9h96lDlGF-lmW6eCULEhyylFuQfYV6xyB517IaRV-8g

echo 1. 测试Token验证接口...
curl -X GET "http://localhost:8080/api/users/verify" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 2. 测试个人设置信息接口...
curl -X GET "http://localhost:8080/api/profile/info" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 3. 测试个人设置更新接口...
curl -X PUT "http://localhost:8080/api/profile/update" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"nickname\":\"测试用户\",\"gender\":\"female\",\"birthday\":\"1995-06-15\"}"
echo.
echo.

echo 4. 测试心情今日状态接口...
curl -X GET "http://localhost:8080/api/moods/today" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 5. 测试成就列表接口...
curl -X GET "http://localhost:8080/api/profile/achievements" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

echo ========================================
echo 测试完成！
echo ========================================
pause
