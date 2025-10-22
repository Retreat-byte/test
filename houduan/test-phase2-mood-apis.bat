@echo off
echo ========================================
echo 第二阶段心情API测试脚本
echo ========================================
echo.

REM 设置基础URL
set BASE_URL=http://localhost:8080/api
set TOKEN=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzgwMDEzODAwMCIsImlhdCI6MTc2MDcwMzE0MiwiZXhwIjoxNzYwNzg5NTQyfQ.oV9VQ4fRvXinv9_ySM5XLZD5fhbYBtNNMh5OiQlszJlqVBdD76wUgkkAmUqsITYCZ7tBv6zewz-rE4F6-Lj9JA

echo 1. 测试获取心情历史记录 (GET /moods/history?days=30)
echo.
curl -X GET "%BASE_URL%/moods/history?days=30" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 2. 测试获取心情统计信息 (GET /moods/statistics)
echo.
curl -X GET "%BASE_URL%/moods/statistics" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 3. 测试获取心情统计信息（按日期范围）(GET /moods/statistics-range)
echo.
curl -X GET "%BASE_URL%/moods/statistics-range?startDate=2024-12-01&endDate=2024-12-18" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 4. 测试获取今日打卡状态 (GET /moods/today)
echo.
curl -X GET "%BASE_URL%/moods/today" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 5. 测试提交心情打卡 (POST /moods)
echo.
curl -X POST "%BASE_URL%/moods" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"mood\":\"开心\",\"value\":9,\"timestamp\":\"2024-12-18T20:30:00\",\"date\":\"2024-12-18\"}"
echo.
echo.

echo 6. 测试获取心情记录列表（分页）(GET /moods)
echo.
curl -X GET "%BASE_URL%/moods?page=0&size=5" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"
echo.
echo.

echo ========================================
echo 测试完成！
echo ========================================
pause
