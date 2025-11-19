# Apifox 重新测试指南

> 数据库已更新，以下接口已修复，请按照此文档在 Apifox 中重新测试
> 
> **Base URL**: `http://localhost:8080`

---

## 🔑 测试前准备

1. **确认后端服务已启动**
   - 运行 `start-backend.cmd` 或启动 Spring Boot 应用
   - 确认服务运行在 `http://localhost:8080`

2. **获取认证 Token**
   - 先调用 `POST /api/auth/login` 获取 token
   - 在后续需要认证的接口中添加 Header: `Authorization: Bearer {token}`

3. **测试数据说明**
   - 数据库已更新，Role 枚举值已改为大写（USER/ASSISTANT）
   - 历史记录ID已改为 `history_001`, `history_002` 等格式

---

## ✅ 已修复接口测试数据

### 1. AI 咨询相关接口（已修复 Role 枚举问题）

#### 1.1 GET /api/ai-consult/conversations ✅ 已修复

**实际路径**: `GET /api/ai-consult/conversations`  
**状态**: ✅ 已修复，请重新测试

**测试数据**: 
- Query参数: 
  - `page=1` (默认)
  - `pageSize=20` (默认)
- Headers:
  ```
  Authorization: Bearer {token}
  ```

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

**✅ 修复说明**: 
- 已更新测试数据SQL，将 `messages` 表中的 `role` 字段值改为大写 `USER` 和 `ASSISTANT`
- 不再出现 "No enum constant com.xyq.legal.entity.Message.Role.user" 错误

---

#### 1.2 GET /api/ai-consult/conversations/{conversationId} ✅ 已修复

**实际路径**: `GET /api/ai-consult/conversations/{conversationId}`  
**状态**: ✅ 已修复，请重新测试

**测试数据**: 
- Path参数: `conversationId=conv_001`
- Headers:
  ```
  Authorization: Bearer {token}
  ```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "messageId": "msg_001",
      "role": "USER",
      "content": "我想咨询劳动合同纠纷",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "messageId": "msg_002",
      "role": "ASSISTANT",
      "content": "您好，关于劳动合同纠纷...",
      "timestamp": "2024-01-15T10:05:00Z"
    }
  ]
}
```

**✅ 修复说明**: 
- 已更新测试数据SQL，role 字段值已改为大写
- 响应中的 `role` 字段现在应该是 `"USER"` 或 `"ASSISTANT"`（大写）

---

#### 1.3 DELETE /api/ai-consult/conversations/{conversationId} ✅ 已修复

**实际路径**: `DELETE /api/ai-consult/conversations/{conversationId}`  
**状态**: ✅ 已修复，请重新测试

**测试数据**: 
- Path参数: `conversationId=conv_001`
- Headers:
  ```
  Authorization: Bearer {token}
  ```

**预期响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**✅ 修复说明**: 
- 已更新测试数据SQL，删除对话时读取消息数据不再报 Role 枚举错误

---

#### 1.4 DELETE /api/ai-consult/conversations/all ✅ 已修复

**实际路径**: `DELETE /api/ai-consult/conversations/all`  
**状态**: ✅ 已修复，请重新测试

**测试数据**: 
- 无需参数
- Headers:
  ```
  Authorization: Bearer {token}
  ```

**预期响应**:
```json
{
  "code": 200,
  "message": "清空成功",
  "data": null
}
```

**✅ 修复说明**: 
- 已更新测试数据SQL，清空所有对话时不再报 Role 枚举错误

---

### 2. 案例搜索历史接口（已修复 ID 格式问题）

#### 2.1 DELETE /api/legal-tools/cases/search-history/{historyId} ✅ 已修复

**实际路径**: `DELETE /api/legal-tools/cases/search-history/{historyId}`  
**状态**: ✅ 已修复，请重新测试

**测试数据**: 
- Path参数: `historyId=history_001`
- Headers:
  ```
  Authorization: Bearer {token}
  ```

**预期响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**✅ 修复说明**: 
- 已更新测试数据SQL，将历史记录ID从 `search_001` 改为 `history_001`, `history_002` 等格式
- 与API测试数据保持一致

**⚠️ 注意**: 
- 如果 `history_001` 已被删除，可以尝试 `history_002`, `history_003` 等
- 或先调用 `GET /api/legal-tools/cases/search-history` 查看实际的历史记录ID

---

### 3. 重置密码接口（已修复 type 不匹配问题）✅

#### 3.1 POST /api/user/reset-password ✅ 已修复

**实际路径**: `POST /api/user/reset-password`  
**状态**: ✅ 已修复，请重新测试

**✅ 修复说明**: 
- **问题**：发送验证码时使用 `type: "reset"`，但重置密码时查询的是 `"reset_password"`，导致找不到验证码
- **修复**：已更新代码，现在支持 `"reset"` 和 `"reset_password"` 两种格式，优先使用 `"reset"`

**⚠️ 重要提示**: 
1. **确保用户存在**：使用此接口前，请确保手机号对应的用户已经注册。如果用户不存在，会返回"用户不存在"错误。
2. **验证码有效期**：验证码有效期为 5 分钟，请在获取后立即使用。
3. **验证码只能使用一次**：每个验证码只能使用一次，使用后会被标记为已使用。如果之前的测试已经使用了验证码，需要重新获取。

**步骤1：确保用户存在（如果用户不存在，先注册）**
```
POST /api/auth/register
Content-Type: application/json

{
  "phone": "13900139000",
  "password": "123456",
  "verificationCode": "注册验证码",
  "nickname": "测试用户"
}
```

**步骤2：发送重置密码验证码**
```
POST /api/auth/send-code
Content-Type: application/json

{
  "phone": "13900139000",
  "type": "reset"
}
```

**步骤3：查看后端控制台获取验证码**
- 调用接口后，立即查看后端控制台
- 找到类似这样的输出：
  ```
  验证码: 322969 (手机号: 13900139000, 类型: reset)
  ```
- **记录下这个验证码**（例如：`322969`）

**步骤4：立即使用验证码重置密码**
```
POST /api/user/reset-password
Content-Type: application/json

{
  "phone": "13800138000",
  "verificationCode": "123456",  // ⚠️ 使用上一步获取的验证码
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

**常见错误及解决方法**:

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `用户不存在` | 手机号对应的用户未注册 | 先使用注册接口创建用户 |
| `验证码无效或已使用，请重新获取验证码` | 验证码已被使用或不存在 | 重新调用 `POST /api/auth/send-code` 获取新验证码 |
| `验证码已过期，请重新获取` | 验证码超过5分钟有效期 | 重新调用 `POST /api/auth/send-code` 获取新验证码 |
| `验证码错误，请检查后重试` | 输入的验证码与数据库中的不匹配 | 检查后端控制台输出的验证码，确保输入正确 |

**⚠️ 重要提示**: 
- ⏰ 验证码有效期为 **5分钟**，请立即使用
- 🔄 如果验证码过期或已使用，需要重新执行步骤2获取新验证码
- ✅ 每次测试都使用**新的验证码**，不要重复使用旧的验证码
- ❌ 每个验证码只能使用一次

---

### 4. 收藏接口（需要先取消收藏）

#### 4.1 POST /api/legal-knowledge/favorites ⚠️ 需要先取消收藏

**实际路径**: `POST /api/legal-knowledge/favorites`  
**状态**: ⚠️ 需要先取消收藏或使用其他ID

**测试数据**:
```json
{
  "regulationId": "reg_001"
}
```

**Headers**:
```
Authorization: Bearer {token}
```

**预期响应**:
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": null
}
```

**⚠️ 失败原因**: 
- **已收藏该法规**：这是正常的业务逻辑验证。测试数据中 `reg_001` 已经被该用户收藏了（fav_001），所以再次添加会返回此错误。

**解决方案（三选一）**：

**方案1：先取消收藏再添加（推荐）**
1. 先调用 `DELETE /api/legal-knowledge/favorites/reg_001` 取消收藏
2. 然后再调用此接口添加收藏

**方案2：使用其他未被收藏的法规ID**
```json
{
  "regulationId": "reg_004"  // 或其他未被收藏的ID
}
```

**方案3：使用不存在的ID（测试错误处理）**
```json
{
  "regulationId": "reg_999"  // 会返回"法规不存在"错误，这是正常的
}
```

---

### 5. 模板下载接口（需要实际文件）

#### 5.1 GET /api/legal-tools/templates/{id}/download ⚠️ 需要实际文件

**实际路径**: `GET /api/legal-tools/templates/{id}/download`  
**状态**: ⚠️ 需要实际文件存在

**测试数据**: 
- Path参数: `id=template_001`
- 注意: 这是一个文件下载接口，响应为文件流

**预期响应**: 
- 成功：文件下载（Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document 或 application/pdf）
- 失败：返回错误信息

**❌ 失败原因**: 
- **模板文件不存在**：测试数据中模板的 `file_url` 是 `/templates/labor_contract.pdf` 这样的路径，但实际文件不存在于服务器上。

**解决方案**：
1. **在服务器上创建对应的文件目录和文件**
   - 创建目录：`/templates/` 或对应路径
   - 将模板文件（如 `labor_contract.pdf`）放到该目录
   
2. **或者修改测试数据中的 `file_url`**
   - 修改数据库中的 `file_url` 为实际存在的文件路径
   
3. **或者使用URL路径**
   - 将 `file_url` 改为 `http://example.com/templates/xxx.pdf` 指向实际存在的文件

**注意**：这是测试环境常见问题，生产环境需要确保模板文件实际存在。如果暂时无法提供实际文件，可以跳过此接口测试。

---

## 📊 测试顺序建议

### 第一步：测试已修复的接口（应该都能成功）⭐

1. ✅ `GET /api/ai-consult/conversations` - 获取对话列表
2. ✅ `GET /api/ai-consult/conversations/conv_001` - 获取对话详情
3. ✅ `DELETE /api/ai-consult/conversations/conv_001` - 删除单个对话
4. ✅ `DELETE /api/ai-consult/conversations/all` - 清空所有对话
5. ✅ `DELETE /api/legal-tools/cases/search-history/history_001` - 删除历史记录
6. ✅ `POST /api/user/reset-password` - 重置密码（已修复 type 不匹配问题）

### 第二步：测试需要特殊处理的接口

7. ⚠️ `POST /api/legal-knowledge/favorites` - 添加收藏（需要先取消收藏）
8. ⚠️ `GET /api/legal-tools/templates/template_001/download` - 下载模板（需要实际文件）

---

## 🔍 常见问题排查

### 问题1：仍然报 Role 枚举错误

**原因**：数据库可能没有正确更新

**解决**：
1. 检查数据库中的 `messages` 表
2. 确认 `role` 字段值为 `USER` 或 `ASSISTANT`（大写）
3. 如果还是小写，手动执行：
   ```sql
   UPDATE messages SET role = 'USER' WHERE role = 'user';
   UPDATE messages SET role = 'ASSISTANT' WHERE role = 'assistant';
   ```

### 问题2：历史记录仍然找不到

**原因**：ID 可能不匹配

**解决**：
1. 先调用 `GET /api/legal-tools/cases/search-history` 查看实际的历史记录ID
2. 使用返回的实际ID进行删除测试

### 问题3：验证码总是无效或已使用

**原因**：验证码过期、已使用，或 type 不匹配（已修复）

**解决**：
1. 确保在获取验证码后 **立即使用**（5分钟内）
2. 每次测试都重新获取新的验证码
3. 检查后端控制台确认验证码是否正确
4. ✅ **已修复**：现在支持 `"reset"` 和 `"reset_password"` 两种格式，使用 `type: "reset"` 发送验证码即可

### 问题4：401 未授权错误

**原因**：Token 过期或未提供

**解决**：
1. 先调用登录接口获取新的 Token
2. 在请求头中添加：`Authorization: Bearer {token}`

---

## 📝 测试结果记录

| 接口 | 状态 | 测试结果 | 备注 |
|------|------|---------|------|
| GET /api/ai-consult/conversations | ⬜ 待测试 | - | 已修复 Role 枚举问题 |
| GET /api/ai-consult/conversations/{id} | ⬜ 待测试 | - | 已修复 Role 枚举问题 |
| DELETE /api/ai-consult/conversations/{id} | ⬜ 待测试 | - | 已修复 Role 枚举问题 |
| DELETE /api/ai-consult/conversations/all | ⬜ 待测试 | - | 已修复 Role 枚举问题 |
| DELETE /api/legal-tools/cases/search-history/{id} | ⬜ 待测试 | - | 已修复 ID 格式问题 |
| POST /api/user/reset-password | ⬜ 待测试 | - | ✅ 已修复 type 不匹配问题 |
| POST /api/legal-knowledge/favorites | ⬜ 待测试 | - | 需要先取消收藏 |
| GET /api/legal-tools/templates/{id}/download | ⬜ 待测试 | - | 需要实际文件存在 |

---

## ✅ 测试完成检查清单

- [ ] AI 咨询相关接口全部测试通过
- [ ] 案例搜索历史接口测试通过
- [ ] 重置密码接口测试通过（✅ 已修复 type 不匹配问题）
- [ ] 收藏接口测试通过（先取消再添加）
- [ ] 模板下载接口测试通过（或确认文件不存在问题）
- [ ] 所有接口的错误信息清晰明确
- [ ] 记录下所有测试结果

---

**最后更新**: 数据库已更新，请按照此文档重新测试

**祝测试顺利！** 🎉

image.png