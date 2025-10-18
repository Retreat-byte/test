# 情绪岛后端API测试脚本

Write-Host "🧪 开始测试情绪岛后端API接口" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# 测试用户注册
Write-Host "`n1️⃣ 测试用户注册接口" -ForegroundColor Yellow
$registerBody = @{
    phone = "13800138002"
    password = "123456"
    confirmPassword = "123456"
    verificationCode = "123456"
    nickname = "测试用户2"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/users/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ 注册成功:" -ForegroundColor Green
    $registerResponse | ConvertTo-Json -Depth 3
    $userId = $registerResponse.data.id
} catch {
    Write-Host "❌ 注册失败:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应体:" $responseBody -ForegroundColor Red
    }
}

# 测试用户登录
Write-Host "`n2️⃣ 测试用户登录接口" -ForegroundColor Yellow
$loginBody = @{
    phone = "13800138002"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/users/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ 登录成功:" -ForegroundColor Green
    $loginResponse | ConvertTo-Json -Depth 3
    $token = $loginResponse.data.token
    Write-Host "Token: $token" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 登录失败:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应体:" $responseBody -ForegroundColor Red
    }
}

# 设置认证头
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 测试心情打卡记录
Write-Host "`n3️⃣ 测试心情打卡记录接口" -ForegroundColor Yellow
$moodBody = @{
    moodType = "happy"
    intensity = 8
    description = "今天心情很好，测试心情打卡功能"
    tags = @("happy", "test")
} | ConvertTo-Json

try {
    $moodResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/moods" -Method Post -Body $moodBody -Headers $headers
    Write-Host "✅ 心情打卡成功:" -ForegroundColor Green
    $moodResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ 心情打卡失败:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应体:" $responseBody -ForegroundColor Red
    }
}

# 测试心理测评系统
Write-Host "`n4️⃣ 测试心理测评系统接口" -ForegroundColor Yellow
$assessmentBody = @{
    assessmentType = "anxiety"
    answers = @(
        @{ questionId = 1; answer = 3 },
        @{ questionId = 2; answer = 2 },
        @{ questionId = 3; answer = 4 }
    )
} | ConvertTo-Json

try {
    $assessmentResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/assessments" -Method Post -Body $assessmentBody -Headers $headers
    Write-Host "✅ 心理测评成功:" -ForegroundColor Green
    $assessmentResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ 心理测评失败:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应体:" $responseBody -ForegroundColor Red
    }
}

# 测试练习记录管理
Write-Host "`n5️⃣ 测试练习记录管理接口" -ForegroundColor Yellow
$practiceBody = @{
    practiceType = "breathing"
    duration = 300
    description = "测试呼吸练习"
    effectiveness = 8
} | ConvertTo-Json

try {
    $practiceResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/practices" -Method Post -Body $practiceBody -Headers $headers
    Write-Host "✅ 练习记录成功:" -ForegroundColor Green
    $practiceResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ 练习记录失败:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应体:" $responseBody -ForegroundColor Red
    }
}

# 测试数据统计分析
Write-Host "`n6️⃣ 测试数据统计分析接口" -ForegroundColor Yellow

try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/statistics/mood" -Method Get -Headers $headers
    Write-Host "✅ 心情统计成功:" -ForegroundColor Green
    $statsResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ 心情统计失败:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "响应体:" $responseBody -ForegroundColor Red
    }
}

Write-Host "`nAPI test completed!" -ForegroundColor Green
