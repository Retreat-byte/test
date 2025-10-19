# 情绪岛数据库设计文档

## 📋 概述

本文档描述了情绪岛后端系统的数据库设计，基于Spring Boot + MySQL架构，支持用户管理、心情打卡、练习记录、测评报告和成就系统等功能。

## 🗄️ 数据库信息

- **数据库名称**: `emotion_island`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **存储引擎**: `InnoDB`

## 📊 表结构设计

### 1. 用户表 (users)

存储用户基本信息。

| 字段名 | 类型 | 长度 | 是否为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | bigint | 20 | NOT NULL | AUTO_INCREMENT | 用户ID，主键 |
| phone | varchar | 11 | NOT NULL | - | 手机号，唯一 |
| password | varchar | 255 | NOT NULL | - | 密码(加密) |
| nickname | varchar | 50 | NULL | '情绪岛居民' | 昵称 |
| avatar | varchar | 500 | NULL | NULL | 头像URL |
| gender | enum | - | NULL | 'female' | 性别(male/female/other) |
| birthday | date | - | NULL | NULL | 生日 |
| last_login_at | timestamp | - | NULL | NULL | 最后登录时间 |
| login_count | int | 11 | NULL | 0 | 登录次数 |
| status | enum | - | NULL | 'active' | 用户状态(active/inactive/banned) |
| created_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | tinyint | 1 | NOT NULL | 0 | 是否删除(0:否,1:是) |

**索引**:
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_phone` (`phone`)
- KEY `idx_created_at` (`created_at`)
- KEY `idx_deleted` (`deleted`)
- KEY `idx_status` (`status`)

### 2. 心情记录表 (mood_records)

存储用户每日心情打卡数据。

| 字段名 | 类型 | 长度 | 是否为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | bigint | 20 | NOT NULL | AUTO_INCREMENT | 记录ID，主键 |
| user_id | bigint | 20 | NOT NULL | - | 用户ID，外键 |
| mood | varchar | 20 | NOT NULL | - | 心情文字 |
| value | int | 11 | NOT NULL | - | 心情分数(1-10) |
| date | date | - | NOT NULL | - | 打卡日期 |
| timestamp | timestamp | - | NOT NULL | - | 打卡时间 |
| created_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | tinyint | 1 | NOT NULL | 0 | 是否删除(0:否,1:是) |

**索引**:
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_user_date` (`user_id`, `date`)
- KEY `idx_user_id` (`user_id`)
- KEY `idx_date` (`date`)
- KEY `idx_mood` (`mood`)
- KEY `idx_value` (`value`)
- KEY `idx_deleted` (`deleted`)

**外键约束**:
- FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE

### 3. 练习历史表 (practice_history)

存储用户正念呼吸和冥想练习记录。

| 字段名 | 类型 | 长度 | 是否为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | bigint | 20 | NOT NULL | AUTO_INCREMENT | 记录ID，主键 |
| user_id | bigint | 20 | NOT NULL | - | 用户ID，外键 |
| type | enum | - | NOT NULL | - | 练习类型(breathing/meditation) |
| name | varchar | 100 | NOT NULL | - | 练习名称 |
| duration | int | 11 | NOT NULL | - | 持续时长(秒) |
| audio | varchar | 255 | NULL | NULL | 音频文件路径 |
| date | date | - | NOT NULL | - | 练习日期 |
| timestamp | timestamp | - | NOT NULL | - | 练习时间 |
| created_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | tinyint | 1 | NOT NULL | 0 | 是否删除(0:否,1:是) |

**索引**:
- PRIMARY KEY (`id`)
- KEY `idx_user_id` (`user_id`)
- KEY `idx_type` (`type`)
- KEY `idx_date` (`date`)
- KEY `idx_duration` (`duration`)
- KEY `idx_deleted` (`deleted`)

**外键约束**:
- FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE

### 4. 测评历史表 (assessment_history)

存储用户心理测评报告数据。

| 字段名 | 类型 | 长度 | 是否为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | bigint | 20 | NOT NULL | AUTO_INCREMENT | 记录ID，主键 |
| user_id | bigint | 20 | NOT NULL | - | 用户ID，外键 |
| type | enum | - | NOT NULL | - | 测评类型 |
| name | varchar | 100 | NOT NULL | - | 测评名称 |
| score | int | 11 | NOT NULL | - | 测评分数 |
| level | varchar | 100 | NULL | NULL | 结果等级 |
| analysis | text | - | NULL | NULL | 结果分析 |
| factor_scores | json | - | NULL | NULL | 因子分数(JSON格式) |
| date | date | - | NOT NULL | - | 测评日期 |
| timestamp | timestamp | - | NOT NULL | - | 测评时间 |
| created_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted | tinyint | 1 | NOT NULL | 0 | 是否删除(0:否,1:是) |

**索引**:
- PRIMARY KEY (`id`)
- KEY `idx_user_id` (`user_id`)
- KEY `idx_type` (`type`)
- KEY `idx_date` (`date`)
- KEY `idx_score` (`score`)
- KEY `idx_deleted` (`deleted`)

**外键约束**:
- FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE

### 5. 用户成就表 (user_achievements)

存储用户解锁的成就记录。

| 字段名 | 类型 | 长度 | 是否为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | bigint | 20 | NOT NULL | AUTO_INCREMENT | 记录ID，主键 |
| user_id | bigint | 20 | NOT NULL | - | 用户ID，外键 |
| achievement_id | varchar | 50 | NOT NULL | - | 成就ID |
| unlocked_date | date | - | NOT NULL | - | 解锁日期 |
| created_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**:
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`)
- KEY `idx_user_id` (`user_id`)
- KEY `idx_achievement_id` (`achievement_id`)
- KEY `idx_unlocked_date` (`unlocked_date`)

**外键约束**:
- FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE

### 6. 系统配置表 (system_config)

存储系统配置信息。

| 字段名 | 类型 | 长度 | 是否为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | bigint | 20 | NOT NULL | AUTO_INCREMENT | 配置ID，主键 |
| config_key | varchar | 100 | NOT NULL | - | 配置键，唯一 |
| config_value | text | - | NULL | NULL | 配置值 |
| description | varchar | 255 | NULL | NULL | 配置描述 |
| created_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**:
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_config_key` (`config_key`)

### 7. 用户会话表 (user_sessions)

存储用户练习会话信息，支持正念呼吸和冥想练习的会话管理。

| 字段名 | 类型 | 长度 | 是否为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | bigint | 20 | NOT NULL | AUTO_INCREMENT | 会话ID，主键 |
| user_id | bigint | 20 | NOT NULL | - | 用户ID，外键 |
| session_id | varchar | 100 | NOT NULL | - | 会话标识，唯一 |
| session_type | enum | - | NOT NULL | - | 会话类型(practice/meditation/breathing) |
| session_name | varchar | 100 | NOT NULL | - | 会话名称 |
| audio_file | varchar | 255 | NULL | NULL | 音频文件路径 |
| start_time | timestamp | - | NOT NULL | - | 开始时间 |
| end_time | timestamp | - | NULL | NULL | 结束时间 |
| duration | int | 11 | NULL | NULL | 持续时长(秒) |
| status | enum | - | NOT NULL | 'active' | 会话状态(active/completed/cancelled) |
| created_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**:
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_session_id` (`session_id`)
- KEY `idx_user_id` (`user_id`)
- KEY `idx_session_type` (`session_type`)
- KEY `idx_status` (`status`)
- KEY `idx_start_time` (`start_time`)

**外键约束**:
- FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE

### 8. 操作日志表 (operation_logs)

存储系统操作日志。

| 字段名 | 类型 | 长度 | 是否为空 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | bigint | 20 | NOT NULL | AUTO_INCREMENT | 日志ID，主键 |
| user_id | bigint | 20 | NULL | NULL | 用户ID，外键 |
| operation | varchar | 100 | NOT NULL | - | 操作类型 |
| description | varchar | 255 | NULL | NULL | 操作描述 |
| ip_address | varchar | 45 | NULL | NULL | IP地址 |
| user_agent | varchar | 500 | NULL | NULL | 用户代理 |
| request_data | json | - | NULL | NULL | 请求数据 |
| response_data | json | - | NULL | NULL | 响应数据 |
| status | enum | - | NOT NULL | 'success' | 操作状态(success/failure) |
| created_at | timestamp | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- PRIMARY KEY (`id`)
- KEY `idx_user_id` (`user_id`)
- KEY `idx_operation` (`operation`)
- KEY `idx_status` (`status`)
- KEY `idx_created_at` (`created_at`)

**外键约束**:
- FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL

## 📈 视图设计

### 1. 用户统计信息视图 (user_statistics)

提供用户综合统计信息。

```sql
CREATE VIEW `user_statistics` AS
SELECT 
    u.id as user_id,
    u.nickname,
    u.created_at as registration_date,
    DATEDIFF(CURDATE(), u.created_at) as days_from_registration,
    COALESCE(mr.total_checkins, 0) as total_checkins,
    COALESCE(ph.total_practices, 0) as total_practices,
    COALESCE(ah.total_assessments, 0) as total_assessments,
    COALESCE(ua.total_achievements, 0) as total_achievements
FROM users u
LEFT JOIN (SELECT user_id, COUNT(*) as total_checkins FROM mood_records WHERE deleted = 0 GROUP BY user_id) mr ON u.id = mr.user_id
LEFT JOIN (SELECT user_id, COUNT(*) as total_practices FROM practice_history WHERE deleted = 0 GROUP BY user_id) ph ON u.id = ph.user_id
LEFT JOIN (SELECT user_id, COUNT(*) as total_assessments FROM assessment_history WHERE deleted = 0 GROUP BY user_id) ah ON u.id = ah.user_id
LEFT JOIN (SELECT user_id, COUNT(*) as total_achievements FROM user_achievements GROUP BY user_id) ua ON u.id = ua.user_id
WHERE u.deleted = 0;
```

### 2. 心情统计视图 (mood_statistics)

提供用户心情数据统计。

```sql
CREATE VIEW `mood_statistics` AS
SELECT 
    user_id,
    COUNT(*) as total_days,
    AVG(value) as average_score,
    MAX(value) as max_score,
    MIN(value) as min_score,
    COUNT(CASE WHEN value >= 8 THEN 1 END) as happy_days,
    COUNT(CASE WHEN value <= 3 THEN 1 END) as sad_days,
    MAX(date) as last_checkin_date
FROM mood_records 
WHERE deleted = 0 
GROUP BY user_id;
```

### 3. 练习统计视图 (practice_statistics)

提供用户练习数据统计。

```sql
CREATE VIEW `practice_statistics` AS
SELECT 
    user_id,
    COUNT(*) as total_practices,
    SUM(duration) as total_duration_seconds,
    SUM(duration) / 60 as total_duration_minutes,
    COUNT(CASE WHEN type = 'breathing' THEN 1 END) as breathing_count,
    COUNT(CASE WHEN type = 'meditation' THEN 1 END) as meditation_count,
    SUM(CASE WHEN type = 'breathing' THEN duration ELSE 0 END) / 60 as breathing_minutes,
    SUM(CASE WHEN type = 'meditation' THEN duration ELSE 0 END) / 60 as meditation_minutes,
    AVG(duration) as avg_duration_seconds,
    MAX(date) as last_practice_date
FROM practice_history 
WHERE deleted = 0 
GROUP BY user_id;
```

### 4. 测评统计视图 (assessment_statistics)

提供用户测评数据统计。

```sql
CREATE VIEW `assessment_statistics` AS
SELECT 
    user_id,
    COUNT(*) as total_assessments,
    COUNT(CASE WHEN type = 'sds' THEN 1 END) as sds_count,
    COUNT(CASE WHEN type = 'sas' THEN 1 END) as sas_count,
    COUNT(CASE WHEN type = 'apeskPstr' THEN 1 END) as apeskPstr_count,
    COUNT(CASE WHEN type = 'bai' THEN 1 END) as bai_count,
    COUNT(CASE WHEN type = 'psqi' THEN 1 END) as psqi_count,
    COUNT(CASE WHEN type = 'dass21' THEN 1 END) as dass21_count,
    COUNT(CASE WHEN type = 'scl90' THEN 1 END) as scl90_count,
    AVG(score) as average_score,
    MAX(date) as last_assessment_date
FROM assessment_history 
WHERE deleted = 0 
GROUP BY user_id;
```

## 🔧 枚举值说明

### 心情类型 (MoodType)

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

### 练习类型 (PracticeType)

| 类型 | 代码 | 说明 |
|------|------|------|
| 正念呼吸 | breathing | 正念呼吸练习 |
| 冥想音频 | meditation | 冥想音频练习 |

### 测评类型 (AssessmentType)

| 类型 | 代码 | 名称 | 分数范围 |
|------|------|------|----------|
| APESK-PSTR | apeskPstr | APESK-PSTR 心理压力量表 | 0-200分 |
| SAS | sas | SAS 焦虑自评量表 | 20-80分 |
| SDS | sds | SDS 抑郁自评量表 | 20-80分 |
| BAI | bai | BAI 贝克焦虑测试 | 0-63分 |
| PSQI | psqi | PSQI 匹兹堡睡眠质量指数 | 0-21分 |
| DASS-21 | dass21 | DASS-21 抑郁焦虑压力量表 | 0-63分 |
| SCL-90 | scl90 | SCL-90 心理健康自评量表 | 90-450分 |

### 成就类型 (AchievementType)

| 成就ID | 名称 | 描述 | 图标 | 颜色 |
|--------|------|------|------|------|
| first_checkin | 初心者 | 完成第一次打卡 | fa-heart | purple |
| streak_7 | 坚持者 | 连续打卡7天 | fa-calendar-check | blue |
| practice_10 | 呼吸大师 | 完成10次呼吸练习 | fa-wind | green |
| meditation_60 | 冥想达人 | 累计冥想60分钟 | fa-om | purple |
| streak_30 | 情绪管理师 | 连续打卡30天 | fa-trophy | blue |
| assessment_5 | 心理探索者 | 完成5项测评 | fa-star | green |
| checkin_50 | 情绪记录家 | 累计打卡50天 | fa-book | blue |
| assessment_10 | 自我认知者 | 完成10项测评 | fa-brain | purple |
| practice_50 | 正念修行者 | 完成50次练习 | fa-spa | green |

## 🚀 部署说明

### 1. 数据库初始化

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE emotion_island CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 执行建表脚本
mysql -u root -p emotion_island < src/main/resources/sql/schema.sql
```

### 2. 应用配置

修改 `application.properties` 中的数据库连接信息：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/emotion_island?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. 启动应用

```bash
mvn spring-boot:run
```

## 📝 注意事项

1. **数据备份**: 定期备份数据库，建议每日自动备份
2. **索引优化**: 根据实际查询情况调整索引策略
3. **数据清理**: 定期清理过期的操作日志数据
4. **性能监控**: 监控数据库性能，及时优化慢查询
5. **安全配置**: 确保数据库用户权限最小化原则

## 🔄 版本历史

- **v1.0.0** (2024-12-18): 初始版本，包含基础表结构和视图设计
