# H2控制台连接指南

## 🎯 问题分析

你遇到的错误信息：
```
Database "C:/Users/HP/test" not found, either pre-create it or allow remote database creation
```

**原因**：H2控制台使用了错误的JDBC URL，尝试连接文件数据库而不是内存数据库。

## 🔧 解决方案

### 1. 正确的连接参数

在H2控制台登录页面，使用以下参数：

| 字段 | 值 |
|------|-----|
| **驱动类** | `org.h2.Driver` |
| **JDBC URL** | `jdbc:h2:mem:emotion_island` ⚠️ **重要** |
| **用户名** | `sa` |
| **密码** | (留空) |

### 2. 关键修改

**❌ 错误的JDBC URL：**
```
jdbc:h2:~/test
```

**✅ 正确的JDBC URL：**
```
jdbc:h2:mem:emotion_island
```

### 3. 连接步骤

1. 打开浏览器访问：`http://localhost:8081/h2-console`
2. 在登录表单中：
   - 保持"驱动类"为：`org.h2.Driver`
   - **修改"JDBC URL"为**：`jdbc:h2:mem:emotion_island`
   - 保持"用户名"为：`sa`
   - 保持"密码"为空
3. 点击"连接"按钮

### 4. 连接成功后

你应该能看到以下数据库表：
- `USERS` - 用户表
- `MOOD_RECORDS` - 心情记录表
- `PRACTICE_HISTORY` - 练习历史表
- `ASSESSMENT_HISTORY` - 测评历史表
- `USER_ACHIEVEMENTS` - 用户成就表
- `USER_SESSIONS` - 用户会话表
- `OPERATION_LOGS` - 操作日志表
- `SYSTEM_CONFIG` - 系统配置表

## 🔍 技术说明

### 数据库类型对比

| 类型 | JDBC URL格式 | 说明 |
|------|-------------|------|
| **内存数据库** | `jdbc:h2:mem:数据库名` | 数据存储在内存中，重启后丢失 |
| **文件数据库** | `jdbc:h2:~/路径` | 数据存储在文件中，持久化保存 |

### 项目配置

根据 `application.properties` 配置：
```properties
spring.datasource.url=jdbc:h2:mem:emotion_island
```

项目使用的是**内存数据库**，数据库名为 `emotion_island`。

## 🚨 常见错误

1. **使用错误的JDBC URL**：`jdbc:h2:~/test` → 应该使用 `jdbc:h2:mem:emotion_island`
2. **服务未启动**：确保后端服务在8081端口运行
3. **端口冲突**：如果8081端口被占用，需要先停止占用进程

## ✅ 验证连接

连接成功后，你可以执行以下SQL查询验证：

```sql
-- 查看所有表
SHOW TABLES;

-- 查看用户表结构
DESCRIBE USERS;

-- 查看用户数据（如果有的话）
SELECT * FROM USERS;
```

## 🎉 总结

**关键点**：将JDBC URL从 `jdbc:h2:~/test` 改为 `jdbc:h2:mem:emotion_island` 即可解决问题！
