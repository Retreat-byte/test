# Apifox 接口测试数据文档

> 本文档基于 `默认模块.md` 生成，标注了后端实际实现的接口路径，并提供测试数据
> 
> **Base URL**: `http://localhost:8080`

---

## 🔑 验证码获取方法

在测试需要验证码的接口时（如注册、重置密码），可以通过以下方式获取验证码：

### 方法一：查看后端控制台输出（推荐）⭐

1. **启动后端服务**（运行 `start-backend.cmd` 或启动 Spring Boot 应用）
2. **调用发送验证码接口**：`POST /api/auth/send-code`
   ```json
   {
     "phone": "13800138000",
     "type": "register"
   }
   ```
3. **查看后端控制台**，验证码会直接打印出来：
   ```
   验证码: 123456 (手机号: 13800138000, 类型: register)
   ```
4. **使用该验证码**进行后续测试（注册、重置密码等）

**注意**：
- 验证码有效期为 **5分钟**
- 验证码使用后会被标记为已使用，不能重复使用
- 每个手机号可以同时存在多个未使用的验证码，系统会使用最新的一个

### 方法二：查询数据库

如果后端控制台不可见，可以直接查询数据库：

```sql
-- 查询指定手机号的最新验证码
SELECT phone, code, type, expired_at, used, created_at 
FROM verification_codes 
WHERE phone = '13800138000' 
  AND type = 'register' 
  AND used = 0 
ORDER BY created_at DESC 
LIMIT 1;
```

### 方法三：使用固定测试验证码（开发环境）

如果是在开发/测试环境，可以考虑：
1. 修改后端代码，在测试环境返回固定验证码（如 `123456`）
2. 或创建一个测试接口来查询验证码

### 📝 测试流程示例

**注册流程**：
1. 调用 `POST /api/auth/send-code` 发送验证码
2. 查看后端控制台获取验证码（如：`123456`）
3. 调用 `POST /api/auth/register` 使用验证码注册
   ```json
   {
     "phone": "13800138000",
     "password": "123456",
     "nickname": "测试用户",
     "verificationCode": "123456"  // 从控制台获取
   }
   ```

**重置密码流程**：
1. 调用 `POST /api/auth/send-code` 发送验证码（`type: "reset"`）
2. 查看后端控制台获取验证码
3. 调用 `POST /api/user/reset-password` 使用验证码重置密码

---

## 📋 接口路径对照表

| 默认模块路径 | 实际后端路径 | 状态 | 说明 |
|------------|------------|------|------|
| `/api/auth/send-code` | `/api/auth/send-code` | ⚠️ 参数格式不同 | 实际需要 `phone` 和 `type` |
| `/api/ai-consult/messages` | `/api/ai-consult/messages` | ⚠️ 参数格式不同 | 实际需要 `conversationId` 和 `message` |
| 其他接口 | 一致 | ✅ | 路径完全匹配 |

---

## ❌ 未实现的接口

以下接口在默认模块中**未定义**，但在需求中需要实现：

1. `POST /api/legal-tools/document-review` - 上传文件进行AI审查
2. `GET /api/legal-tools/document-review` - 获取审查记录列表
3. `GET /api/legal-tools/document-review/{id}` - 获取审查记录详情
4. `DELETE /api/legal-tools/document-review/{id}` - 删除审查记录

---

## ✅ 已实现的接口测试数据

### 1. 认证相关 (`/api/auth`)

#### 1.1 POST /api/auth/login ✅ ok

**实际路径**: `POST /api/auth/login`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "phone": "13800138001",
  "password": "123456"
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzgwMDEzODAwMCIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxNjE2MzI1NDIyfQ.example",
    "userInfo": {
      "id": "user_001",
      "phone": "13800138001",
      "nickname": "张三",
      "avatar": "https://example.com/avatar.jpg",
      "email": "zhangsan@example.com",
      "gender": "male"
    }
  }
}
```

---

#### 1.2 POST /api/auth/register ✅ ok

**实际路径**: `POST /api/auth/register`  
**状态**: ✅ 已实现，路径一致

**⚠️ 重要提示**: 使用此接口前，需要先调用 `POST /api/auth/send-code` 获取验证码，验证码会在后端控制台打印出来。详见文档开头的"验证码获取方法"章节。

**测试数据**:
```json
{
  "phone": "13900139000",
  "password": "123456",
  "nickname": "李四",
  "email": "lisi@example.com",
  "gender": "female",
  "verificationCode": "123456"  // ⚠️ 需要先调用 send-code 接口获取，查看后端控制台
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": null
}
```

---

#### 1.3 POST /api/auth/send-code ⚠️ ok 

**实际路径**: `POST /api/auth/send-code`  
**状态**: ⚠️ **参数格式不同**

**默认模块格式**:
```json
{
  "key": "string"
}
```

**实际后端格式**: 后端的实际格式是正确的（以后端的实际格式为准）
```json
{
  "phone": "13800138000",
  "type": "register"
}
```

**测试数据**:
```json
{
  "phone": "13800138000",
  "type": "register"
}
```

**说明**: `type` 可选值: `register`（注册）、`reset`（重置密码）

**⚠️ 验证码获取**: 调用此接口后，验证码会打印在后端控制台，格式如：`验证码: 123456 (手机号: 13800138000, 类型: register)`

**预期响应**:
```json
{
  "code": 200,
  "message": "验证码发送成功",
  "data": null
}
```

---

#### 1.4 POST /api/auth/logout ✅ ok

**实际路径**: `POST /api/auth/logout`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需请求体，只需在 Header 中添加 `Authorization: Bearer {token}`

**预期响应**:
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

---

### 2. 用户中心相关 (`/api/user`)

#### 2.1 GET /api/user/profile ✅ ok

**实际路径**: `GET /api/user/profile`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需请求体，需要认证 Header

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user_001",
    "phone": "13800138000",
    "nickname": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "email": "zhangsan@example.com",
    "gender": "male",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

---

#### 2.2 PUT /api/user/profile ✅ ok

**实际路径**: `PUT /api/user/profile`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "nickname": "张三三",
  "email": "zhangsan_new@example.com",
  "gender": "male"
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user_001",
    "phone": "13800138000",
    "nickname": "张三三",
    "avatar": "https://example.com/avatar.jpg",
    "email": "zhangsan_new@example.com",
    "gender": "male"
  }
}
```

---
#### 2.3 POST /api/user/avatar ✅ ok

**实际路径**: `POST /api/user/avatar`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Content-Type: `multipart/form-data`
- 参数名: `file`
- 值: 选择图片文件

**预期响应**: 
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "avatarUrl": "https://example.com/uploads/avatar/user_001.jpg"
  }
}
```

---

#### 2.4 POST /api/user/change-password ✅ ok

**实际路径**: `POST /api/user/change-password`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "oldPassword": "123456",
  "newPassword": "newpass123"
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "修改成功",
  "data": null
}
```

---

#### 2.5 POST /api/user/reset-password ✅ false

**实际路径**: `POST /api/user/reset-password`  
**状态**: ✅ 已实现，路径一致

**⚠️ 重要提示**: 使用此接口前，需要先调用 `POST /api/auth/send-code`（`type: "reset"`）获取验证码，验证码会在后端控制台打印出来。详见文档开头的"验证码获取方法"章节。

**测试数据**:
```json
{
  "phone": "13800138000",
  "verificationCode": "123456",  // ⚠️ 需要先调用 send-code 接口获取，查看后端控制台
  "newPassword": "newpass123"
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "重置成功",
  "data": null
}
```

**❌ 失败原因**: 
- **验证码无效或已使用**：验证码可能已过期（5分钟有效期）或已被使用。解决方案：
  1. 重新调用 `POST /api/auth/send-code` 获取新的验证码
  2. 查看后端控制台获取最新验证码
  3. 立即使用新验证码进行重置密码操作

---

#### 2.6 GET /api/user/statistics ✅ ok

**实际路径**: `GET /api/user/statistics`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需请求体，需要认证 Header

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalConsultations": 15,
    "totalDownloads": 8,
    "totalFavorites": 12,
    "totalCalculations": 5
  }
}
```

---

#### 2.7 GET /api/user/activities/recent ✅ ok

**实际路径**: `GET /api/user/activities/recent`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Query参数: `limit=5` (可选，默认5)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "type": "consultation",
      "description": "创建了新的AI咨询对话",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "type": "download",
      "description": "下载了劳动合同模板",
      "timestamp": "2024-01-14T15:20:00Z"
    }
  ]
}
```

---

#### 2.8 GET /api/user/tool-usage ✅ ok

**实际路径**: `GET /api/user/tool-usage`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Query参数: 
  - `toolType` (可选): `calculator`, `document-review`, `template`
  - `page=1` (默认)
  - `pageSize=10` (默认)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "record_001",
        "toolType": "calculator",
        "toolName": "经济补偿金计算",
        "usedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 3. AI咨询相关 (`/api/ai-consult`)

#### 3.1 POST /api/ai-consult/conversations ✅ ok

**实际路径**: `POST /api/ai-consult/conversations`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需请求体，需要认证 Header

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "conversationId": "conv_001",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### 3.2 GET /api/ai-consult/conversations ✅ false

**实际路径**: `GET /api/ai-consult/conversations`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Query参数: 
  - `page=1` (默认)
  - `pageSize=20` (默认)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "conversationId": "conv_001",
        "title": "劳动合同纠纷咨询",
        "lastMessage": "感谢您的咨询",
        "messageCount": 10,
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-01T11:00:00Z"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "number": 1,
    "size": 20
  }
}
```

**❌ 失败原因**: 
- **No enum constant com.xyq.legal.entity.Message.Role.user**：测试数据中消息的role字段使用了小写 `user`/`assistant`，但Java枚举定义是大写 `USER`/`ASSISTANT`。
- **✅ 已修复**：已更新测试数据SQL，将所有role值改为大写。请重新执行 `test_data.sql` 脚本。

---

#### 3.3 POST /api/ai-consult/messages ⚠️ ok

**实际路径**: `POST /api/ai-consult/messages`  
**状态**: ⚠️ **参数格式不同**

**默认模块格式**:
```json
{
  "key": "string"
}
```

**实际后端格式**: 实际后端格式是正确的（以实际后端格式为准）
```json
{
  "conversationId": "conv_001",
  "message": "我想咨询劳动合同纠纷"
}
```

**测试数据**:
```json
{
  "conversationId": "conv_001",
  "message": "我想咨询劳动合同纠纷，公司无故辞退我，应该怎么维权？"
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "messageId": "msg_001",
    "reply": "您好，关于劳动合同纠纷，根据《劳动合同法》相关规定...",
    "timestamp": "2024-01-15T10:05:00Z"
  }
}
```

---

#### 3.4 GET /api/ai-consult/conversations/{conversationId} ✅ false
**实际路径**: `GET /api/ai-consult/conversations/{conversationId}`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Path参数: `conversationId=conv_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "messageId": "msg_001",
      "role": "user",
      "content": "我想咨询劳动合同纠纷",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "messageId": "msg_002",
      "role": "assistant",
      "content": "您好，关于劳动合同纠纷...",
      "timestamp": "2024-01-15T10:05:00Z"
    }
  ]
}
```

**❌ 失败原因**: 
- **No enum constant com.xyq.legal.entity.Message.Role.user**：同3.2接口，role枚举值不匹配。
- **✅ 已修复**：已更新测试数据SQL，请重新执行脚本。

---

#### 3.5 DELETE /api/ai-consult/conversations/{conversationId} ✅ false
**实际路径**: `DELETE /api/ai-consult/conversations/{conversationId}`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Path参数: `conversationId=conv_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**❌ 失败原因**: 
- **No enum constant com.xyq.legal.entity.Message.Role.user**：删除对话时需要读取消息数据，role枚举值不匹配导致失败。
- **✅ 已修复**：已更新测试数据SQL，请重新执行脚本。

---

#### 3.6 DELETE /api/ai-consult/conversations/all ✅ false

**实际路径**: `DELETE /api/ai-consult/conversations/all`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需参数，需要认证 Header

**预期响应**:
```json
{
  "code": 200,
  "message": "清空成功",
  "data": null
}
```

**❌ 失败原因**: 
- **No enum constant com.xyq.legal.entity.Message.Role.user**：同3.5接口，role枚举值不匹配。
- **✅ 已修复**：已更新测试数据SQL，请重新执行脚本。

---

### 4. 法律案例相关 (`/api/legal-tools/cases`)

#### 4.1 GET /api/legal-tools/cases ✅ ok
**实际路径**: `GET /api/legal-tools/cases`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Query参数: 
  - `page=1` (默认)
  - `pageSize=10` (默认)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "case_001",
        "title": "劳动合同纠纷案",
        "caseType": "劳动纠纷",
        "court": "北京市朝阳区人民法院",
        "judgmentDate": "2023-12-01",
        "summary": "关于用人单位违法解除劳动合同的赔偿问题"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

---

#### 4.2 POST /api/legal-tools/cases/search ✅ ok

**实际路径**: `POST /api/legal-tools/cases/search`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "keyword": "劳动合同",
  "caseType": "劳动纠纷",
  "court": "北京市朝阳区人民法院",
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "page": 1,
  "pageSize": 10
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "case_001",
        "title": "劳动合同纠纷案",
        "caseType": "劳动纠纷",
        "court": "北京市朝阳区人民法院",
        "judgmentDate": "2023-12-01"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

---

#### 4.3 GET /api/legal-tools/cases/{id} ✅ ok 

**实际路径**: `GET /api/legal-tools/cases/{id}`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Path参数: `id=case_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "case_001",
    "title": "劳动合同纠纷案",
    "caseType": "劳动纠纷",
    "court": "北京市朝阳区人民法院",
    "judgmentDate": "2023-12-01",
    "content": "案件详细内容...",
    "relatedLaws": ["《劳动合同法》第四十七条"],
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

---

#### 4.4 GET /api/legal-tools/cases/types ✅ ok

**实际路径**: `GET /api/legal-tools/cases/types`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需参数

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    "劳动纠纷",
    "合同纠纷",
    "侵权纠纷",
    "婚姻家庭",
    "房产纠纷"
  ]
}
```

---

#### 4.5 GET /api/legal-tools/cases/courts ✅ ok

**实际路径**: `GET /api/legal-tools/cases/courts`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需参数

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    "北京市朝阳区人民法院",
    "北京市海淀区人民法院",
    "上海市浦东新区人民法院"
  ]
}
```

---

#### 4.6 GET /api/legal-tools/cases/search-history ✅ ok

**实际路径**: `GET /api/legal-tools/cases/search-history`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Query参数: 
  - `page=1` (默认)
  - `pageSize=10` (默认)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "history_001",
        "keyword": "劳动合同",
        "caseType": "劳动纠纷",
        "searchTime": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 10
  }
}
```

---

#### 4.7 POST /api/legal-tools/cases/search-history ✅ ok

**实际路径**: `POST /api/legal-tools/cases/search-history`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "keyword": "劳动合同",
  "caseType": "劳动纠纷",
  "court": "北京市朝阳区人民法院"
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "记录成功",
  "data": null
}
```

---

#### 4.8 DELETE /api/legal-tools/cases/search-history/{historyId} ✅ false

**实际路径**: `DELETE /api/legal-tools/cases/search-history/{historyId}`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Path参数: `historyId=history_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**❌ 失败原因**: 
- **记录不存在**：测试数据中历史记录的ID原本是 `search_001`，但测试时使用的是 `history_001`。
- **✅ 已修复**：已更新测试数据SQL，将历史记录ID改为 `history_001`, `history_002` 等格式，与API测试数据一致。请重新执行脚本。

---

#### 4.9 DELETE /api/legal-tools/cases/search-history/all ✅ ok

**实际路径**: `DELETE /api/legal-tools/cases/search-history/all`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需参数，需要认证 Header

**预期响应**:
```json
{
  "code": 200,
  "message": "已清空",
  "data": null
}
```

---

### 5. 法律法规相关 (`/api/legal-knowledge/regulations`)

#### 5.1 GET /api/legal-knowledge/regulations ✅ ok

**实际路径**: `GET /api/legal-knowledge/regulations`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Query参数: 
  - `category` (可选): "劳动法", "合同法"
  - `keyword` (可选): "劳动合同"
  - `effectStatus` (可选): "有效", "失效"
  - `page=1` (必填)
  - `pageSize=12` (必填)
  - `updateYear` (可选): 2023

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "reg_001",
        "title": "中华人民共和国劳动合同法",
        "category": "劳动法",
        "publishDate": "2007-06-29",
        "effectStatus": "有效",
        "updateYear": 2012
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 12
  }
}
```

---

#### 5.2 POST /api/legal-knowledge/regulations/search ✅ ok

**实际路径**: `POST /api/legal-knowledge/regulations/search`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "category": "劳动法",
  "keyword": "劳动合同",
  "effectStatus": "有效",
  "updateYear": 2023,
  "page": 1,
  "pageSize": 12
}
```

**预期响应**: 同 GET 接口

---

#### 5.3 GET /api/legal-knowledge/regulations/{id} ✅ ok

**实际路径**: `GET /api/legal-knowledge/regulations/{id}`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Path参数: `id=reg_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "reg_001",
    "title": "中华人民共和国劳动合同法",
    "category": "劳动法",
    "publishDate": "2007-06-29",
    "effectStatus": "有效",
    "content": "法规全文内容...",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

---

#### 5.4 GET /api/legal-knowledge/regulations/{id}/content ✅ ok

**实际路径**: `GET /api/legal-knowledge/regulations/{id}/content`  
**状态**: ✅ 已实现，路径一致（额外接口）

**测试数据**: 
- Path参数: `id=reg_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "reg_001",
    "content": "法规全文内容..."
  }
}
```

---

#### 5.5 GET /api/legal-knowledge/categories ✅ ok

**实际路径**: `GET /api/legal-knowledge/categories`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需参数

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    "劳动法",
    "合同法",
    "侵权责任法",
    "婚姻法",
    "公司法"
  ]
}
```

---

#### 5.6 GET /api/legal-knowledge/regulations/popular ✅

**实际路径**: `GET /api/legal-knowledge/regulations/popular`  
**状态**: ✅ 已实现，路径一致（额外接口）

**测试数据**: 
- Query参数: `limit=10` (默认)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "reg_001",
      "title": "中华人民共和国劳动合同法",
      "viewCount": 5000
    }
  ]
}
```

---

#### 5.7 GET /api/legal-knowledge/regulations/latest ✅ ok

**实际路径**: `GET /api/legal-knowledge/regulations/latest`  
**状态**: ✅ 已实现，路径一致（额外接口）

**测试数据**: 
- Query参数: `limit=10` (默认)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "reg_002",
      "title": "最新法规标题",
      "publishDate": "2024-01-01"
    }
  ]
}
```

---

### 6. 收藏相关 (`/api/legal-knowledge/favorites`)

#### 6.1 GET /api/legal-knowledge/favorites ✅ ok

**实际路径**: `GET /api/legal-knowledge/favorites`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Query参数: 
  - `page=1` (默认)
  - `pageSize=10` (默认)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "fav_001",
        "regulationId": "reg_001",
        "title": "中华人民共和国劳动合同法",
        "favoritedAt": "2024-01-10T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 10
  }
}
```

---

#### 6.2 POST /api/legal-knowledge/favorites ✅ false

**实际路径**: `POST /api/legal-knowledge/favorites`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "regulationId": "reg_001"
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": null
}
```

**❌ 失败原因**: 
- **已收藏该法规**：这是正常的业务逻辑验证。测试数据中 `reg_001` 已经被该用户收藏了（fav_001），所以再次添加会返回此错误。
- **解决方案**：
  1. 先调用 `DELETE /api/legal-knowledge/favorites/reg_001` 取消收藏
  2. 然后再调用此接口添加收藏
  3. 或者使用其他未被收藏的法规ID（如 `reg_004`, `reg_005`）进行测试

---

#### 6.3 DELETE /api/legal-knowledge/favorites/{regulationId} ✅ ok

**实际路径**: `DELETE /api/legal-knowledge/favorites/{regulationId}`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Path参数: `regulationId=reg_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "取消收藏成功",
  "data": null
}
```

---

#### 6.4 GET /api/legal-knowledge/favorites/check/{regulationId} ✅ ok

**实际路径**: `GET /api/legal-knowledge/favorites/check/{regulationId}`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Path参数: `regulationId=reg_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "regulationId": "reg_001",
    "favorited": true
  }
}
```

---

#### 6.5 POST /api/legal-knowledge/favorites/batch-check ✅ ok

**实际路径**: `POST /api/legal-knowledge/favorites/batch-check`  
**状态**: ✅ 已实现，路径一致（额外接口）

**测试数据**:
```json
{
  "regulationIds": ["reg_001", "reg_002", "reg_003"]
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reg_001": true,
    "reg_002": false,
    "reg_003": true
  }
}
```

---

### 7. 法律计算器相关 (`/api/legal-tools/calculator`)

#### 7.1 POST /api/legal-tools/calculator/compensation ✅ ok

**实际路径**: `POST /api/legal-tools/calculator/compensation`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "monthlyWage": 8000,
  "workYears": 5,
  "workMonths": 3,
  "calculationType": "normal"
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "multiplier": 5.25,
    "compensation": 42000,
    "baseAmount": 8000,
    "totalYears": 5.25
  }
}
```

---

#### 7.2 POST /api/legal-tools/calculator/work-injury ✅ ok

**实际路径**: `POST /api/legal-tools/calculator/work-injury`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "disabilityLevel": 5,
  "monthlyWage": 8000,
  "localAvgWage": 6000,
  "medicalCost": 50000,
  "otherCosts": 10000
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "livingSubsidy": 72000,
    "medicalCost": 50000,
    "otherCosts": 10000,
    "disabilityCompensation": 180000,
    "totalCompensation": 312000
  }
}
```

---

#### 7.3 POST /api/legal-tools/calculator/litigation-fee ✅ ok

**实际路径**: `POST /api/legal-tools/calculator/litigation-fee`  
**状态**: ✅ 已实现，路径一致

**测试数据**:
```json
{
  "caseType": "property",
  "disputeAmount": 100000
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "caseType": "property",
    "disputeAmount": 100000,
    "litigationFee": 2300
  }
}
```

---

#### 7.4 POST /api/legal-tools/calculator/penalty ✅ ok

**实际路径**: `POST /api/legal-tools/calculator/penalty`  
**状态**: ✅ 已实现，路径一致（额外接口）

**测试数据**:
```json
{
  "contractAmount": 100000,
  "breachType": "delay",
  "penaltyRate": 0.05,
  "actualLoss": 5000
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "penaltyRate": 0.05,
    "actualLoss": 5000,
    "penaltyAmount": 5000,
    "contractAmount": 100000
  }
}
```

---

### 8. 文书模板相关 (`/api/legal-tools/templates`) 

#### 8.1 GET /api/legal-tools/templates ✅ ok

**实际路径**: `GET /api/legal-tools/templates`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Query参数: 
  - `category` (可选): "劳动合同", "租赁合同"
  - `keyword` (可选): "合同"
  - `page=1` (必填)
  - `pageSize=12` (必填)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "template_001",
        "title": "劳动合同模板",
        "description": "标准劳动合同模板",
        "category": "劳动合同",
        "fileType": "docx",
        "downloadCount": 150,
        "fileSize": 524288
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 12
  }
}
```

---

#### 8.2 GET /api/legal-tools/templates/{id} ✅ ok

**实际路径**: `GET /api/legal-tools/templates/{id}`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Path参数: `id=template_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "template_001",
    "title": "劳动合同模板",
    "description": "标准劳动合同模板",
    "category": "劳动合同",
    "fileUrl": "https://example.com/templates/template_001.docx",
    "fileSize": 524288,
    "fileType": "docx",
    "downloadCount": 150,
    "previewUrl": "https://example.com/previews/template_001.jpg",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

---

#### 8.3 GET /api/legal-tools/templates/{id}/preview ✅ ok

**实际路径**: `GET /api/legal-tools/templates/{id}/preview`  
**状态**: ✅ 已实现，路径一致（额外接口）

**测试数据**: 
- Path参数: `id=template_001`

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "templateId": "template_001",
    "previewUrl": "https://example.com/previews/template_001.jpg",
    "fileUrl": "https://example.com/templates/template_001.docx"
  }
}
```

---

#### 8.4 GET /api/legal-tools/templates/{id}/download ✅ false

**实际路径**: `GET /api/legal-tools/templates/{id}/download`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Path参数: `id=template_001`
- 注意: 这是一个文件下载接口，响应为文件流

**预期响应**: 文件下载（Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document）

**❌ 失败原因**: 
- **模板文件不存在**：测试数据中模板的 `file_url` 是 `/templates/labor_contract.pdf` 这样的路径，但实际文件不存在于服务器上。
- **解决方案**：
  1. 在服务器上创建对应的文件目录和文件
  2. 或者修改测试数据中的 `file_url` 为实际存在的文件路径
  3. 或者使用URL路径（如 `http://example.com/templates/xxx.pdf`）指向实际存在的文件
  4. **注意**：这是测试环境常见问题，生产环境需要确保模板文件实际存在

---

#### 8.5 GET /api/legal-tools/templates/categories ✅ ok

**实际路径**: `GET /api/legal-tools/templates/categories`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 无需参数

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    "劳动合同",
    "租赁合同",
    "买卖合同",
    "借款合同"
  ]
}
```

---

#### 8.6 GET /api/legal-tools/templates/popular ✅ ok

**实际路径**: `GET /api/legal-tools/templates/popular`  
**状态**: ✅ 已实现，路径一致

**测试数据**: 
- Query参数: `limit=5` (默认)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "template_001",
      "title": "劳动合同模板",
      "downloadCount": 150
    }
  ]
}
```

---

#### 8.7 POST /api/legal-tools/templates/download-record ✅ ok

**实际路径**: `POST /api/legal-tools/templates/download-record`  
**状态**: ✅ 已实现，路径一致（额外接口）

**测试数据**:
```json
{
  "templateId": "template_001"
}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "记录成功",
  "data": null
}
```

---

#### 8.8 GET /api/legal-tools/templates/download-history ✅ ok

**实际路径**: `GET /api/legal-tools/templates/download-history`  
**状态**: ✅ 已实现，路径一致（额外接口）

**测试数据**: 
- Query参数: 
  - `page=1` (默认)
  - `pageSize=10` (默认)

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "download_001",
        "templateId": "template_001",
        "templateTitle": "劳动合同模板",
        "downloadedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 8,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 📝 接口差异总结

### ⚠️ 参数格式不同的接口

1. **POST /api/auth/send-code**
   - 默认模块: `{"key": "string"}`
   - 实际后端: `{"phone": "string", "type": "string"}`

2. **POST /api/ai-consult/messages**
   - 默认模块: `{"key": "string"}`
   - 实际后端: `{"conversationId": "string", "message": "string"}`

### ❌ 未实现的接口

以下接口在需求中需要实现，但在默认模块中**未定义**，后端也**未实现**：

1. `POST /api/legal-tools/document-review` - 上传文件进行AI审查
2. `GET /api/legal-tools/document-review` - 获取审查记录列表
3. `GET /api/legal-tools/document-review/{id}` - 获取审查记录详情
4. `DELETE /api/legal-tools/document-review/{id}` - 删除审查记录

---

## 🔑 认证说明

大部分接口需要认证，请在请求头中添加：

```
Authorization: Bearer {token}
```

获取 token 的方式：
1. 调用 `POST /api/auth/login` 接口
2. 从响应中的 `data.token` 字段获取

---

## 📊 测试建议

1. **先测试认证接口**：登录获取 token
2. **使用 token 测试其他接口**：在 Header 中添加 Authorization
3. **注意参数格式差异**：sendCode 和 sendMessage 接口的参数格式与默认模块不同
4. **文件上传接口**：使用 multipart/form-data 格式

---

**最后更新**: 2024年

