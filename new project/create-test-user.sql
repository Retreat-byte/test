-- 创建测试用户
INSERT INTO users (id, phone, password, nickname, gender, status, enabled, deleted, created_at, updated_at) 
VALUES (1, '13800138000', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '测试用户', 'FEMALE', 'ACTIVE', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 验证用户是否创建成功
SELECT * FROM users WHERE phone = '13800138000';
