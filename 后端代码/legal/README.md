# 法智顾问 - 后端项目

## 项目简介

法智顾问是一个基于Spring Boot的法律咨询服务平台后端系统，提供AI咨询、法律工具、法规查询等功能。

## 技术栈

- **框架**: Spring Boot 3.5.7
- **数据库**: MySQL 8.0+
- **ORM**: Spring Data JPA
- **安全**: Spring Security + JWT
- **构建工具**: Maven
- **Java版本**: 17

## 项目结构

```
legal/
├── src/
│   ├── main/
│   │   ├── java/com/xyq/legal/
│   │   │   ├── common/          # 通用类（Result、PageResult等）
│   │   │   ├── config/          # 配置类（Security、CORS等）
│   │   │   ├── controller/      # 控制器层
│   │   │   ├── dto/             # 数据传输对象
│   │   │   ├── entity/          # 实体类
│   │   │   │   └── base/        # 基础实体类
│   │   │   ├── interceptor/     # 拦截器
│   │   │   ├── repository/      # 数据访问层
│   │   │   ├── service/         # 业务逻辑层
│   │   │   └── util/            # 工具类
│   │   └── resources/
│   │       ├── application.properties  # 应用配置
│   │       └── db/
│   │           └── schema.sql    # 数据库建表脚本
│   └── test/                    # 测试代码
├── pom.xml                      # Maven依赖配置
└── README.md                    # 项目说明文档
```

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库配置

1. 创建数据库：
```sql
CREATE DATABASE legal_assistant 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;
```

2. 执行建表脚本：
```bash
mysql -u root -p legal_assistant < src/main/resources/db/schema.sql
```

3. 修改数据库配置（`application.properties`）：
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/legal_assistant?...
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. 运行项目

```bash
# 使用Maven运行
mvn spring-boot:run

# 或打包后运行
mvn clean package
java -jar target/legal-0.0.1-SNAPSHOT.jar
```

### 4. 访问接口

- 服务地址: `http://localhost:8080`
- API基础路径: `http://localhost:8080/api`

## API接口

### 认证相关 (`/api/auth`)

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/logout` - 用户登出

### AI咨询 (`/api/ai-consult`)

- `POST /api/ai-consult/conversations` - 创建新对话
- `POST /api/ai-consult/messages` - 发送消息
- `GET /api/ai-consult/conversations` - 获取对话列表
- `GET /api/ai-consult/conversations/{id}` - 获取对话详情
- `DELETE /api/ai-consult/conversations/{id}` - 删除对话
- `DELETE /api/ai-consult/conversations/all` - 清空所有对话

## 数据库表结构

项目包含12张数据表：

1. **users** - 用户表
2. **verification_codes** - 验证码表
3. **conversations** - 对话表
4. **messages** - 消息表
5. **legal_regulations** - 法律法规表
6. **legal_cases** - 案例表
7. **document_templates** - 文书模板表
8. **favorites** - 收藏表
9. **tool_usage_records** - 工具使用记录表
10. **download_records** - 下载记录表
11. **document_reviews** - 文件审查记录表
12. **case_search_history** - 案例搜索历史表

详细设计请参考 `数据库设计文档.md`

## 安全配置

- 使用JWT进行身份认证
- 密码使用BCrypt加密存储
- 跨域配置已启用（开发环境）
- 认证接口无需token，其他接口需要Bearer Token

## 开发说明

### 添加新功能

1. 在 `entity` 包中创建实体类（继承 `BaseEntity`）
2. 在 `repository` 包中创建Repository接口
3. 在 `service` 包中实现业务逻辑
4. 在 `controller` 包中创建API接口
5. 在 `dto` 包中创建请求/响应DTO

### 注意事项

- 所有实体类需要继承 `BaseEntity`
- JSON字段使用 `@Type(JsonType.class)` 注解
- 使用 `@Transactional` 注解管理事务
- 统一使用 `Result<T>` 作为响应格式
- 异常统一由 `GlobalExceptionHandler` 处理

## 待完成功能

- [ ] 法律工具接口（计算器、文件审查等）
- [ ] 法律知识库接口（法规查询、收藏等）
- [ ] 用户中心接口（个人信息、统计数据等）
- [ ] 文件上传功能
- [ ] AI服务集成（OpenAI/文心一言等）
- [ ] 短信服务集成
- [ ] 单元测试
- [ ] API文档（Swagger）

## 许可证

MIT License

## 联系方式

如有问题，请联系开发团队。

