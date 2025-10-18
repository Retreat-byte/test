# 🚀 情绪岛后端启动说明

## ✅ 前置条件检查

### 1. 检查Java版本
```bash
java -version
```
要求：**Java 17或更高版本**

### 2. 检查MySQL服务
```bash
# Windows - 检查MySQL是否运行
netstat -an | findstr :3306

# 或使用服务管理
services.msc
# 查找MySQL服务，确保状态为"正在运行"
```

### 3. 创建数据库
应用启动时会自动创建表结构，但需要先创建数据库：

**选项A：使用MySQL命令行**
```sql
mysql -u root -p
CREATE DATABASE IF NOT EXISTS emotion_island DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

**选项B：使用SQL脚本**
```bash
mysql -u root -p < src/main/resources/sql/schema.sql
```

**选项C：JPA自动创建**
```properties
# application.properties已配置
spring.jpa.hibernate.ddl-auto=update
# 应用启动时会自动创建表
```

## 🎯 启动方式（选择一种）

### 方式1：使用IDE（最推荐）✨

**IntelliJ IDEA:**
1. 打开项目
2. 找到 `src/main/java/com/xyq/houduan/HouduanApplication.java`
3. 右键点击文件 → `Run 'HouduanApplication'`
4. 等待控制台显示 "Started HouduanApplication"

**Eclipse/STS:**
1. 打开项目
2. 找到 `HouduanApplication.java`
3. 右键 → `Run As` → `Spring Boot App`

### 方式2：使用Maven Wrapper
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac  
./mvnw spring-boot:run
```

### 方式3：使用JAR包
```bash
# 1. 编译打包
mvnw.cmd clean package -DskipTests

# 2. 运行JAR
java -jar target/houduan-0.0.1-SNAPSHOT.jar
```

### 方式4：使用Maven (如果已安装)
```bash
mvn spring-boot:run
```

## ✅ 验证启动成功

### 1. 查看启动日志
看到以下内容表示启动成功：
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

Started HouduanApplication in X.XXX seconds
```

### 2. 测试健康检查接口
```bash
curl http://localhost:8080/actuator/health
```

预期响应：
```json
{"status":"UP"}
```

### 3. 测试API接口
```bash
# 测试用户注册
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"test\",\"password\":\"Test123456\",\"email\":\"test@test.com\",\"nickname\":\"测试\"}"
```

## ❌ 常见问题排查

### 问题1：端口8080已被占用
**症状**: 
```
Web server failed to start. Port 8080 was already in use.
```

**解决方案A - 修改端口**:
在 `application.properties` 中添加：
```properties
server.port=8081
```

**解决方案B - 找到并关闭占用进程**:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /f /pid <PID>
```

### 问题2：无法连接数据库
**症状**:
```
Communications link failure
The last packet sent successfully to the server was 0 milliseconds ago
```

**解决方案**:
1. 确认MySQL正在运行
2. 检查 `application.properties` 中的数据库配置：
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/emotion_island
spring.datasource.username=root
spring.datasource.password=123456
```
3. 确认数据库密码正确
4. 创建数据库 `emotion_island`

### 问题3：数据库不存在
**症状**:
```
Unknown database 'emotion_island'
```

**解决方案**:
```sql
mysql -u root -p
CREATE DATABASE emotion_island CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题4：Maven构建失败
**症状**:
```
Failed to execute goal... compilation failure
```

**解决方案**:
1. 清理Maven缓存：
```bash
mvnw.cmd clean
```

2. 重新下载依赖：
```bash
mvnw.cmd dependency:purge-local-repository
mvnw.cmd clean install
```

### 问题5：Java版本不兼容
**症状**:
```
Unsupported class file major version
```

**解决方案**:
确保使用Java 17或更高版本：
```bash
java -version
```

如果版本低于17，需要升级JDK。

## 🎯 推荐启动流程

```bash
# 步骤1：确认MySQL运行
netstat -an | findstr :3306

# 步骤2：创建数据库（首次运行）
# 使用MySQL命令行或SQL脚本

# 步骤3：使用IDE启动（最简单）
# 或使用 mvnw.cmd spring-boot:run

# 步骤4：验证启动
curl http://localhost:8080/actuator/health

# 步骤5：测试API
# 参考 API_TEST_GUIDE.md
```

## 📝 配置文件说明

### application.properties
```properties
# 服务器配置
server.port=8080

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/emotion_island
spring.datasource.username=root
spring.datasource.password=123456

# JPA配置
spring.jpa.hibernate.ddl-auto=update  # 自动创建/更新表结构

# JWT配置
jwt.secret=emotionIslandSecretKey2024
jwt.expiration=86400000  # 24小时

# 跨域配置
cors.allowed-origins=http://localhost:3000
```

## 🔧 开发环境配置

### IDEA设置
1. **项目SDK**: Java 17
2. **Maven设置**: 使用wrapper
3. **Spring Boot**: 启用DevTools实现热重载

### VS Code设置
需要安装扩展：
- Spring Boot Extension Pack
- Java Extension Pack

## 📱 前端对接

应用启动后，前端可以通过以下地址访问：
```
http://localhost:8080/api
```

详细API文档请参考：`API_TEST_GUIDE.md`

## 🎉 启动成功后可以：

1. ✅ 测试用户注册和登录
2. ✅ 测试心情打卡功能
3. ✅ 测试心理测评功能
4. ✅ 测试练习记录功能
5. ✅ 测试统计数据功能
6. ✅ 开始前端对接开发

---

**需要帮助？** 请查看：
- `API_TEST_GUIDE.md` - API测试指南
- `README.md` - 项目说明
- `README-DEPLOYMENT.md` - 部署说明

