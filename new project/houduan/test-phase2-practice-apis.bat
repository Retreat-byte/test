@echo off
chcp 65001 >nul
echo ========================================
echo 第二阶段练习记录API测试脚本
echo ========================================
echo.

set TOKEN=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzgwMDEzODAwMCIsImlhdCI6MTc2MDcwMzE0MiwiZXhwIjoxNzYwNzg5NTQyfQ.oV9VQ4fRvXinv9_ySM5XLZD5fhbYBtNNMh5OiQlszJlqVBdD76wUgkkAmUqsITYCZ7tBv6zewz-rE4F6-Lj9JA

echo 1. 测试提交练习记录 (POST /practice/record)
echo.
curl -X POST "http://localhost:8080/practice/record" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"breathing\",\"name\":\"正念呼吸\",\"duration\":300,\"audio\":null,\"timestamp\":\"2025-10-17T10:30:00\",\"date\":\"2025-10-17\"}"
echo.
echo.

echo 2. 测试提交冥想练习记录 (POST /practice/record)
echo.
curl -X POST "http://localhost:8080/practice/record" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"meditation\",\"name\":\"晨间冥想\",\"duration\":600,\"audio\":\"music/morning.mp3\",\"timestamp\":\"2025-10-17T07:00:00\",\"date\":\"2025-10-17\"}"
echo.
echo.

echo 3. 测试获取练习历史记录 (GET /practice/history?days=30)
echo.
curl -X GET "http://localhost:8080/practice/history?days=30" ^
  -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo 4. 测试获取练习历史记录（按类型筛选）(GET /practice/history?days=30&type=breathing)
echo.
curl -X GET "http://localhost:8080/practice/history?days=30&type=breathing" ^
  -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo 5. 测试获取练习历史记录（限制数量）(GET /practice/history?days=30&limit=5)
echo.
curl -X GET "http://localhost:8080/practice/history?days=30&limit=5" ^
  -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo 6. 测试获取练习统计数据 (GET /practice/statistics)
echo.
curl -X GET "http://localhost:8080/practice/statistics" ^
  -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo 7. 测试提交更多练习记录用于统计
echo.
curl -X POST "http://localhost:8080/practice/record" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"breathing\",\"name\":\"深呼吸练习\",\"duration\":180,\"audio\":null,\"timestamp\":\"2025-10-16T15:30:00\",\"date\":\"2025-10-16\"}"
echo.
echo.

curl -X POST "http://localhost:8080/practice/record" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"meditation\",\"name\":\"森林冥想\",\"duration\":900,\"audio\":\"music/forest.mp3\",\"timestamp\":\"2025-10-15T14:30:00\",\"date\":\"2025-10-15\"}"
echo.
echo.

echo 8. 再次测试获取练习统计数据 (GET /practice/statistics)
echo.
curl -X GET "http://localhost:8080/practice/statistics" ^
  -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo 9. 测试获取练习历史记录（最近7天）(GET /practice/history?days=7)
echo.
curl -X GET "http://localhost:8080/practice/history?days=7" ^
  -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo 10. 测试删除练习记录 (DELETE /practice/{practiceId})
echo 注意：需要先获取一个练习记录ID
echo.
curl -X GET "http://localhost:8080/practice/history?days=30&limit=1" ^
  -H "Authorization: Bearer %TOKEN%"
echo.
echo.

echo ========================================
echo 测试完成！
echo ========================================
pause
