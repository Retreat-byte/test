-- ============================================
-- 法智顾问 - Apifox测试数据脚本
-- 用途：为Apifox接口测试准备测试数据
-- 执行顺序：先执行 schema.sql 创建表，再执行此脚本插入测试数据
-- ============================================

USE legal_assistant;

-- ============================================
-- 清理旧测试数据（可选，如果已存在）
-- ============================================
-- 注意：如果数据库已有数据，请谨慎执行删除操作
-- DELETE FROM case_search_history;
-- DELETE FROM document_reviews;
-- DELETE FROM download_records;
-- DELETE FROM tool_usage_records;
-- DELETE FROM favorites;
-- DELETE FROM messages;
-- DELETE FROM conversations;
-- DELETE FROM legal_regulations;
-- DELETE FROM legal_cases;
-- DELETE FROM document_templates;
-- DELETE FROM users WHERE phone IN ('13900139000', '13800138000');

-- ============================================
-- 1. 插入测试用户
-- ============================================
-- 密码：123456（BCrypt加密后的值）
-- 注意：BCrypt每次加密结果不同，这里使用一个固定的加密值用于测试
-- 如果此密码无法登录，请通过注册接口创建新用户，或使用以下命令生成新的BCrypt值

INSERT INTO users (id, phone, password, nickname, email, gender, status, created_at, updated_at) VALUES
('test_user_001', '13900139000', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJwC', '测试用户1', 'test1@example.com', 'male', 1, NOW(), NOW()),
('test_user_002', '13800138000', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJwC', '测试用户2', 'test2@example.com', 'female', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    nickname = VALUES(nickname),
    email = VALUES(email),
    updated_at = NOW();

-- 设置测试用户ID变量（用于后续数据插入）
SET @test_user_id = 'test_user_001';

-- ============================================
-- 2. 插入法律法规数据（供收藏功能测试）
-- ============================================
INSERT INTO legal_regulations (id, title, article_count, category, effective_date, update_date, status, content, created_at, updated_at) VALUES
('reg_001', '中华人民共和国劳动合同法', 98, '劳动法', '2008-01-01', '2012-12-28', '有效', 
 '<h1>中华人民共和国劳动合同法</h1><p>第一条 为了完善劳动合同制度，明确劳动合同双方当事人的权利和义务，保护劳动者的合法权益，构建和发展和谐稳定的劳动关系，制定本法。</p><p>第二条 中华人民共和国境内的企业、个体经济组织、民办非企业单位等组织（以下称用人单位）与劳动者建立劳动关系，订立、履行、变更、解除或者终止劳动合同，适用本法。</p>', 
 NOW(), NOW()),
('reg_002', '中华人民共和国劳动法', 107, '劳动法', '1995-01-01', '2018-12-29', '有效', 
 '<h1>中华人民共和国劳动法</h1><p>第一条 为了保护劳动者的合法权益，调整劳动关系，建立和维护适应社会主义市场经济的劳动制度，促进经济发展和社会进步，根据宪法，制定本法。</p>', 
 NOW(), NOW()),
('reg_003', '中华人民共和国民法典', 1260, '民法', '2021-01-01', '2021-01-01', '有效', 
 '<h1>中华人民共和国民法典</h1><p>第一条 为了保护民事主体的合法权益，调整民事关系，维护社会和经济秩序，适应中国特色社会主义发展要求，弘扬社会主义核心价值观，根据宪法，制定本法。</p>', 
 NOW(), NOW()),
('reg_004', '中华人民共和国刑法', 452, '刑法', '1997-10-01', '2020-12-26', '有效', 
 '<h1>中华人民共和国刑法</h1><p>第一条 为了惩罚犯罪，保护人民，根据宪法，结合我国同犯罪作斗争的具体经验及实际情况，制定本法。</p>', 
 NOW(), NOW()),
('reg_005', '中华人民共和国消费者权益保护法', 63, '经济法', '1994-01-01', '2013-10-25', '有效', 
 '<h1>中华人民共和国消费者权益保护法</h1><p>第一条 为保护消费者的合法权益，维护社会经济秩序，促进社会主义市场经济健康发展，制定本法。</p>', 
 NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    article_count = VALUES(article_count),
    category = VALUES(category),
    updated_at = NOW();

-- ============================================
-- 3. 插入案例数据（供案例检索测试）
-- ============================================
INSERT INTO legal_cases (id, title, case_number, case_type, court, publish_date, content, keywords, related_laws, created_at, updated_at) VALUES
('case_001', '张某与某公司劳动争议纠纷案', '(2023)京0101民初12345号', '民事', '北京市东城区人民法院', '2023-06-15', 
 JSON_OBJECT('basic_info', JSON_OBJECT('plaintiff', '张某', 'defendant', '某公司', 'dispute_type', '经济补偿金'), 
            'sections', JSON_ARRAY(JSON_OBJECT('title', '案件事实', 'content', '原告张某于2020年入职被告公司，工作期间表现良好。2023年公司因业务调整，单方面解除与原告的劳动合同。'), 
                                  JSON_OBJECT('title', '争议焦点', 'content', '双方就经济补偿金计算标准存在争议，原告认为应按实际工资计算，被告认为应按基本工资计算。'))),
 JSON_ARRAY('劳动争议', '经济补偿金', '劳动合同'),
 JSON_ARRAY('《劳动合同法》第四十七条', '《劳动合同法》第四十八条'),
 NOW(), NOW()),
('case_002', '李某工伤认定纠纷案', '(2023)沪0101行初5678号', '行政', '上海市黄浦区人民法院', '2023-07-20',
 JSON_OBJECT('basic_info', JSON_OBJECT('plaintiff', '李某', 'defendant', '某区人社局', 'dispute_type', '工伤认定'),
            'sections', JSON_ARRAY(JSON_OBJECT('title', '案件事实', 'content', '原告李某在工作期间受伤，向人社局申请工伤认定，但被驳回。'))),
 JSON_ARRAY('工伤认定', '工伤保险', '劳动保障'),
 JSON_ARRAY('《工伤保险条例》第十四条', '《工伤保险条例》第十七条'),
 NOW(), NOW()),
('case_003', '王某与某公司解除劳动合同纠纷案', '(2023)粤0101民初9012号', '民事', '广州市天河区人民法院', '2023-08-10',
 JSON_OBJECT('basic_info', JSON_OBJECT('plaintiff', '王某', 'defendant', '某公司', 'dispute_type', '违法解除'),
            'sections', JSON_ARRAY(JSON_OBJECT('title', '案件事实', 'content', '被告公司单方面解除与原告的劳动合同，原告认为属于违法解除，要求支付赔偿金。'))),
 JSON_ARRAY('违法解除', '赔偿金', '劳动合同'),
 JSON_ARRAY('《劳动合同法》第四十八条', '《劳动合同法》第八十七条'),
 NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    case_number = VALUES(case_number),
    updated_at = NOW();

-- ============================================
-- 4. 插入文书模板数据（供模板下载测试）
-- ============================================
INSERT INTO document_templates (id, title, description, category, file_url, file_size, file_type, download_count, preview_url, created_at, updated_at) VALUES
('template_001', '劳动合同模板', '标准劳动合同模板，适用于一般企业用工', '劳动合同', '/templates/labor_contract.pdf', 245760, 'pdf', 0, '/templates/preview/labor_contract.jpg', NOW(), NOW()),
('template_002', '劳动争议起诉状模板', '劳动争议案件起诉状标准格式', '起诉状', '/templates/labor_dispute_complaint.docx', 189440, 'docx', 0, '/templates/preview/labor_dispute_complaint.jpg', NOW(), NOW()),
('template_003', '工伤认定申请书模板', '工伤认定申请标准格式', '申请书', '/templates/work_injury_application.pdf', 156672, 'pdf', 0, '/templates/preview/work_injury_application.jpg', NOW(), NOW()),
('template_004', '解除劳动合同通知书模板', '用人单位解除劳动合同通知书模板', '通知书', '/templates/termination_notice.docx', 98765, 'docx', 0, '/templates/preview/termination_notice.jpg', NOW(), NOW()),
('template_005', '经济补偿金计算说明模板', '经济补偿金计算说明文档', '说明文档', '/templates/compensation_calculation.pdf', 123456, 'pdf', 0, '/templates/preview/compensation_calculation.jpg', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    description = VALUES(description),
    updated_at = NOW();

-- ============================================
-- 5. 插入文件审查记录（供文件审查接口测试）
-- ============================================
-- 注意：这些记录用于测试 GET /history 和 GET /{id} 接口
INSERT INTO document_reviews (id, user_id, file_name, file_url, file_size, file_type, suggestions, overall_score, created_at, updated_at) VALUES
('review_001', @test_user_id, '劳动合同审查.pdf', '/uploads/reviews/contract_001.pdf', 245760, 'pdf',
 JSON_ARRAY(
   JSON_OBJECT('type', 'warning', 'title', '试用期约定过长', 'description', '劳动合同约定试用期为6个月，但根据《劳动合同法》规定，三年以上固定期限劳动合同试用期最长不超过6个月，建议明确具体期限。', 'severity', 'medium'),
   JSON_OBJECT('type', 'info', 'title', '工作地点约定明确', 'description', '工作地点约定清晰，符合要求。', 'severity', 'low'),
   JSON_OBJECT('type', 'warning', 'title', '违约金条款需注意', 'description', '违约金条款约定较为严格，建议确认是否符合法律规定。', 'severity', 'medium')
 ),
 85, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('review_002', @test_user_id, '解除通知书审查.docx', '/uploads/reviews/termination_002.docx', 189440, 'docx',
 JSON_ARRAY(
   JSON_OBJECT('type', 'error', 'title', '解除理由不明确', 'description', '解除通知书中未明确说明解除的具体理由和法律依据，可能导致解除行为被认定为违法解除。', 'severity', 'high'),
   JSON_OBJECT('type', 'warning', 'title', '缺少解除程序说明', 'description', '建议补充说明解除程序是否符合法律规定。', 'severity', 'medium')
 ),
 65, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('review_003', @test_user_id, '保密协议审查.pdf', '/uploads/reviews/nda_003.pdf', 156672, 'pdf',
 JSON_ARRAY(
   JSON_OBJECT('type', 'info', 'title', '保密范围定义清晰', 'description', '保密范围定义明确，涵盖了必要的保密信息。', 'severity', 'low'),
   JSON_OBJECT('type', 'warning', 'title', '保密期限需明确', 'description', '建议明确保密期限，避免产生争议。', 'severity', 'medium')
 ),
 90, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE 
    file_name = VALUES(file_name),
    suggestions = VALUES(suggestions),
    overall_score = VALUES(overall_score),
    updated_at = NOW();

-- ============================================
-- 6. 插入收藏记录（供收藏功能测试）
-- ============================================
INSERT INTO favorites (id, user_id, regulation_id, created_at, updated_at) VALUES
('fav_001', @test_user_id, 'reg_001', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
('fav_002', @test_user_id, 'reg_002', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('fav_003', @test_user_id, 'reg_003', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================
-- 7. 插入对话记录（供AI咨询测试）
-- ============================================
INSERT INTO conversations (id, user_id, title, first_message, message_count, created_at, updated_at) VALUES
('conv_001', @test_user_id, '关于经济补偿金的咨询', '我想了解一下经济补偿金是如何计算的？', 4, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('conv_002', @test_user_id, '工伤认定相关问题', '工伤认定的标准是什么？', 6, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    message_count = VALUES(message_count),
    updated_at = NOW();

-- ============================================
-- 8. 插入消息记录
-- ============================================
INSERT INTO messages (id, conversation_id, role, content, created_at, updated_at) VALUES
('msg_001', 'conv_001', 'USER', '我想了解一下经济补偿金是如何计算的？', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('msg_002', 'conv_001', 'ASSISTANT', '经济补偿金按照劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 10 SECOND, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 10 SECOND),
('msg_003', 'conv_001', 'USER', '那工资标准是按什么计算的？', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 30 SECOND, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 30 SECOND),
('msg_004', 'conv_001', 'ASSISTANT', '工资标准是指劳动者解除或者终止劳动合同前12个月的平均工资。如果平均工资低于当地最低工资标准的，按照当地最低工资标准计算。', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 40 SECOND, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 40 SECOND),
('msg_005', 'conv_002', 'USER', '工伤认定的标准是什么？', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('msg_006', 'conv_002', 'ASSISTANT', '根据《工伤保险条例》第十四条规定，职工有下列情形之一的，应当认定为工伤：（一）在工作时间和工作场所内，因工作原因受到事故伤害的；（二）工作时间前后在工作场所内，从事与工作有关的预备性或者收尾性工作受到事故伤害的...', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 15 SECOND, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 15 SECOND)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================
-- 9. 插入工具使用记录（供统计功能测试）
-- ============================================
INSERT INTO tool_usage_records (id, user_id, tool_type, tool_name, input_data, result_data, created_at, updated_at) VALUES
('tool_001', @test_user_id, 'calculator', 'compensation', 
 JSON_OBJECT('workYears', 5, 'months', 3, 'monthlySalary', 8000),
 JSON_OBJECT('totalCompensation', 43333.33, 'calculation', '5年3个月按5.5年计算，8000 * 5.5 = 44000元'),
 DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('tool_002', @test_user_id, 'calculator', 'work_injury',
 JSON_OBJECT('injuryLevel', '十级', 'monthlySalary', 6000, 'workYears', 2),
 JSON_OBJECT('compensation', 12000, 'calculation', '十级伤残，一次性伤残补助金为7个月工资'),
 DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY))
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================
-- 10. 插入下载记录（供下载历史测试）
-- ============================================
INSERT INTO download_records (id, user_id, template_id, created_at, updated_at) VALUES
('dl_001', @test_user_id, 'template_001', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
('dl_002', @test_user_id, 'template_002', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY))
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 更新模板下载次数
UPDATE document_templates SET download_count = download_count + 1 WHERE id IN ('template_001', 'template_002');

-- ============================================
-- 11. 插入案例搜索历史（供搜索历史测试）
-- ============================================
INSERT INTO case_search_history (id, user_id, keyword, case_type, court, result_count, created_at, updated_at) VALUES
('history_001', @test_user_id, '经济补偿金', '民事', NULL, 15, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
('history_002', @test_user_id, '工伤认定', '行政', '上海市', 8, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('history_003', @test_user_id, '违法解除', '民事', NULL, 23, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY))
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================
-- 脚本执行完成提示
-- ============================================
SELECT '============================================' AS '';
SELECT '测试数据插入完成！' AS message;
SELECT '============================================' AS '';
SELECT CONCAT('测试用户ID: ', @test_user_id) AS user_info;
SELECT '手机号: 13900139000' AS phone;
SELECT '密码: 123456' AS password;
SELECT '' AS '';
SELECT '已插入的数据：' AS summary;
SELECT '  ✓ 测试用户: 2个' AS item1;
SELECT '  ✓ 法律法规: 5条' AS item2;
SELECT '  ✓ 案例: 3条' AS item3;
SELECT '  ✓ 文书模板: 5条' AS item4;
SELECT '  ✓ 文件审查记录: 3条' AS item5;
SELECT '  ✓ 对话记录: 2条' AS item6;
SELECT '  ✓ 消息记录: 6条' AS item7;
SELECT '  ✓ 收藏记录: 3条' AS item8;
SELECT '  ✓ 工具使用记录: 2条' AS item9;
SELECT '  ✓ 下载记录: 2条' AS item10;
SELECT '  ✓ 搜索历史: 3条' AS item11;
SELECT '' AS '';
SELECT '文件审查记录ID（用于测试）：' AS review_ids;
SELECT '  - review_001 (劳动合同审查.pdf)' AS review1;
SELECT '  - review_002 (解除通知书审查.docx)' AS review2;
SELECT '  - review_003 (保密协议审查.pdf)' AS review3;
SELECT '' AS '';
SELECT '现在可以使用Apifox进行接口测试了！' AS next_step;

