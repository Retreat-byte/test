# 情绪岛后端部署指南

## 🚀 快速部署

### 方式一：Docker部署（推荐）

```bash
# 1. 进入项目目录
cd houduan

# 2. 启动Docker服务
./start-docker.sh

# 或者手动执行
docker-compose up --build -d
```

### 方式二：直接运行

```bash
# 1. 确保MySQL已启动
# 2. 执行启动脚本
./start.sh

# 或者手动执行
mvn clean package -DskipTests
java -jar target/houduan-0.0.1-SNAPSHOT.jar
```

## 📋 环境要求

- **Java**: JDK 17+
- **Maven**: 3.6+
- **MySQL**: 8.0+
- **Docker**: 20.0+ (可选)

## 🔧 配置说明

### 数据库配置
- 默认数据库：`emotion_island`
- 默认用户：`emotion_user`
- 默认密码：`emotion_pass`

### 端口配置
- 后端服务：`8080`
- MySQL：`3306`

### 环境变量
复制 `env.example` 为 `.env` 并修改相应配置：

```bash
cp env.example .env
```

## 🧪 测试部署

### 1. 检查服务状态
```bash
# Docker方式
docker-compose ps

# 直接运行方式
curl http://localhost:8080/actuator/health
```

### 2. 测试API接口
```bash
# 测试用户注册
curl -X POST http://localhost:8080/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'

# 测试用户登录
curl -X POST http://localhost:8080/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'
```

### 3. 前端对接测试
1. 启动前端项目
2. 修改前端API地址为：`http://localhost:8080/api`
3. 测试登录和各项功能

## 📊 监控和日志

### 查看日志
```bash
# Docker方式
docker-compose logs -f backend

# 直接运行方式
tail -f logs/application.log
```

### 健康检查
```bash
curl http://localhost:8080/actuator/health
```

## 🔒 生产环境配置

### 1. 修改默认密码
```bash
# 修改数据库密码
export SPRING_DATASOURCE_PASSWORD=your-secure-password

# 修改JWT密钥
export JWT_SECRET=your-super-secret-jwt-key
```

### 2. 配置域名
```bash
# 修改跨域配置
export CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### 3. 启用HTTPS
- 配置SSL证书
- 修改server配置

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL是否启动
   - 验证数据库配置
   - 检查网络连接

2. **端口被占用**
   - 修改端口配置
   - 停止占用端口的进程

3. **内存不足**
   - 调整JVM参数
   - 增加服务器内存

### 日志分析
```bash
# 查看错误日志
grep ERROR logs/application.log

# 查看SQL日志
grep "Hibernate" logs/application.log
```

## 📞 技术支持

如遇问题，请检查：
1. 日志文件：`logs/application.log`
2. 数据库连接状态
3. 网络端口占用情况

