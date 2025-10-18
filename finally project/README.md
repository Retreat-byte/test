# 情绪岛 - 后端 API 接口文档

## 📝 概述

本文档描述了情绪岛前端所需的后端 API 接口规范。所有接口均使用 JSON 格式进行数据交换。

**基础URL**: `http://localhost:3000/api` (根据实际部署修改)

**认证方式**: Bearer Token（通过 `Authorization` 请求头传递）

---

## 🔐 用户认证模块 (User API)

### 1. 用户登录
**接口**: `POST /user/login`

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 12345,
      "phone": "13800138000",
      "nickname": "情绪岛用户",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

**失败响应** (400/401):
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

---

### 2. 用户注册
**接口**: `POST /user/register`

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": 12345
  }
}
```

**失败响应** (400):
```json
{
  "success": false,
  "message": "手机号已被注册"
}
```

---

### 3. Token 验证
**接口**: `GET /user/verify`

**请求头**:
```
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "valid": true,
    "userInfo": {
      "id": 12345,
      "phone": "13800138000",
      "nickname": "情绪岛用户"
    }
  }
}
```

---

## 😊 心情打卡模块 (Mood API)

### 1. 提交心情打卡
**接口**: `POST /mood/checkin`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "mood": "开心",
  "value": 10,
  "timestamp": "2024-12-18T10:30:00.000Z",
  "date": "2024-12-18"
}
```

**字段说明**:
- `mood`: 心情文字（"开心"/"微笑"/"平静"/"紧张"/"尴尬"/"难过"/"生气"/"悲伤"）
- `value`: 心情分数（1-10，悲伤=1，开心=10）
- `timestamp`: 打卡时间（ISO 8601格式）
- `date`: 打卡日期（YYYY-MM-DD格式）

**成功响应** (201):
```json
{
  "success": true,
  "message": "打卡成功！",
  "data": {
    "id": 67890,
    "mood": "开心",
    "value": 10,
    "timestamp": "2024-12-18T10:30:00.000Z",
    "date": "2024-12-18"
  }
}
```

**字段说明**:
- `id`: 打卡记录ID

**失败响应** (400):
```json
{
  "success": false,
  "message": "打卡失败，请检查数据"
}
```

---

### 2. 获取今日打卡状态
**接口**: `GET /mood/today`

**请求头**:
```
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "hasCheckedIn": true,
    "moodData": {
      "id": 67890,
      "mood": "开心",
      "value": 10,
      "timestamp": "2024-12-18T10:30:00.000Z",
      "date": "2024-12-18"
    }
  }
}
```

**未打卡时**:
```json
{
  "success": true,
  "data": {
    "hasCheckedIn": false,
    "moodData": null
  }
}
```

---

### 3. 获取心情历史记录
**接口**: `GET /mood/history?days=30`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `days`: 获取最近多少天的记录（默认30天）

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 67890,
      "mood": "开心",
      "value": 10,
      "timestamp": "2024-12-18T10:30:00.000Z",
      "date": "2024-12-18"
    },
    {
      "id": 67889,
      "mood": "平静",
      "value": 6,
      "timestamp": "2024-12-17T09:15:00.000Z",
      "date": "2024-12-17"
    }
  ]
}
```

---

### 4. 获取心情统计数据
**接口**: `GET /mood/statistics`

**请求头**:
```
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "totalDays": 28,
    "recentAverage": 8.1,
    "monthAverageScore": 7.2,
    "trend": "improving"
  }
}
```

**字段说明**:
- `totalDays`: 累计打卡天数
- `recentAverage`: 最近7天平均心情分数（包括今天）。如果最近7天都没有打卡则返回 `100`（前端显示为"---"）
- `monthAverageScore`: 近一个月（30天）平均心情分数。如果最近一个月都没有打卡则返回 `100`（前端显示为"---"）
- `trend`: 趋势（"improving"=改善中，"stable"=稳定，"declining"=下降，"no_data"=无数据）。与上一次打卡的心情相比，如果之前没有打卡则返回 `"no_data"`（前端显示为"---"）

---

### 5. 删除心情记录
**接口**: `DELETE /mood/{moodId}`

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `moodId`: 心情记录ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 📋 测评报告模块 (Assessment API)

### 1. 提交测评报告
**接口**: `POST /assessment/report`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "type": "sds",
  "name": "SDS 抑郁自评量表",
  "score": 65,
  "level": "中度抑郁",
  "analysis": "您目前处于中度抑郁状态。建议找心理专家咨询...",
  "factorScores": null,
  "timestamp": "2024-12-18T14:20:00.000Z",
  "date": "2024-12-18"
}
```

**字段说明**:
- `type`: 测评类型（apeskPstr/sas/sds/bai/psqi/dass21/scl90）
- `name`: 测评名称
- `score`: 测评分数
- `level`: 结果等级（如：轻度焦虑、中度抑郁、睡眠质量较差等）
- `analysis`: 结果分析文字
- `factorScores`: 因子分数（可选，用于 SCL-90、DASS-21 等多因子量表）
- `timestamp`: 测评时间（ISO 8601格式）
- `date`: 测评日期（YYYY-MM-DD格式）

**成功响应** (201):
```json
{
  "success": true,
  "message": "测评报告保存成功",
  "data": {
    "id": "assessment_1703161234567",
    "type": "sds",
    "name": "SDS 抑郁自评量表",
    "score": 65,
    "level": "中度抑郁",
    "analysis": "您目前处于中度抑郁状态...",
    "factorScores": null,
    "timestamp": "2024-12-18T14:20:00.000Z",
    "date": "2024-12-18"
  }
}
```

**失败响应** (400):
```json
{
  "success": false,
  "message": "请提供完整的测评信息"
}
```

---

### 2. 获取测评报告历史
**接口**: `GET /assessment/history?days=90&type=sds&limit=20`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `days`: 获取最近多少天的记录（可选，默认90天）
- `type`: 筛选类型（可选，不传则返回全部类型）
- `limit`: 限制返回数量（可选，默认不限制）

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "assessment_1703161234567",
      "type": "sds",
      "name": "SDS 抑郁自评量表",
      "score": 65,
      "level": "中度抑郁",
      "analysis": "您目前处于中度抑郁状态...",
      "factorScores": null,
      "timestamp": "2024-12-18T14:20:00.000Z",
      "date": "2024-12-18"
    },
    {
      "id": "assessment_1703075234567",
      "type": "sas",
      "name": "SAS 焦虑自评量表",
      "score": 58,
      "level": "轻度焦虑",
      "analysis": "您目前处于轻度焦虑状态...",
      "factorScores": null,
      "timestamp": "2024-12-15T10:15:00.000Z",
      "date": "2024-12-15"
    }
  ]
}
```

---

### 3. 获取指定测评报告详情
**接口**: `GET /assessment/{reportId}`

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `reportId`: 报告ID

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": "assessment_1703161234567",
    "type": "scl90",
    "name": "SCL-90 心理健康自评量表",
    "score": 185,
    "level": "轻度症状",
    "analysis": "您的心理健康状况总体尚可...",
    "factorScores": {
      "躯体化": 1.8,
      "强迫症状": 2.1,
      "人际关系敏感": 2.3,
      "抑郁": 2.0,
      "焦虑": 1.9,
      "敌对": 1.5,
      "恐怖": 1.4,
      "偏执": 1.6,
      "精神病性": 1.7
    },
    "timestamp": "2024-12-18T14:20:00.000Z",
    "date": "2024-12-18"
  }
}
```

---

### 4. 获取测评统计数据
**接口**: `GET /assessment/statistics`

**请求头**:
```
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "totalAssessments": 25,
    "typeCount": {
      "apeskPstr": 3,
      "sas": 5,
      "sds": 4,
      "bai": 2,
      "psqi": 6,
      "dass21": 3,
      "scl90": 2
    },
    "latestReport": {
      "id": "assessment_1703161234567",
      "type": "sds",
      "name": "SDS 抑郁自评量表",
      "score": 65,
      "date": "2024-12-18"
    },
    "last30Days": [
      {
        "date": "2024-11-19",
        "count": 0
      },
      {
        "date": "2024-11-20",
        "count": 1
      },
      ...
    ]
  }
}
```

**字段说明**:
- `totalAssessments`: 总测评次数
- `typeCount`: 各类型测评次数统计
- `latestReport`: 最近一次测评报告
- `last30Days`: 最近30天的测评次数趋势

---

### 5. 删除测评报告
**接口**: `DELETE /assessment/{reportId}`

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `reportId`: 报告ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 📊 测评类型说明

| 测评类型 | 类型标识 | 说明 | 分数范围 |
|---------|---------|------|---------|
| APESK-PSTR 心理压力量表 | `apeskPstr` | 评估心理压力水平 | 0-200分 |
| SAS 焦虑自评量表 | `sas` | 评估焦虑程度 | 20-80分（标准分） |
| SDS 抑郁自评量表 | `sds` | 评估抑郁程度 | 20-80分（标准分） |
| BAI 贝克焦虑测试 | `bai` | 评估焦虑症状 | 0-63分 |
| PSQI 匹兹堡睡眠质量指数 | `psqi` | 评估睡眠质量 | 0-21分 |
| DASS-21 抑郁焦虑压力量表 | `dass21` | 评估抑郁、焦虑、压力 | 0-63分（三个维度） |
| SCL-90 心理健康自评量表 | `scl90` | 全面评估心理健康 | 90-450分 |

**注意**: 
- 不同测评的分数范围和评级标准不同
- `factorScores` 字段用于存储多因子量表的各因子分数（如 SCL-90、DASS-21）
- 对于单一分数的量表，`factorScores` 为 `null`

---

## 🧘 练习记录模块 (Practice API)

### 1. 提交练习记录
**接口**: `POST /practice/record`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "type": "breathing",
  "name": "正念呼吸",
  "duration": 300,
  "audio": null,
  "timestamp": "2024-12-18T10:30:00.000Z",
  "date": "2024-12-18"
}
```

**字段说明**:
- `type`: 练习类型（breathing=正念呼吸，meditation=冥想音频）
- `name`: 练习名称（如：正念呼吸、晨间冥想、森林冥想等）
- `duration`: 持续时长（秒）
- `audio`: 音频文件路径（仅冥想类型需要，呼吸练习为null）
- `timestamp`: 练习时间（ISO 8601格式）
- `date`: 练习日期（YYYY-MM-DD格式）

**成功响应** (201):
```json
{
  "success": true,
  "message": "练习记录保存成功",
  "data": {
    "id": "practice_1703001234567",
    "type": "breathing",
    "name": "正念呼吸",
    "duration": 300,
    "audio": null,
    "timestamp": "2024-12-18T10:30:00.000Z",
    "date": "2024-12-18"
  }
}
```

**失败响应** (400):
```json
{
  "success": false,
  "message": "请提供完整的练习信息"
}
```

---

### 2. 获取练习历史记录
**接口**: `GET /practice/history?days=30&type=breathing&limit=50`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `days`: 获取最近多少天的记录（可选，默认30天）
- `type`: 筛选类型（可选，breathing/meditation，不传则返回全部）
- `limit`: 限制返回数量（可选，默认不限制）

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "practice_1703001234567",
      "type": "breathing",
      "name": "正念呼吸",
      "duration": 300,
      "audio": null,
      "timestamp": "2024-12-18T10:30:00.000Z",
      "date": "2024-12-18"
    },
    {
      "id": "practice_1703001234566",
      "type": "meditation",
      "name": "晨间冥想",
      "duration": 600,
      "audio": "music/morning.mp3",
      "timestamp": "2024-12-17T07:00:00.000Z",
      "date": "2024-12-17"
    },
    {
      "id": "practice_1703001234565",
      "type": "meditation",
      "name": "森林冥想",
      "duration": 900,
      "audio": "music/forest.mp3",
      "timestamp": "2024-12-16T14:30:00.000Z",
      "date": "2024-12-16"
    }
  ]
}
```

**字段说明**:
- `id`: 练习记录ID
- `type`: 练习类型
- `name`: 练习名称
- `duration`: 持续时长（秒）
- `audio`: 音频文件路径
- `timestamp`: 练习时间
- `date`: 练习日期

---

### 3. 获取练习统计数据
**接口**: `GET /practice/statistics`

**请求头**:
```
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "totalPractices": 156,
    "breathingCount": 68,
    "meditationCount": 88,
    "totalMinutes": 2340,
    "breathingMinutes": 680,
    "meditationMinutes": 1660,
    "avgDuration": 15,
    "favoriteType": "meditation",
    "last7Days": [
      {
        "date": "2024-12-12",
        "count": 2
      },
      {
        "date": "2024-12-13",
        "count": 3
      },
      {
        "date": "2024-12-14",
        "count": 1
      },
      {
        "date": "2024-12-15",
        "count": 2
      },
      {
        "date": "2024-12-16",
        "count": 3
      },
      {
        "date": "2024-12-17",
        "count": 2
      },
      {
        "date": "2024-12-18",
        "count": 1
      }
    ]
  }
}
```

**字段说明**:
- `totalPractices`: 总练习次数
- `breathingCount`: 呼吸练习次数
- `meditationCount`: 冥想练习次数
- `totalMinutes`: 累计练习时长（分钟）
- `breathingMinutes`: 累计呼吸时长（分钟）
- `meditationMinutes`: 累计冥想时长（分钟）
- `avgDuration`: 平均每次练习时长（分钟）
- `favoriteType`: 最常练习的类型（breathing/meditation/both/none）
- `last7Days`: 最近7天的练习次数统计

---

### 4. 删除练习记录
**接口**: `DELETE /practice/{practiceId}`

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `practiceId`: 练习记录ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

## 🎯 练习类型说明

### 正念呼吸练习 (breathing)
- **类型标识**: `breathing`
- **常见名称**: 正念呼吸、深呼吸练习
- **记录方式**: 从点击"开始练习"按钮到点击"停止"按钮
- **audio字段**: 始终为 `null`
- **典型时长**: 3-10分钟

### 冥想音频练习 (meditation)
- **类型标识**: `meditation`
- **常见名称**: 
  - 晨间冥想 (morning.mp3)
  - 森林冥想 (forest.mp3)
  - 海浪冥想 (sea.mp3)
  - 睡前冥想 (sleep.mp3)
  - 山野冥想 (mountain.mp3)
  - 放松冥想 (relax.mp3)
  - 星空冥想 (star_night.mp3)
  - 自然冥想 (nature.mp3)
- **记录方式**: 从点击播放按钮到停止播放
- **audio字段**: 音频文件路径（如：`music/morning.mp3`）
- **典型时长**: 5-20分钟

---

## 👤 个人设置模块 (Profile API)

### 1. 获取用户完整信息
**接口**: `GET /profile/info`

**请求头**:
```
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "phone": "13800138000",
    "nickname": "情绪岛居民",
    "avatar": "https://example.com/avatar.jpg",
    "gender": "female",
    "birthday": "1995-06-15",
    "registrationDate": "2024-01-01",
    "daysFromRegistration": 15,
    "statistics": {
      "totalCheckins": 28,
      "totalPractices": 156,
      "totalAssessments": 8
    }
  }
}
```

**字段说明**:
- `id`: 用户ID
- `phone`: 手机号
- `nickname`: 昵称
- `avatar`: 头像URL（可为null）
- `gender`: 性别（male/female/other）
- `birthday`: 生日（YYYY-MM-DD格式）
- `registrationDate`: 注册日期
- `daysFromRegistration`: 注册到今天的天数
- `statistics.totalCheckins`: 累计打卡天数
- `statistics.totalPractices`: 累计练习次数
- `statistics.totalAssessments`: 完成的测评数量

---

### 2. 更新个人设置
**接口**: `PUT /profile/update`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "nickname": "新昵称",
  "gender": "female",
  "birthday": "1995-06-15"
}
```

**字段说明**:
- `nickname`: 昵称（可选，1-20个字符）
- `gender`: 性别（可选，male/female/other）
- `birthday`: 生日（可选，YYYY-MM-DD格式）

**成功响应** (200):
```json
{
  "success": true,
  "message": "设置保存成功",
  "data": {
    "nickname": "新昵称",
    "gender": "female",
    "birthday": "1995-06-15",
    "updatedAt": "2024-12-18T10:30:00.000Z"
  }
}
```

**失败响应** (400):
```json
{
  "success": false,
  "message": "昵称不能为空"
}
```

---

### 3. 上传头像
**接口**: `POST /profile/avatar`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求体**:
- `avatar`: 图片文件（支持JPG、PNG、GIF格式，最大2MB）

**成功响应** (200):
```json
{
  "success": true,
  "message": "头像上传成功",
  "data": {
    "avatar": "https://example.com/avatars/user_12345.jpg"
  }
}
```

**失败响应** (400):
```json
{
  "success": false,
  "message": "图片大小不能超过2MB"
}
```

---

## 🏆 成就勋章模块 (Achievement API)

### 1. 获取成就列表
**接口**: `GET /profile/achievements`

**请求头**:

```
Authorization: Bearer {token}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "first_checkin",
      "name": "初心者",
      "description": "完成第一次打卡",
      "icon": "fa-heart",
      "color": "purple",
      "unlocked": true,
      "unlockedDate": "2024-12-01",
      "progress": 1,
      "total": 1
    },
    {
      "id": "streak_7",
      "name": "坚持者",
      "description": "连续打卡7天",
      "icon": "fa-calendar-check",
      "color": "blue",
      "unlocked": true,
      "unlockedDate": "2024-12-05",
      "progress": 7,
      "total": 7
    },
    {
      "id": "streak_30",
      "name": "情绪管理师",
      "description": "连续打卡30天",
      "icon": "fa-trophy",
      "color": "blue",
      "unlocked": false,
      "unlockedDate": null,
      "progress": 15,
      "total": 30
    }
  ]
}
```

**字段说明**:
- `id`: 成就唯一标识
- `name`: 成就名称
- `description`: 成就描述
- `icon`: FontAwesome图标类名
- `color`: 颜色主题（purple/blue/green）
- `unlocked`: 是否已解锁
- `unlockedDate`: 解锁日期（未解锁为null）
- `progress`: 当前进度
- `total`: 总进度

**预定义成就列表**:

| 成就ID | 名称 | 描述 | 解锁条件 |
|--------|------|------|----------|
| `first_checkin` | 初心者 | 完成第一次打卡 | 打卡1次 |
| `streak_7` | 坚持者 | 连续打卡7天 | 连续打卡7天 |
| `practice_10` | 呼吸大师 | 完成10次呼吸练习 | 完成10次练习 |
| `meditation_60` | 冥想达人 | 累计冥想60分钟 | 累计冥想60分钟 |
| `streak_30` | 情绪管理师 | 连续打卡30天 | 连续打卡30天 |
| `assessment_5` | 心理探索者 | 完成5项测评 | 完成5项测评 |
| `checkin_50` | 情绪记录家 | 累计打卡50天 | 打卡50次 |
| `assessment_10` | 自我认知者 | 完成10项测评 | 完成10项测评 |
| `practice_50` | 正念修行者 | 完成50次练习 | 完成50次练习 |

---

## 📊 心情分数对照表

| 心情 | 分数 | 说明 |
|------|------|------|
| 悲伤 | 1 | 非常低落、绝望 |
| 生气 | 2 | 愤怒、烦躁 |
| 难过 | 3 | 伤心、失落 |
| 尴尬 | 4 | 不自在、局促 |
| 紧张 | 5 | 焦虑、压力 |
| 平静 | 6 | 平和、安宁 |
| 微笑 | 8 | 愉悦、满足 |
| 开心 | 10 | 非常快乐、兴奋 |

---

## 🔧 开发模式说明

### 前端配置
在 `api/user.js`、`api/mood.js`、`api/profile.js`、`api/practice.js` 和 `api/assessment.js` 中：
```javascript
isDevelopment: true  // 开发模式，使用模拟数据
isDevelopment: false // 生产模式，调用真实API
```

### 开发模式特点
- ✅ 使用 localStorage 存储数据
- ✅ 模拟网络请求延迟
- ✅ 提供完整的数据结构示例
- ✅ 无需后端即可测试前端功能

### 生产模式切换
1. 修改 `baseURL` 为实际后端地址
2. 将 `isDevelopment` 设为 `false`
3. 确保后端 API 按照本文档规范实现

---

## 🛠️ 错误处理

### 统一错误响应格式
```json
{
  "success": false,
  "message": "错误描述",
  "errorCode": "ERROR_CODE"
}
```

### 常见HTTP状态码
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权（token无效或过期）
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器内部错误


## 📝 数据库设计建议

### 用户表 (users)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(11) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(255),
  gender VARCHAR(10) DEFAULT 'female',
  birthday DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 心情记录表 (mood_records)
```sql
CREATE TABLE mood_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  mood VARCHAR(20) NOT NULL,
  value INT NOT NULL,
  date DATE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_date (user_id, date)
);
```

### 练习历史表 (practice_history)
```sql
CREATE TABLE practice_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT '练习类型: breathing/meditation',
  name VARCHAR(100) NOT NULL COMMENT '练习名称',
  duration INT NOT NULL COMMENT '持续时长(秒)',
  audio VARCHAR(255) DEFAULT NULL COMMENT '音频文件路径',
  date DATE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_date (user_id, date),
  INDEX idx_type (type)
);
```

### 测评历史表 (assessment_history)
```sql
CREATE TABLE assessment_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT '测评类型: apeskPstr/sas/sds/bai/psqi/dass21/scl90',
  name VARCHAR(100) NOT NULL COMMENT '测评名称',
  score INT NOT NULL COMMENT '测评分数',
  level VARCHAR(100) DEFAULT NULL COMMENT '结果等级',
  analysis TEXT DEFAULT NULL COMMENT '结果分析',
  factor_scores JSON DEFAULT NULL COMMENT '因子分数(JSON格式)',
  date DATE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_date (user_id, date),
  INDEX idx_type (type)
);
```

### 用户成就表 (user_achievements)
```sql
CREATE TABLE user_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  achievement_id VARCHAR(50) NOT NULL,
  unlocked_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);
```




