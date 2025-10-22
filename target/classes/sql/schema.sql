-- 情绪岛数据库设计
-- 基于Spring Boot + MySQL
-- 创建时间: 2024-12-18

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `emotion_island` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `emotion_island`;

-- =============================================
-- 1. 用户表 (users)
-- =============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `phone` varchar(11) NOT NULL COMMENT '手机号',
  `password` varchar(255) NOT NULL COMMENT '密码(加密)',
  `nickname` varchar(50) DEFAULT '情绪岛居民' COMMENT '昵称',
  `avatar` MEDIUMTEXT DEFAULT NULL COMMENT '头像URL（支持Base64编码的图片）',
  `gender` enum('male','female','other') DEFAULT 'female' COMMENT '性别',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `login_count` int(11) DEFAULT '0' COMMENT '登录次数',
  `status` enum('active','inactive','banned') DEFAULT 'active' COMMENT '用户状态',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_deleted` (`deleted`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 2. 心情记录表 (mood_records)
-- =============================================
DROP TABLE IF EXISTS `mood_records`;
CREATE TABLE `mood_records` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `mood` varchar(20) NOT NULL COMMENT '心情文字(开心/微笑/平静/紧张/尴尬/难过/生气/悲伤)',
  `value` int(11) NOT NULL COMMENT '心情分数(1-10)',
  `date` date NOT NULL COMMENT '打卡日期',
  `timestamp` timestamp NOT NULL COMMENT '打卡时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_date` (`date`),
  KEY `idx_mood` (`mood`),
  KEY `idx_value` (`value`),
  KEY `idx_deleted` (`deleted`),
  KEY `idx_user_date` (`user_id`, `date`),
  CONSTRAINT `fk_mood_records_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心情记录表';

-- =============================================
-- 3. 练习历史表 (practice_history)
-- =============================================
DROP TABLE IF EXISTS `practice_history`;
CREATE TABLE `practice_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `type` enum('breathing','meditation','relaxation') NOT NULL COMMENT '练习类型(breathing=正念呼吸,meditation=冥想音频,relaxation=放松练习)',
  `name` varchar(100) NOT NULL COMMENT '练习名称',
  `duration` int(11) NOT NULL COMMENT '持续时长(秒)',
  `audio` varchar(255) DEFAULT NULL COMMENT '音频文件路径(仅冥想类型需要)',
  `date` date NOT NULL COMMENT '练习日期',
  `timestamp` timestamp NOT NULL COMMENT '练习时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_date` (`date`),
  KEY `idx_duration` (`duration`),
  KEY `idx_deleted` (`deleted`),
  CONSTRAINT `fk_practice_history_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='练习历史表';

-- =============================================
-- 4. 测评历史表 (assessment_history)
-- =============================================
DROP TABLE IF EXISTS `assessment_history`;
CREATE TABLE `assessment_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `type` enum('apeskPstr','sas','sds','bai','psqi','dass21','scl90') NOT NULL COMMENT '测评类型',
  `name` varchar(100) NOT NULL COMMENT '测评名称',
  `score` int(11) NOT NULL COMMENT '测评分数',
  `level` varchar(100) DEFAULT NULL COMMENT '结果等级',
  `analysis` text DEFAULT NULL COMMENT '结果分析',
  `factor_scores` json DEFAULT NULL COMMENT '因子分数(JSON格式,用于SCL-90、DASS-21等)',
  `date` date NOT NULL COMMENT '测评日期',
  `timestamp` timestamp NOT NULL COMMENT '测评时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除(0:否,1:是)',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_date` (`date`),
  KEY `idx_score` (`score`),
  KEY `idx_deleted` (`deleted`),
  CONSTRAINT `fk_assessment_history_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测评历史表';

-- =============================================
-- 5. 用户成就表 (user_achievements)
-- =============================================
DROP TABLE IF EXISTS `user_achievements`;
CREATE TABLE `user_achievements` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `achievement_id` varchar(50) NOT NULL COMMENT '成就ID',
  `unlocked_date` date NOT NULL COMMENT '解锁日期',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_achievement` (`user_id`,`achievement_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_achievement_id` (`achievement_id`),
  KEY `idx_unlocked_date` (`unlocked_date`),
  CONSTRAINT `fk_user_achievements_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户成就表';

-- =============================================
-- 6. 系统配置表 (system_config)
-- =============================================
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text DEFAULT NULL COMMENT '配置值',
  `description` varchar(255) DEFAULT NULL COMMENT '配置描述',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- =============================================
-- 7. 用户会话表 (user_sessions)
-- =============================================
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `session_id` varchar(100) NOT NULL COMMENT '会话标识',
  `session_type` enum('practice','meditation','breathing') NOT NULL COMMENT '会话类型',
  `session_name` varchar(100) NOT NULL COMMENT '会话名称',
  `audio_file` varchar(255) DEFAULT NULL COMMENT '音频文件路径',
  `start_time` timestamp NOT NULL COMMENT '开始时间',
  `end_time` timestamp NULL DEFAULT NULL COMMENT '结束时间',
  `duration` int(11) DEFAULT NULL COMMENT '持续时长(秒)',
  `status` enum('active','completed','cancelled') DEFAULT 'active' COMMENT '会话状态',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_id` (`session_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_type` (`session_type`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会话表';

-- =============================================
-- 8. 操作日志表 (operation_logs)
-- =============================================
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` bigint(20) DEFAULT NULL COMMENT '用户ID',
  `operation` varchar(100) NOT NULL COMMENT '操作类型',
  `description` varchar(255) DEFAULT NULL COMMENT '操作描述',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `request_data` json DEFAULT NULL COMMENT '请求数据',
  `response_data` json DEFAULT NULL COMMENT '响应数据',
  `status` enum('success','failure') NOT NULL DEFAULT 'success' COMMENT '操作状态',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_operation` (`operation`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_operation_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- =============================================
-- 插入初始数据
-- =============================================

-- 插入系统配置
INSERT INTO `system_config` (`config_key`, `config_value`, `description`) VALUES
('app_name', '情绪岛', '应用名称'),
('app_version', '1.0.0', '应用版本'),
('max_avatar_size', '2097152', '头像最大大小(字节)'),
('supported_avatar_types', 'image/jpeg,image/jpg,image/png,image/gif', '支持的头像类型'),
('mood_score_mapping', '{"悲伤":1,"生气":2,"难过":3,"尴尬":4,"紧张":5,"平静":6,"微笑":8,"开心":10}', '心情分数映射'),
('achievement_rules', '{"first_checkin":{"name":"初心者","description":"完成第一次打卡","icon":"fa-heart","color":"purple","condition":{"type":"checkin_count","value":1}},"streak_7":{"name":"坚持者","description":"连续打卡7天","icon":"fa-calendar-check","color":"blue","condition":{"type":"streak_days","value":7}},"practice_10":{"name":"呼吸大师","description":"完成10次呼吸练习","icon":"fa-wind","color":"green","condition":{"type":"practice_count","value":10}},"meditation_60":{"name":"冥想达人","description":"累计冥想60分钟","icon":"fa-om","color":"purple","condition":{"type":"meditation_minutes","value":60}},"streak_30":{"name":"情绪管理师","description":"连续打卡30天","icon":"fa-trophy","color":"blue","condition":{"type":"streak_days","value":30}},"assessment_5":{"name":"心理探索者","description":"完成5项测评","icon":"fa-star","color":"green","condition":{"type":"assessment_count","value":5}},"checkin_50":{"name":"情绪记录家","description":"累计打卡50天","icon":"fa-book","color":"blue","condition":{"type":"checkin_count","value":50}},"assessment_10":{"name":"自我认知者","description":"完成10项测评","icon":"fa-brain","color":"purple","condition":{"type":"assessment_count","value":10}},"practice_50":{"name":"正念修行者","description":"完成50次练习","icon":"fa-spa","color":"green","condition":{"type":"practice_count","value":50}}}', '成就规则配置');

-- 插入测试用户数据
INSERT INTO `users` (`phone`, `password`, `nickname`, `gender`, `birthday`) VALUES
('13800138000', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试用户', 'female', '1995-06-15');

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 创建索引优化查询性能
-- =============================================

-- 心情记录表复合索引
CREATE INDEX `idx_mood_records_user_date_mood` ON `mood_records` (`user_id`, `date`, `mood`);
CREATE INDEX `idx_mood_records_date_value` ON `mood_records` (`date`, `value`);

-- 练习历史表复合索引
CREATE INDEX `idx_practice_history_user_type_date` ON `practice_history` (`user_id`, `type`, `date`);
CREATE INDEX `idx_practice_history_type_duration` ON `practice_history` (`type`, `duration`);

-- 测评历史表复合索引
CREATE INDEX `idx_assessment_history_user_type_date` ON `assessment_history` (`user_id`, `type`, `date`);
CREATE INDEX `idx_assessment_history_type_score` ON `assessment_history` (`type`, `score`);

-- 操作日志表复合索引
CREATE INDEX `idx_operation_logs_user_operation_created` ON `operation_logs` (`user_id`, `operation`, `created_at`);

-- =============================================
-- 创建视图简化查询
-- =============================================

-- 用户统计信息视图
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
LEFT JOIN (
    SELECT user_id, COUNT(*) as total_checkins 
    FROM mood_records 
    WHERE deleted = 0 
    GROUP BY user_id
) mr ON u.id = mr.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as total_practices 
    FROM practice_history 
    WHERE deleted = 0 
    GROUP BY user_id
) ph ON u.id = ph.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as total_assessments 
    FROM assessment_history 
    WHERE deleted = 0 
    GROUP BY user_id
) ah ON u.id = ah.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as total_achievements 
    FROM user_achievements 
    GROUP BY user_id
) ua ON u.id = ua.user_id
WHERE u.deleted = 0;

-- 心情统计视图
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

-- 练习统计视图
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

-- 测评统计视图
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
