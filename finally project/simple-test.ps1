# Simple API Test Script

Write-Host "Testing Emotion Island Backend API" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test 1: User Registration
Write-Host "`n1. Testing User Registration" -ForegroundColor Yellow
$registerBody = @{
    phone = "13800138002"
    password = "123456"
    confirmPassword = "123456"
    verificationCode = "123456"
    nickname = "TestUser2"
} | ConvertTo-Json

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

# Test 2: User Login
Write-Host "`n2. Testing User Login" -ForegroundColor Yellow
$loginBody = @{
    phone = "13800138002"
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

Write-Host "`nTest completed!" -ForegroundColor Green
