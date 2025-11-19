# Apifox 接口测试指南

> 本文档详细说明如何在 Apifox 中测试法智顾问系统的接口，特别是**文件审查模块的四个接口**。

---

## 📋 目录

1. [准备工作](#准备工作)
2. [环境配置](#环境配置)
3. [测试数据准备](#测试数据准备)
4. [文件审查接口测试](#文件审查接口测试)
5. [其他接口测试](#其他接口测试)
6. [常见问题](#常见问题)

---

## 🚀 准备工作

### 1.1 确保后端服务运行

```bash
# 进入后端目录
cd 后端代码/legal

# 启动后端服务（确保MySQL数据库已启动）
# Windows
start-backend.cmd

# 或使用Maven
mvn spring-boot:run
```

**服务地址**: `http://localhost:8080`

### 1.2 确保数据库已初始化

1. **创建数据库和表结构**
   ```sql
   -- 执行建表脚本
   source 后端代码/legal/src/main/resources/db/schema.sql
   ```

2. **插入测试数据**
   ```sql
   -- 执行测试数据脚本
   source 后端代码/legal/src/main/resources/db/apifox_test_data.sql
   ```

### 1.3 测试账号信息

| 字段 | 值 |
|------|-----|
| 手机号 | `13900139000` |
| 密码 | `123456` |
| 用户ID | `test_user_001` |

---

## ⚙️ 环境配置

### 2.1 创建 Apifox 环境

1. 打开 Apifox
2. 点击左侧 **"环境"** → **"新建环境"**
3. 环境名称：`法智顾问-本地测试`
4. 配置环境变量：

| 变量名 | 初始值 | 说明 |
|--------|--------|------|
| `baseUrl` | `http://localhost:8080` | 后端服务地址 |
| `token` | (空) | JWT Token（登录后自动设置） |

### 2.2 配置全局认证

1. 在 Apifox 中，进入 **"项目设置"** → **"认证"**
2. 选择 **"Bearer Token"** 认证方式
3. 设置 Token 变量：`{{token}}`
4. 这样所有需要认证的接口都会自动携带 Token

---

## 📊 测试数据准备

### 3.1 执行测试数据脚本

在 MySQL 中执行以下脚本：

```sql
-- 1. 先执行建表脚本（如果还没执行）
source 后端代码/legal/src/main/resources/db/schema.sql

-- 2. 执行测试数据脚本
source 后端代码/legal/src/main/resources/db/apifox_test_data.sql
```

### 3.2 验证测试数据

执行以下 SQL 验证数据是否插入成功：

```sql
-- 检查用户
SELECT id, phone, nickname FROM users WHERE phone = '13900139000';

-- 检查文件审查记录
SELECT id, file_name, overall_score FROM document_reviews WHERE user_id = 'test_user_001';
```

**预期结果**：
- 用户：1条记录
- 文件审查记录：3条记录（review_001, review_002, review_003）

---

## 📁 文件审查接口测试

### 4.1 接口列表

文件审查模块包含以下四个接口：

| 序号 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 1 | POST | `/api/legal-tools/document-review` | 上传文件进行审查 |
| 2 | GET | `/api/legal-tools/document-review/history` | 获取审查历史列表 |
| 3 | GET | `/api/legal-tools/document-review/{id}` | 获取审查详情 |
| 4 | DELETE | `/api/legal-tools/document-review/{id}` | 删除审查记录 |

### 4.2 步骤一：登录获取 Token

**接口**: `POST /api/auth/login`

**请求配置**：
- URL: `{{baseUrl}}/api/auth/login`
- Method: `POST`
- Headers: `Content-Type: application/json`

**请求体**：
```json
{
  "phone": "13900139000",
  "password": "123456"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "test_user_001",
      "phone": "13900139000",
      "nickname": "测试用户1"
    }
  }
}
```

**配置后置操作**：
1. 在 Apifox 中，点击该接口的 **"后置操作"** 标签
2. 添加 **"提取变量"**：
   - 变量名：`token`
   - 提取表达式：`$.data.token`
   - 作用域：`环境变量`

这样登录后，Token 会自动保存到环境变量中。

---

### 4.3 步骤二：测试接口 1 - 上传文件审查

**接口**: `POST /api/legal-tools/document-review`

**请求配置**：
- URL: `{{baseUrl}}/api/legal-tools/document-review`
- Method: `POST`
- Headers: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: multipart/form-data`
- Body: 选择 `form-data`，添加字段：
  - 字段名：`file`
  - 类型：`File`
  - 值：选择一个 PDF 或 DOCX 文件（建议使用测试文件）

**测试文件准备**：
- 可以创建一个简单的 PDF 或 Word 文档用于测试
- 文件大小建议 < 10MB（根据配置限制）

**响应示例**：
```json
{
  "code": 200,
  "message": "审查完成",
  "data": {
    "id": "review_004",
    "fileName": "test_document.pdf",
    "fileSize": 245760,
    "fileType": "pdf",
    "overallScore": 85,
    "suggestions": [
      {
        "type": "warning",
        "title": "试用期约定过长",
        "description": "建议明确具体期限",
        "severity": "medium"
      }
    ],
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

**注意事项**：
- 确保已登录并获取 Token
- 文件必须是有效的 PDF 或 DOCX 格式
- 文件大小不能超过 10MB

---

### 4.4 步骤三：测试接口 2 - 获取审查历史列表

**接口**: `GET /api/legal-tools/document-review/history`

**请求配置**：
- URL: `{{baseUrl}}/api/legal-tools/document-review/history`
- Method: `GET`
- Headers: `Authorization: Bearer {{token}}`
- Query Parameters（可选）：
  - `page`: 页码（默认：1）
  - `pageSize`: 每页数量（默认：10）

**完整 URL 示例**：
```
{{baseUrl}}/api/legal-tools/document-review/history?page=1&pageSize=10
```

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "review_001",
        "fileName": "劳动合同审查.pdf",
        "fileSize": 245760,
        "fileType": "pdf",
        "overallScore": 85,
        "createdAt": "2024-01-09T10:30:00"
      },
      {
        "id": "review_002",
        "fileName": "解除通知书审查.docx",
        "fileSize": 189440,
        "fileType": "docx",
        "overallScore": 65,
        "createdAt": "2024-01-12T14:20:00"
      }
    ],
    "total": 3,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

**测试要点**：
- 验证返回的记录数量是否正确（应该有3条测试数据）
- 验证分页功能是否正常
- 验证返回的数据结构是否符合预期

---

### 4.5 步骤四：测试接口 3 - 获取审查详情

**接口**: `GET /api/legal-tools/document-review/{id}`

**请求配置**：
- URL: `{{baseUrl}}/api/legal-tools/document-review/{{reviewId}}`
- Method: `GET`
- Headers: `Authorization: Bearer {{token}}`
- Path Variables：
  - `reviewId`: `review_001`（使用测试数据中的ID）

**完整 URL 示例**：
```
{{baseUrl}}/api/legal-tools/document-review/review_001
```

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "review_001",
    "fileName": "劳动合同审查.pdf",
    "fileUrl": "/uploads/reviews/contract_001.pdf",
    "fileSize": 245760,
    "fileType": "pdf",
    "overallScore": 85,
    "suggestions": [
      {
        "type": "warning",
        "title": "试用期约定过长",
        "description": "劳动合同约定试用期为6个月，但根据《劳动合同法》规定，三年以上固定期限劳动合同试用期最长不超过6个月，建议明确具体期限。",
        "severity": "medium"
      },
      {
        "type": "info",
        "title": "工作地点约定明确",
        "description": "工作地点约定清晰，符合要求。",
        "severity": "low"
      },
      {
        "type": "warning",
        "title": "违约金条款需注意",
        "description": "违约金条款约定较为严格，建议确认是否符合法律规定。",
        "severity": "medium"
      }
    ],
    "createdAt": "2024-01-09T10:30:00",
    "updatedAt": "2024-01-09T10:30:00"
  }
}
```

**测试要点**：
- 使用测试数据中的 `review_001`、`review_002`、`review_003` 进行测试
- 验证返回的详细信息是否完整
- 验证 suggestions 数组是否正确返回

**测试用例**：
1. ✅ 正常情况：使用存在的 review_001
2. ❌ 异常情况：使用不存在的 ID（如 `review_999`）
3. ❌ 异常情况：使用其他用户的审查记录ID（如果有）

---

### 4.6 步骤五：测试接口 4 - 删除审查记录

**接口**: `DELETE /api/legal-tools/document-review/{id}`

**请求配置**：
- URL: `{{baseUrl}}/api/legal-tools/document-review/{{reviewId}}`
- Method: `DELETE`
- Headers: `Authorization: Bearer {{token}}`
- Path Variables：
  - `reviewId`: `review_003`（建议使用最后一条测试数据）

**完整 URL 示例**：
```
{{baseUrl}}/api/legal-tools/document-review/review_003
```

**响应示例**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**测试要点**：
- ⚠️ **注意**：删除操作不可逆，建议先测试获取详情接口确认数据存在
- 删除后，再次调用获取详情接口应该返回 404 或错误
- 删除后，历史列表中的记录数量应该减少

**测试流程**：
1. 先调用 `GET /history` 确认有3条记录
2. 调用 `DELETE /review_003` 删除一条
3. 再次调用 `GET /history` 确认只剩2条记录
4. 调用 `GET /review_003` 确认返回错误（记录不存在）

---

## 🔄 其他接口测试

### 5.1 认证相关接口

#### 注册接口
- **URL**: `POST {{baseUrl}}/api/auth/register`
- **Body**: 
  ```json
  {
    "phone": "13900139001",
    "password": "123456",
    "nickname": "新用户",
    "verificationCode": "123456"
  }
  ```

#### 发送验证码
- **URL**: `POST {{baseUrl}}/api/auth/send-code`
- **Body**: 
  ```json
  {
    "phone": "13900139001",
    "type": "register"
  }
  ```

### 5.2 法律知识库接口

#### 获取法律法规列表
- **URL**: `GET {{baseUrl}}/api/legal-knowledge/regulations?page=1&pageSize=10`

#### 收藏法规
- **URL**: `POST {{baseUrl}}/api/legal-knowledge/favorites`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body**: 
  ```json
  {
    "regulationId": "reg_001"
  }
  ```

---

## ❓ 常见问题

### Q1: 登录时提示"用户不存在"或"密码错误"

**解决方案**：
1. 确认测试数据脚本已执行
2. 检查数据库中的用户数据：
   ```sql
   SELECT * FROM users WHERE phone = '13900139000';
   ```
3. 如果用户不存在，可以：
   - 重新执行测试数据脚本
   - 或通过注册接口创建新用户

### Q2: Token 过期或无效

**解决方案**：
1. Token 默认有效期为 24 小时（86400000 毫秒）
2. 如果 Token 过期，重新调用登录接口获取新 Token
3. 检查 Token 是否正确设置到环境变量中

### Q3: 文件上传失败

**可能原因**：
1. 文件大小超过 10MB 限制
2. 文件格式不支持（只支持 PDF 和 DOCX）
3. 未设置正确的 Content-Type

**解决方案**：
- 使用 Apifox 的 `form-data` 方式上传文件
- 确保字段名为 `file`
- 检查文件大小和格式

### Q4: 获取审查历史返回空数组

**解决方案**：
1. 确认测试数据已插入：
   ```sql
   SELECT * FROM document_reviews WHERE user_id = 'test_user_001';
   ```
2. 确认使用的 Token 对应的用户ID正确
3. 检查用户ID是否匹配

### Q5: 删除接口返回 404

**可能原因**：
1. 审查记录ID不存在
2. 该记录不属于当前登录用户
3. 记录已被删除

**解决方案**：
- 先调用历史列表接口获取有效的记录ID
- 确认记录属于当前用户

### Q6: 数据库连接失败

**解决方案**：
1. 确认 MySQL 服务已启动
2. 检查 `application.properties` 中的数据库配置：
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/legal_assistant
   spring.datasource.username=root
   spring.datasource.password=123456
   ```
3. 确认数据库 `legal_assistant` 已创建

---

## 📝 测试检查清单

### 文件审查接口测试清单

- [ ] ✅ 登录接口测试通过，Token 已保存
- [ ] ✅ 上传文件审查接口测试通过
- [ ] ✅ 获取审查历史列表接口测试通过（返回3条记录）
- [ ] ✅ 获取审查详情接口测试通过（使用 review_001）
- [ ] ✅ 删除审查记录接口测试通过
- [ ] ✅ 删除后验证记录已从列表中移除
- [ ] ✅ 测试异常情况（不存在的ID、无权限访问等）

---

## 🎯 快速测试流程

1. **准备环境**
   ```bash
   # 1. 启动MySQL
   # 2. 执行建表脚本
   # 3. 执行测试数据脚本
   # 4. 启动后端服务
   ```

2. **在 Apifox 中测试**
   ```
   登录 → 获取Token → 测试文件审查接口
   ```

3. **验证结果**
   - 所有接口返回 200 状态码
   - 返回的数据结构正确
   - 业务逻辑符合预期

---

## 📚 相关文档

- [API接口文档](../前端代码/API接口文档.md)
- [数据库设计文档](数据库设计文档.md)
- [接口实现状态报告](接口实现状态报告.md)

---

**最后更新**: 2024年  
**适用版本**: v1.0

