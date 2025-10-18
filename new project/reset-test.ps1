# 重置测试脚本

Write-Host "Resetting test data..." -ForegroundColor Yellow

# 使用不同的手机号重新注册
$registerBody = @{
    phone = "13800138003"
    password = "123456"
    confirmPassword = "123456"
    verificationCode = "123456"
    nickname = "TestUser3"
} | ConvertTo-Json

Write-Host "`n1. Registering new user with phone 13800138003" -ForegroundColor Yellow
try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/users/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Registration SUCCESS:" -ForegroundColor Green
    $registerResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Registration FAILED:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" $responseBody -ForegroundColor Red
    }
}

# 测试登录
Write-Host "`n2. Testing login with new user" -ForegroundColor Yellow
$loginBody = @{
    phone = "13800138003"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/users/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Login SUCCESS:" -ForegroundColor Green
    $loginResponse | ConvertTo-Json -Depth 3
    $token = $loginResponse.data.token
    Write-Host "Token: $token" -ForegroundColor Cyan
} catch {
    Write-Host "Login FAILED:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" $responseBody -ForegroundColor Red
    }
}

Write-Host "`nReset test completed!" -ForegroundColor Green
