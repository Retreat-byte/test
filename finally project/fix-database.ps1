# 修复数据库性别字段的脚本

Write-Host "Fixing database gender field..." -ForegroundColor Yellow

# 尝试通过应用接口来修复
$fixBody = @{
    phone = "13800138002"
    password = "123456"
} | ConvertTo-Json

# 先尝试登录，如果失败，说明需要修复数据库
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/users/login" -Method Post -Body $fixBody -ContentType "application/json"
    Write-Host "Login successful, no fix needed" -ForegroundColor Green
} catch {
    Write-Host "Login failed, need to fix database" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # 这里我们需要手动修复数据库
    Write-Host "Please run the following SQL commands in MySQL:" -ForegroundColor Yellow
    Write-Host "USE emotion_island;" -ForegroundColor Cyan
    Write-Host "UPDATE users SET gender = 'FEMALE' WHERE gender = 'female';" -ForegroundColor Cyan
    Write-Host "UPDATE users SET gender = 'MALE' WHERE gender = 'male';" -ForegroundColor Cyan
    Write-Host "UPDATE users SET gender = 'OTHER' WHERE gender = 'other';" -ForegroundColor Cyan
}
