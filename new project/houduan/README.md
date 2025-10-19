# 情绪岛后端系统

## 📋 项目概述

情绪岛是一个基于Spring Boot的心理健康管理平台后端系统，提供用户管理、心情打卡、练习记录、测评报告和成就系统等功能。

## 🏗️ 技术架构

- **框架**: Spring Boot 3.5.6
- **数据库**: MySQL 8.0
- **ORM**: Spring Data JPA
- **安全**: Spring Security + JWT
- **构建工具**: Maven
- **Java版本**: 17

## 📊 数据库设计

### 核心表结构

1. **用户表 (users)** - 用户基本信息
2. **心情记录表 (mood_records)** - 每日心情打卡数据
3. **练习历史表 (practice_history)** - 正念呼吸和冥想练习记录
4. **测评历史表 (assessment_history)** - 心理测评报告数据
5. **用户成就表 (user_achievements)** - 成就勋章记录
6. **系统配置表 (system_config)** - 系统配置信息
7. **操作日志表 (operation_logs)** - 系统操作日志

### 数据库特性

- 支持软删除机制
- 完整的审计字段（创建时间、更新时间）
- 优化的索引设计
- 外键约束保证数据一致性
- 统计视图简化复杂查询

## 🚀 快速开始

### 1. 环境要求

- JDK 17+
- MySQL 8.0+
- Maven 3.6+

### 2. 数据库初始化

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE emotion_island CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 执行建表脚本
mysql -u root -p emotion_island < src/main/resources/sql/schema.sql
```

### 3. 配置数据库连接

修改 `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/emotion_island?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 4. 启动应用

```bash
mvn spring-boot:run
```

应用将在 `http://localhost:8080` 启动。

## 📁 项目结构

```
src/main/java/com/xyq/houduan/
├── config/                 # 配置类
│   ├── CorsConfig.java     # 跨域配置
│   ├── JpaConfig.java      # JPA配置
│   ├── JwtConfig.java      # JWT配置
│   └── SecurityConfig.java # 安全配置
├── entity/                 # 实体类
│   ├── BaseEntity.java     # 基础实体
│   ├── User.java           # 用户实体
│   ├── MoodRecord.java     # 心情记录实体
│   ├── PracticeHistory.java # 练习历史实体
│   ├── AssessmentHistory.java # 测评历史实体
│   ├── UserAchievement.java # 用户成就实体
│   ├── SystemConfig.java   # 系统配置实体
│   └── OperationLog.java   # 操作日志实体
└── repository/             # 数据访问层
    ├── UserRepository.java
    ├── MoodRecordRepository.java
    ├── PracticeHistoryRepository.java
    ├── AssessmentHistoryRepository.java
    ├── UserAchievementRepository.java
    ├── SystemConfigRepository.java
    └── OperationLogRepository.java
```

## 🔧 核心功能

### 1. 用户管理
- 用户注册/登录
- JWT认证
- 个人信息管理
- 头像上传

### 2. 心情打卡
- 每日心情记录
- 心情分数统计
- 连续打卡计算
- 心情趋势分析

### 3. 练习记录
- 正念呼吸练习
- 冥想音频练习
- 练习时长统计
- 练习历史查询

### 4. 测评报告
- 多种心理测评量表
- 测评结果分析
- 历史报告查询
- 测评统计信息

### 5. 成就系统
- 多种成就类型
- 自动成就解锁
- 成就进度跟踪
- 成就展示

## 📚 API接口

系统提供完整的RESTful API接口，包括：

- **用户认证**: `/api/user/*`
- **心情打卡**: `/api/mood/*`
- **练习记录**: `/api/practice/*`
- **测评报告**: `/api/assessment/*`
- **个人设置**: `/api/profile/*`

详细的API文档请参考 `README.md` 文件。

## 🔒 安全特性

- JWT Token认证
- 密码BCrypt加密
- 跨域请求支持
- 操作日志记录
- 软删除机制

## 📈 性能优化

- 数据库索引优化
- 查询语句优化
- 分页查询支持
- 缓存机制
- 统计视图

## 🛠️ 开发工具

- **IDE**: IntelliJ IDEA / Eclipse
- **数据库工具**: MySQL Workbench / Navicat
- **API测试**: Postman / Insomnia
- **版本控制**: Git

## 📝 开发规范

### 代码规范
- 使用Lombok减少样板代码
- 统一的异常处理
- 完整的JavaDoc注释
- 遵循Spring Boot最佳实践

### 数据库规范
- 统一的命名规范
- 完整的索引设计
- 外键约束保证数据一致性
- 软删除机制

## 🚀 部署说明

### 开发环境
```bash
mvn spring-boot:run
```

### 生产环境
```bash
mvn clean package
java -jar target/houduan-0.0.1-SNAPSHOT.jar
```

### Docker部署
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/houduan-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 📞 技术支持

如有问题，请查看：
1. 数据库设计文档: `DATABASE_DESIGN.md`
2. API接口文档: `README.md`
3. 日志文件: `logs/application.log`

## 📄 许可证

本项目采用 MIT 许可证。

## 🔄 版本历史

- **v1.0.0** (2024-12-18): 初始版本，包含完整的数据库设计和基础架构
