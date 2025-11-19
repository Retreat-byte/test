# 法智顾问 API 接口文档

## 1. 概述

### 1.1 基础信息
- **Base URL**: `http://localhost:8080/api`
- **请求格式**: JSON
- **响应格式**: JSON
- **字符编码**: UTF-8

### 1.2 通用响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 1.3 认证方式
使用 Bearer Token 认证，在请求头中添加：
```
Authorization: Bearer {token}
```

---

## 2. 认证相关接口 (/auth)

### 2.1 用户登录
- **接口**: `POST /auth/login`
- **描述**: 用户使用手机号和密码登录
- **是否需要认证**: 否

**请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "user_001",
      "phone": "13800138000",
      "nickname": "张三",
      "avatar": "https://example.com/avatar.jpg",
      "email": "zhangsan@example.com",
      "gender": "male"
    }
  }
}
```

### 2.2 用户注册
- **接口**: `POST /auth/register`
- **描述**: 用户注册新账号
- **是否需要认证**: 否

**请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456",
  "nickname": "新用户",
  "email": "user@example.com",
  "gender": "unknown",
  "verificationCode": "123456"
}
```

### 2.3 发送验证码
- **接口**: `POST /auth/send-code`
- **描述**: 发送短信验证码
- **是否需要认证**: 否

**请求参数**:
```json
{
  "phone": "13800138000",
  "type": "register"
}
```

### 2.4 登出
- **接口**: `POST /auth/logout`
- **是否需要认证**: 是

---

## 3. AI咨询接口 (/ai-consult)

### 3.1 创建新对话
- **接口**: `POST /ai-consult/conversations`
- **是否需要认证**: 是

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "conversationId": "conv_001",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### 3.2 发送消息
- **接口**: `POST /ai-consult/messages`
- **是否需要认证**: 是

**请求参数**:
```json
{
  "conversationId": "conv_001",
  "message": "我想咨询劳动合同纠纷",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "messageId": "msg_001",
    "reply": "您好，关于劳动合同纠纷...",
    "timestamp": "2024-01-01T10:00:05Z"
  }
}
```

### 3.3 获取对话历史
- **接口**: `GET /ai-consult/conversations`
- **是否需要认证**: 是
- **查询参数**: `page=1&pageSize=20`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "conversationId": "conv_001",
        "title": "劳动合同纠纷咨询",
        "lastMessage": "感谢您的咨询",
        "messageCount": 10,
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-01T11:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

### 3.4 获取对话详情
- **接口**: `GET /ai-consult/conversations/{conversationId}`
- **是否需要认证**: 是

### 3.5 删除对话
- **接口**: `DELETE /ai-consult/conversations/{conversationId}`
- **是否需要认证**: 是

### 3.6 清空所有对话
- **接口**: `DELETE /ai-consult/conversations/all`
- **是否需要认证**: 是

---

## 4. 法律工具接口 (/legal-tools)

### 4.1 法律计算器

#### 4.1.1 经济补偿金计算
- **接口**: `POST /legal-tools/calculator/compensation`

**请求参数**:
```json
{
  "monthlyWage": 8000,
  "workYears": 5,
  "workMonths": 3,
  "calculationType": "normal"
}
```

#### 4.1.2 工伤赔偿计算
- **接口**: `POST /legal-tools/calculator/work-injury`

#### 4.1.3 诉讼费计算
- **接口**: `POST /legal-tools/calculator/litigation-fee`

#### 4.1.4 违约金计算
- **接口**: `POST /legal-tools/calculator/penalty`

### 4.2 文件审查

#### 4.2.1 上传并审查文件
- **接口**: `POST /legal-tools/document-review`
- **Content-Type**: `multipart/form-data`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "reviewId": "review_001",
    "fileName": "合同.pdf",
    "suggestions": [
      {
        "type": "warning",
        "title": "违约责任条款不明确",
        "description": "第5条违约责任条款描述过于笼统...",
        "severity": "medium"
      }
    ],
    "overallScore": 75,
    "reviewTime": "2024-01-01T10:00:00Z"
  }
}
```

#### 4.2.2 获取审查历史
- **接口**: `GET /legal-tools/document-review/history`
- **查询参数**: `page=1&pageSize=10`

### 4.3 文书模板

#### 4.3.1 获取模板列表
- **接口**: `GET /legal-tools/templates`
- **查询参数**: `category=劳动合同&keyword=&page=1&pageSize=12`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "templateId": "tpl_001",
        "title": "劳动合同模板",
        "description": "标准劳动合同模板，适用于一般企业",
        "category": "劳动合同",
        "downloadCount": 1523,
        "fileSize": "256KB",
        "previewUrl": "https://example.com/preview/tpl_001.pdf"
      }
    ],
    "total": 120
  }
}
```

#### 4.3.2 下载模板
- **接口**: `GET /legal-tools/templates/{templateId}/download`
- **响应**: 返回PDF文件流

#### 4.3.3 记录下载
- **接口**: `POST /legal-tools/templates/download-record`

#### 4.3.4 获取下载历史
- **接口**: `GET /legal-tools/templates/download-history`

### 4.4 案例检索

#### 4.4.1 搜索案例
- **接口**: `POST /legal-tools/cases/search`

**请求参数**:
```json
{
  "keyword": "劳动争议",
  "caseType": "民事案件",
  "court": "上海市闵行区人民法院",
  "dateRange": {
    "start": "2020-01-01",
    "end": "2024-01-01"
  },
  "page": 1,
  "pageSize": 10
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "caseId": "case_001",
        "title": "上海市闵行区某太阳能电力公司与陈某劳动争议纠纷调解案",
        "caseNumber": "(2021)沪0112民初12345号",
        "caseType": "劳动争议",
        "publishDate": "2021-05-28",
        "court": "上海市闵行区人民法院",
        "content": {
          "sections": [
            {
              "title": "案情简介",
              "content": "陈某于2018年入职..."
            },
            {
              "title": "争议焦点",
              "content": "1. 是否存在劳动关系..."
            }
          ]
        }
      }
    ],
    "total": 156
  }
}
```

#### 4.4.2 获取所有案例
- **接口**: `GET /legal-tools/cases`
- **查询参数**: `page=1&pageSize=10`

#### 4.4.3 获取案例详情
- **接口**: `GET /legal-tools/cases/{caseId}`

#### 4.4.4 记录搜索历史
- **接口**: `POST /legal-tools/cases/search-history`

---

## 5. 法律知识库接口 (/legal-knowledge)

### 5.1 获取法规列表
- **接口**: `GET /legal-knowledge/regulations`
- **查询参数**: `category=宪法&keyword=&page=1&pageSize=12`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "regulationId": "reg_001",
        "title": "中华人民共和国宪法",
        "articleCount": 1260,
        "effectiveDate": "2021-01-01",
        "updateDate": "2020-05-28",
        "category": "宪法",
        "status": "有效"
      }
    ],
    "total": 3500
  }
}
```

### 5.2 搜索法规
- **接口**: `POST /legal-knowledge/regulations/search`

### 5.3 获取法规详情
- **接口**: `GET /legal-knowledge/regulations/{regulationId}`

### 5.4 获取法规全文
- **接口**: `GET /legal-knowledge/regulations/{regulationId}/content`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "regulationId": "reg_001",
    "title": "中华人民共和国宪法",
    "content": "<html>...",
    "format": "html"
  }
}
```

### 5.5 收藏法规
- **接口**: `POST /legal-knowledge/favorites`

### 5.6 取消收藏
- **接口**: `DELETE /legal-knowledge/favorites/{regulationId}`

### 5.7 获取收藏列表
- **接口**: `GET /legal-knowledge/favorites`

### 5.8 检查收藏状态
- **接口**: `GET /legal-knowledge/favorites/check/{regulationId}`

---

## 6. 用户中心接口 (/user)

### 6.1 获取用户信息
- **接口**: `GET /user/profile`

### 6.2 更新用户信息
- **接口**: `PUT /user/profile`

### 6.3 上传头像
- **接口**: `POST /user/avatar`
- **Content-Type**: `multipart/form-data`

### 6.4 获取统计数据
- **接口**: `GET /user/statistics`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "toolUsageCount": 45,
    "documentDownloadCount": 12,
    "regulationFavoriteCount": 8,
    "consultationCount": 23
  }
}
```

### 6.5 获取最近活动
- **接口**: `GET /user/activities/recent`
- **查询参数**: `limit=5`

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "activityId": "act_001",
      "type": "tool_usage",
      "title": "使用了经济补偿金计算器",
      "description": "计算结果：40000元",
      "timestamp": "2024-01-01T10:00:00Z"
    },
    {
      "activityId": "act_002",
      "type": "document_download",
      "title": "下载了劳动合同模板",
      "timestamp": "2024-01-01T09:30:00Z"
    }
  ]
}
```

### 6.6 获取工具使用记录
- **接口**: `GET /user/tool-usage`
- **查询参数**: `toolType=calculator&page=1&pageSize=10`

---

## 7. 数据库设计建议

### 7.1 用户表 (users)
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  phone VARCHAR(11) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(255),
  email VARCHAR(100),
  gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
);
```

### 7.2 对话表 (conversations)
```sql
CREATE TABLE conversations (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  first_message TEXT,
  message_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id)
);
```

### 7.3 消息表 (messages)
```sql
CREATE TABLE messages (
  id VARCHAR(50) PRIMARY KEY,
  conversation_id VARCHAR(50) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id)
);
```

### 7.4 法律法规表 (legal_regulations)
```sql
CREATE TABLE legal_regulations (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  article_count INT,
  category VARCHAR(50),
  effective_date DATE,
  update_date DATE,
  status VARCHAR(20),
  content LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_title (title),
  FULLTEXT idx_fulltext (title, content)
);
```

### 7.5 案例表 (legal_cases)
```sql
CREATE TABLE legal_cases (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  case_number VARCHAR(100),
  case_type VARCHAR(50),
  court VARCHAR(100),
  publish_date DATE,
  content JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_case_type (case_type),
  INDEX idx_court (court),
  INDEX idx_publish_date (publish_date),
  FULLTEXT idx_title (title)
);
```
json格式：
复杂版：
{
  "basic_info": {
    "parties": {
      "plaintiff": "陈某",
      "defendant": "某太阳能电力公司"
    },
    "case_cause": "劳动争议",
    "dispute_amount": "50567元"
  },
  "sections": [
    {
      "section_title": "案情简介",
      "section_content": "2011年7月某日，陈某进入某太阳能电力公司工作，双方签订劳动合同，约定陈某担任生产主管，月工资4500元。2022年8月，公司因经营困难决定裁员，向陈某发出解除劳动合同通知。陈某要求公司支付经济补偿金，双方协商未果，遂向调解委员会申请调解。",
      "order": 1
    },
    {
      "section_title": "争议焦点",
      "section_content": "1. 公司解除劳动合同是否符合法律规定；\n2. 经济补偿金的计算标准和金额；\n3. 补偿金的支付时间和方式。",
      "order": 2
    },
    {
      "section_title": "调解过程",
      "section_content": "调委会受理该案后，立即派出调解员开展调解工作。调解员分别听取双方陈述，查明案件事实，并组织双方进行面对面协商。经过三次调解，双方就经济补偿金金额、支付方式等达成一致意见。",
      "order": 3
    },
    {
      "section_title": "法律依据",
      "section_content": "《中华人民共和国劳动合同法》第四十条、第四十六条、第四十七条规定，用人单位因经营困难需要裁减人员的，应当提前三十日通知劳动者或者额外支付一个月工资，并向劳动者支付经济补偿。经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。",
      "order": 4
    },
    {
      "section_title": "调解结果",
      "section_content": "双方签订调解协议：\n1. 公司于2022年10月某日一次性支付陈某经济补偿金50567元；\n2. 公司为陈某出具解除劳动合同证明，并办理相关手续；\n3. 双方就劳动关系解除不再有其他争议。",
      "order": 5
    },
    {
      "section_title": "案例点评",
      "section_content": "本案是一起因公司发生严重经营困难后在裁员过程中发生的纠纷。调解员通过耐心细致的工作，帮助双方理清法律关系，最终达成协议。本案的成功调解为类似案件提供了借鉴。提醒企业在裁员时应严格遵守法律规定，依法支付经济补偿；劳动者也应通过合法途径维护自身权益。",
      "order": 6
    }
  ],
  "keywords": ["劳动争议", "经济补偿金", "裁员", "调解"],
  "related_laws": [
    "《中华人民共和国劳动合同法》第四十条",
    "《中华人民共和国劳动合同法》第四十六条",
    "《中华人民共和国劳动合同法》第四十七条"
  ],
  "attachments": [
    {
      "type": "document",
      "name": "调解协议书",
      "url": "/files/agreement_xxx.pdf"
    }
  ]
}

简化版
[
  {
    "section_title": "案情简介",
    "section_content": "案件的基本情况描述..."
  },
  {
    "section_title": "调解结果",
    "section_content": "调解的最终结果..."
  }
]


### 7.6 文书模板表 (document_templates)
```sql
CREATE TABLE document_templates (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  file_url VARCHAR(255),
  file_size BIGINT,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);
```

### 7.7 收藏表 (favorites)
```sql
CREATE TABLE favorites (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  regulation_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (regulation_id) REFERENCES legal_regulations(id),
  UNIQUE KEY uk_user_regulation (user_id, regulation_id)
);
```

### 7.8 工具使用记录表 (tool_usage_records)
```sql
CREATE TABLE tool_usage_records (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  tool_type VARCHAR(50) NOT NULL,
  tool_name VARCHAR(100),
  input_data JSON,
  result_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_tool (user_id, tool_type)
);
```

### 7.9 下载记录表 (download_records)
```sql
CREATE TABLE download_records (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  template_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (template_id) REFERENCES document_templates(id),
  INDEX idx_user_id (user_id)
);
```

### 7.10 文件审查记录表 (document_reviews)
```sql
CREATE TABLE document_reviews (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_url VARCHAR(255),
  suggestions JSON,
  overall_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id)
);
```

---

## 8. 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 9. 错误响应格式

```json
{
  "code": 400,
  "message": "手机号格式错误",
  "data": null
}
```

---

**文档版本**: v1.0  
**最后更新**: 2024-01-01  
**维护者**: 前端开发团队
