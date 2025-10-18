-- 修复性别枚举问题
USE emotion_island;

-- 更新现有用户的性别字段
UPDATE users SET gender = 'FEMALE' WHERE gender = 'female';
UPDATE users SET gender = 'MALE' WHERE gender = 'male';
UPDATE users SET gender = 'OTHER' WHERE gender = 'other';

-- 查看更新结果
SELECT id, phone, nickname, gender FROM users;
