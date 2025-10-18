# 情绪岛后端API测试指南

## 🚀 快速启动

### 方式1：使用IDE (推荐)
1. 用IntelliJ IDEA或Eclipse打开项目
2. 找到 `HouduanApplication.java`
3. 右键 -> Run 'HouduanApplication'
4. 等待启动完成（看到"Started HouduanApplication"）

### 方式2：使用Maven命令
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

### 方式3：使用JAR包
```bash
# 先编译
mvnw.cmd clean package -DskipTests

# 再运行
java -jar target/houduan-0.0.1-SNAPSHOT.jar
```

## ✅ 验证应用已启动

打开浏览器或使用curl访问：
```bash
http://localhost:8080/actuator/health
```

预期响应：
```json
{"status":"UP"}
```

## 📋 API测试用例

### 1. 用户注册
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser\",
    \"password\": \"Test123456\",
    \"email\": \"test@example.com\",
    \"nickname\": \"测试用户\"
  }"
```

预期响应：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "email": "test@example.com"
    }
  }
}
```

### 2. 用户登录
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser\",
    \"password\": \"Test123456\"
  }"
```

预期响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户"
    }
  }
}
```

### 3. 心情打卡（需要认证）
```bash
# 先获取token（从登录响应中）
TOKEN="your_token_here"

curl -X POST http://localhost:8080/api/mood/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"moodType\": \"HAPPY\",
    \"intensity\": 8,
    \"content\": \"今天心情很好\",
    \"tags\": [\"开心\", \"阳光\"]
  }"
```

预期响应：
```json
{
  "code": 200,
  "message": "打卡成功",
  "data": {
    "id": 1,
    "moodType": "HAPPY",
    "intensity": 8,
    "content": "今天心情很好",
    "tags": ["开心", "阳光"],
    "createdAt": "2025-10-17T12:00:00"
  }
}
```

### 4. 获取心情记录列表
```bash
curl -X GET "http://localhost:8080/api/mood/records?page=0&size=10" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 5. 心理测评列表
```bash
curl -X GET http://localhost:8080/api/assessment/list \
  -H "Authorization: Bearer ${TOKEN}"
```

### 6. 开始心理测评
```bash
curl -X POST "http://localhost:8080/api/assessment/start?assessmentId=1" \
  -H "Authorization: Bearer ${TOKEN}"
```

### 7. 提交心理测评答案
```bash
curl -X POST http://localhost:8080/api/assessment/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"assessmentHistoryId\": 1,
    \"answers\": [
      {\"questionId\": 1, \"optionId\": 2, \"answer\": \"经常\"},
      {\"questionId\": 2, \"optionId\": 1, \"answer\": \"偶尔\"}
    ]
  }"
```

### 8. 创建练习记录
```bash
curl -X POST http://localhost:8080/api/practice/record \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"practiceType\": \"BREATHING\",
    \"duration\": 600,
    \"completionRate\": 100,
    \"moodBefore\": 5,
    \"moodAfter\": 8,
    \"note\": \"深呼吸练习，感觉放松\"
  }"
```

### 9. 获取统计数据
```bash
# 心情统计
curl -X GET "http://localhost:8080/api/statistics/mood?days=7" \
  -H "Authorization: Bearer ${TOKEN}"

# 练习统计
curl -X GET "http://localhost:8080/api/statistics/practice?days=7" \
  -H "Authorization: Bearer ${TOKEN}"

# 综合统计
curl -X GET http://localhost:8080/api/statistics/summary \
  -H "Authorization: Bearer ${TOKEN}"
```

## 🔍 常见问题

### 问题1：连接被拒绝 (Connection refused)
**原因**: 应用未成功启动
**解决**: 
1. 检查MySQL是否运行在3306端口
2. 检查数据库密码是否正确（默认root/123456）
3. 查看启动日志是否有错误

### 问题2：401 Unauthorized
**原因**: Token未提供或已过期
**解决**: 重新登录获取新token

### 问题3：数据库连接失败
**原因**: MySQL未启动或配置错误
**解决**:
1. 启动MySQL服务
2. 检查 `application.properties` 中的数据库配置
3. 确保数据库 `emotion_island` 已创建

### 问题4：端口已被占用
**原因**: 8080端口被其他应用占用
**解决**:
```bash
# 查找占用8080端口的进程
netstat -ano | findstr :8080

# 修改端口（在application.properties中）
server.port=8081
```

## 📝 使用Postman测试

1. 导入以下环境变量：
   - `base_url`: `http://localhost:8080`
   - `token`: 从登录接口获取

2. 测试流程：
   - 注册用户 → 获取token
   - 使用token访问需要认证的接口
   - 测试各个功能模块

## 🎯 前端对接说明

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### 请求拦截器示例 (Axios)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  response => {
    const { data } = response;
    if (data.code === 200) {
      return data.data;
    } else {
      return Promise.reject(data.message);
    }
  },
  error => {
    if (error.response?.status === 401) {
      // 清除token，跳转登录
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 使用示例
```javascript
// 用户注册
export const register = (userData) => {
  return api.post('/auth/register', userData);
};

// 用户登录
export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

// 心情打卡
export const moodCheckin = (moodData) => {
  return api.post('/mood/checkin', moodData);
};

// 获取心情记录
export const getMoodRecords = (page = 0, size = 10) => {
  return api.get(`/mood/records?page=${page}&size=${size}`);
};
```

## 📊 统一响应格式

所有API返回格式：
```json
{
  "code": 200,           // 状态码：200成功，其他失败
  "message": "操作成功",  // 提示信息
  "data": {},            // 响应数据
  "timestamp": "2025-10-17T12:00:00"
}
```

## 🔐 认证说明

1. 注册/登录后会返回JWT token
2. 后续请求需要在Header中携带：
   ```
   Authorization: Bearer {token}
   ```
3. Token有效期：24小时
4. Token过期后需要重新登录

## 🎨 心情类型枚举

```java
HAPPY("开心"),
SAD("难过"),
ANGRY("生气"),
ANXIOUS("焦虑"),
CALM("平静"),
EXCITED("兴奋"),
TIRED("疲惫"),
CONFUSED("困惑")
```

## 🏋️ 练习类型枚举

```java
BREATHING("呼吸练习"),
MEDITATION("冥想"),
MUSIC("音乐疗愈"),
READING("阅读"),
EXERCISE("运动"),
WRITING("写作"),
PAINTING("绘画"),
OTHER("其他")
```

## 📱 前端页面路由建议

```
/login          - 登录页
/register       - 注册页
/home           - 首页（心情打卡）
/mood/records   - 心情记录
/assessment     - 心理测评
/practice       - 练习训练
/statistics     - 数据统计
/profile        - 个人中心
```

---

**祝测试顺利！** 🎉


