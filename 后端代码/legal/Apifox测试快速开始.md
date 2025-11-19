# Apifox 测试快速开始指南

> 5分钟快速上手，测试文件审查接口

---

## 🚀 三步快速开始

### 第一步：准备数据库

```bash
# 1. 确保MySQL已启动
# 2. 执行建表脚本（如果还没执行）
mysql -u root -p123456 < src/main/resources/db/schema.sql

# 3. 插入测试数据
mysql -u root -p123456 legal_assistant < src/main/resources/db/apifox_test_data.sql
```

**或者使用 Windows 批处理脚本**：
```cmd
# 双击运行
insert-test-data.cmd
```

### 第二步：启动后端服务

```bash
# 进入后端目录
cd 后端代码/legal

# 启动服务
start-backend.cmd
# 或
mvn spring-boot:run
```

**服务地址**: `http://localhost:8080`

### 第三步：在 Apifox 中测试

#### 3.1 配置环境

1. 创建环境：`法智顾问-本地测试`
2. 设置变量：
   - `baseUrl` = `http://localhost:8080`
   - `token` = (空，登录后自动设置)

#### 3.2 登录获取 Token

**接口**: `POST /api/auth/login`

```json
{
  "phone": "13900139000",
  "password": "123456"
}
```

**后置操作**：提取 `$.data.token` 到环境变量 `token`

#### 3.3 测试文件审查接口

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 上传审查 | POST | `/api/legal-tools/document-review` | 上传文件（form-data，字段名：file） |
| 获取历史 | GET | `/api/legal-tools/document-review/history?page=1&pageSize=10` | 获取审查记录列表 |
| 获取详情 | GET | `/api/legal-tools/document-review/review_001` | 获取单条记录详情 |
| 删除记录 | DELETE | `/api/legal-tools/document-review/review_003` | 删除审查记录 |

**所有接口都需要在 Header 中添加**：
```
Authorization: Bearer {{token}}
```

---

## 📋 测试数据说明

### 测试账号

| 字段 | 值 |
|------|-----|
| 手机号 | `13900139000` |
| 密码 | `123456` |
| 用户ID | `test_user_001` |

### 文件审查记录（已预置）

| ID | 文件名 | 评分 |
|----|--------|------|
| `review_001` | 劳动合同审查.pdf | 85 |
| `review_002` | 解除通知书审查.docx | 65 |
| `review_003` | 保密协议审查.pdf | 90 |

---

## ✅ 测试检查清单

- [ ] 数据库已创建并执行了建表脚本
- [ ] 测试数据已插入（3条文件审查记录）
- [ ] 后端服务已启动（端口8080）
- [ ] Apifox 环境已配置
- [ ] 已登录并获取 Token
- [ ] 已测试上传文件接口
- [ ] 已测试获取历史列表接口（应返回3条记录）
- [ ] 已测试获取详情接口（使用 review_001）
- [ ] 已测试删除接口（使用 review_003）

---

## 🔍 验证测试数据

执行以下 SQL 验证数据：

```sql
-- 检查用户
SELECT id, phone, nickname FROM users WHERE phone = '13900139000';

-- 检查文件审查记录
SELECT id, file_name, overall_score, created_at 
FROM document_reviews 
WHERE user_id = 'test_user_001'
ORDER BY created_at DESC;
```

**预期结果**：
- 用户：1条（test_user_001）
- 文件审查记录：3条（review_001, review_002, review_003）

---

## ❓ 常见问题

### Q: 登录失败，提示"用户不存在"

**解决**：重新执行测试数据脚本
```bash
mysql -u root -p123456 legal_assistant < src/main/resources/db/apifox_test_data.sql
```

### Q: Token 无效或过期

**解决**：重新登录获取新 Token

### Q: 获取历史返回空数组

**解决**：
1. 检查测试数据是否插入成功
2. 确认 Token 对应的用户ID正确

### Q: 文件上传失败

**解决**：
- 确保使用 `form-data` 格式
- 字段名必须是 `file`
- 文件大小 < 10MB
- 文件格式：PDF 或 DOCX

---

## 📚 详细文档

- **完整测试指南**: [Apifox接口测试指南.md](Apifox接口测试指南.md)
- **API文档**: [../前端代码/API接口文档.md](../前端代码/API接口文档.md)
- **数据库设计**: [数据库设计文档.md](数据库设计文档.md)

---

## 🎯 测试流程示例

```
1. 登录 → POST /api/auth/login
   ↓
2. 获取Token（自动保存到环境变量）
   ↓
3. 上传文件审查 → POST /api/legal-tools/document-review
   ↓
4. 获取历史列表 → GET /api/legal-tools/document-review/history
   ↓
5. 获取详情 → GET /api/legal-tools/document-review/review_001
   ↓
6. 删除记录 → DELETE /api/legal-tools/document-review/review_003
   ↓
7. 验证删除 → GET /api/legal-tools/document-review/history（应少1条）
```

---

**祝测试顺利！** 🎉

