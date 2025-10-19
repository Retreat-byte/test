-- 数据库迁移命令
-- 执行时间：2025-10-18
-- 目的：为practice_history表的type字段添加relaxation选项

USE emotion_island;

-- 修改practice_history表的type字段，添加relaxation选项
ALTER TABLE practice_history 
MODIFY COLUMN type enum('breathing','meditation','relaxation') NOT NULL 
COMMENT '练习类型(breathing=正念呼吸,meditation=冥想音频,relaxation=放松练习)';

-- 验证修改结果
SHOW COLUMNS FROM practice_history LIKE 'type';

-- 查看当前表结构
DESCRIBE practice_history;
