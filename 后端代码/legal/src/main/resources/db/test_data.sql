-- ============================================
-- 法智顾问 - 测试数据插入脚本
-- 用户ID: cd9194ea-a580-458e-bc80-1e5b529a4c13
-- 手机号: 13900139000
-- ============================================

USE legal_assistant;

-- 设置用户ID变量
SET @user_id = 'cd9194ea-a580-458e-bc80-1e5b529a4c13';

-- ============================================
-- 清理旧数据（如果存在）
-- ============================================
-- 注意：删除顺序要遵循外键依赖关系（从子表到父表）

-- 删除该用户的搜索历史（使用BINARY比较避免排序规则冲突）
DELETE FROM case_search_history WHERE BINARY user_id = BINARY @user_id;

-- 删除该用户的文件审查记录
DELETE FROM document_reviews WHERE BINARY user_id = BINARY @user_id;

-- 删除该用户的下载记录
DELETE FROM download_records WHERE BINARY user_id = BINARY @user_id;

-- 删除该用户的工具使用记录
DELETE FROM tool_usage_records WHERE BINARY user_id = BINARY @user_id;

-- 删除该用户的收藏记录
DELETE FROM favorites WHERE BINARY user_id = BINARY @user_id;

-- 删除该用户的消息记录（通过对话ID）
DELETE FROM messages WHERE conversation_id IN (
    SELECT id FROM conversations WHERE BINARY user_id = BINARY @user_id
);

-- 删除该用户的对话记录
DELETE FROM conversations WHERE BINARY user_id = BINARY @user_id;

-- 删除测试用的法律法规、案例、文书模板（如果存在）
DELETE FROM legal_regulations WHERE id IN ('reg_001', 'reg_002', 'reg_003', 'reg_004', 'reg_005');
DELETE FROM legal_cases WHERE id IN ('case_001', 'case_002', 'case_003');
DELETE FROM document_templates WHERE id IN ('template_001', 'template_002', 'template_003', 'template_004', 'template_005');

-- ============================================
-- 1. 插入法律法规数据（供收藏使用）
-- ============================================
INSERT INTO legal_regulations (id, title, article_count, category, effective_date, update_date, status, content, created_at, updated_at) VALUES
('reg_001', '中华人民共和国劳动合同法', 98, '劳动法', '2008-01-01', '2012-12-28', '有效', '<h1>中华人民共和国劳动合同法</h1><p>第一条 为了完善劳动合同制度，明确劳动合同双方当事人的权利和义务，保护劳动者的合法权益，构建和发展和谐稳定的劳动关系，制定本法。</p>', NOW(), NOW()),
('reg_002', '中华人民共和国劳动法', 107, '劳动法', '1995-01-01', '2018-12-29', '有效', '<h1>中华人民共和国劳动法</h1><p>第一条 为了保护劳动者的合法权益，调整劳动关系，建立和维护适应社会主义市场经济的劳动制度，促进经济发展和社会进步，根据宪法，制定本法。</p>', NOW(), NOW()),
('reg_003', '中华人民共和国民法典', 1260, '民法', '2021-01-01', '2021-01-01', '有效', '<h1>中华人民共和国民法典</h1><p>第一条 为了保护民事主体的合法权益，调整民事关系，维护社会和经济秩序，适应中国特色社会主义发展要求，弘扬社会主义核心价值观，根据宪法，制定本法。</p>', NOW(), NOW()),
('reg_004', '中华人民共和国刑法', 452, '刑法', '1997-10-01', '2020-12-26', '有效', '<h1>中华人民共和国刑法</h1><p>第一条 为了惩罚犯罪，保护人民，根据宪法，结合我国同犯罪作斗争的具体经验及实际情况，制定本法。</p>', NOW(), NOW()),
('reg_005', '中华人民共和国消费者权益保护法', 63, '经济法', '1994-01-01', '2013-10-25', '有效', '<h1>中华人民共和国消费者权益保护法</h1><p>第一条 为保护消费者的合法权益，维护社会经济秩序，促进社会主义市场经济健康发展，制定本法。</p>', NOW(), NOW());

-- ============================================
-- 2. 插入案例数据
-- ============================================
INSERT INTO legal_cases (id, title, case_number, case_type, court, publish_date, content, keywords, related_laws, created_at, updated_at) VALUES
('case_001', '张某与某公司劳动争议纠纷案', '(2023)京0101民初12345号', '民事', '北京市东城区人民法院', '2023-06-15', 
 JSON_OBJECT('basic_info', JSON_OBJECT('plaintiff', '张某', 'defendant', '某公司', 'dispute_type', '经济补偿金'), 
            'sections', JSON_ARRAY(JSON_OBJECT('title', '案件事实', 'content', '原告张某于2020年入职被告公司...'), 
                                  JSON_OBJECT('title', '争议焦点', 'content', '双方就经济补偿金计算标准存在争议...'))),
 JSON_ARRAY('劳动争议', '经济补偿金', '劳动合同'),
 JSON_ARRAY('《劳动合同法》第四十七条', '《劳动合同法》第四十八条'),
 NOW(), NOW()),
('case_002', '李某工伤认定纠纷案', '(2023)沪0101行初5678号', '行政', '上海市黄浦区人民法院', '2023-07-20',
 JSON_OBJECT('basic_info', JSON_OBJECT('plaintiff', '李某', 'defendant', '某区人社局', 'dispute_type', '工伤认定'),
            'sections', JSON_ARRAY(JSON_OBJECT('title', '案件事实', 'content', '原告李某在工作期间受伤...'))),
 JSON_ARRAY('工伤认定', '工伤保险', '劳动保障'),
 JSON_ARRAY('《工伤保险条例》第十四条', '《工伤保险条例》第十七条'),
 NOW(), NOW()),
('case_003', '王某与某公司解除劳动合同纠纷案', '(2023)粤0101民初9012号', '民事', '广州市天河区人民法院', '2023-08-10',
 JSON_OBJECT('basic_info', JSON_OBJECT('plaintiff', '王某', 'defendant', '某公司', 'dispute_type', '违法解除'),
            'sections', JSON_ARRAY(JSON_OBJECT('title', '案件事实', 'content', '被告公司单方面解除与原告的劳动合同...'))),
 JSON_ARRAY('违法解除', '赔偿金', '劳动合同'),
 JSON_ARRAY('《劳动合同法》第四十八条', '《劳动合同法》第八十七条'),
 NOW(), NOW());

-- ============================================
-- 3. 插入文书模板数据
-- ============================================
INSERT INTO document_templates (id, title, description, category, file_url, file_size, file_type, download_count, preview_url, created_at, updated_at) VALUES
('template_001', '劳动合同模板', '标准劳动合同模板，适用于一般企业用工', '劳动合同', '/templates/labor_contract.pdf', 245760, 'pdf', 0, '/templates/preview/labor_contract.jpg', NOW(), NOW()),
('template_002', '劳动争议起诉状模板', '劳动争议案件起诉状标准格式', '起诉状', '/templates/labor_dispute_complaint.docx', 189440, 'docx', 0, '/templates/preview/labor_dispute_complaint.jpg', NOW(), NOW()),
('template_003', '工伤认定申请书模板', '工伤认定申请标准格式', '申请书', '/templates/work_injury_application.pdf', 156672, 'pdf', 0, '/templates/preview/work_injury_application.jpg', NOW(), NOW()),
('template_004', '解除劳动合同通知书模板', '用人单位解除劳动合同通知书模板', '通知书', '/templates/termination_notice.docx', 98765, 'docx', 0, '/templates/preview/termination_notice.jpg', NOW(), NOW()),
('template_005', '经济补偿金计算说明模板', '经济补偿金计算说明文档', '说明文档', '/templates/compensation_calculation.pdf', 123456, 'pdf', 0, '/templates/preview/compensation_calculation.jpg', NOW(), NOW());

-- ============================================
-- 4. 插入对话记录（AI咨询）
-- ============================================
INSERT INTO conversations (id, user_id, title, first_message, message_count, created_at, updated_at) VALUES
('conv_001', @user_id, '关于经济补偿金的咨询', '我想了解一下经济补偿金是如何计算的？', 4, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('conv_002', @user_id, '工伤认定相关问题', '工伤认定的标准是什么？', 6, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('conv_003', @user_id, '劳动合同解除咨询', '公司单方面解除劳动合同需要支付赔偿金吗？', 8, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================
-- 5. 插入消息记录
-- ============================================
-- 对话1的消息（注意：role值必须与Java枚举一致，使用大写USER和ASSISTANT）
INSERT INTO messages (id, conversation_id, role, content, created_at, updated_at) VALUES
('msg_001', 'conv_001', 'USER', '我想了解一下经济补偿金是如何计算的？', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('msg_002', 'conv_001', 'ASSISTANT', '经济补偿金按照劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 10 SECOND, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 10 SECOND),
('msg_003', 'conv_001', 'USER', '那工资标准是按什么计算的？', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 30 SECOND, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 30 SECOND),
('msg_004', 'conv_001', 'ASSISTANT', '工资标准是指劳动者解除或者终止劳动合同前12个月的平均工资。如果平均工资低于当地最低工资标准的，按照当地最低工资标准计算。', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 40 SECOND, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 40 SECOND);

-- 对话2的消息（注意：role值必须与Java枚举一致，使用大写USER和ASSISTANT）
INSERT INTO messages (id, conversation_id, role, content, created_at, updated_at) VALUES
('msg_005', 'conv_002', 'USER', '工伤认定的标准是什么？', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('msg_006', 'conv_002', 'ASSISTANT', '根据《工伤保险条例》第十四条规定，职工有下列情形之一的，应当认定为工伤：（一）在工作时间和工作场所内，因工作原因受到事故伤害的；（二）工作时间前后在工作场所内，从事与工作有关的预备性或者收尾性工作受到事故伤害的...', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 15 SECOND, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 15 SECOND),
('msg_007', 'conv_002', 'USER', '如果是在上下班途中受伤算工伤吗？', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 1 MINUTE, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 1 MINUTE),
('msg_008', 'conv_002', 'ASSISTANT', '在上下班途中，受到非本人主要责任的交通事故或者城市轨道交通、客运轮渡、火车事故伤害的，应当认定为工伤。', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 1 MINUTE + INTERVAL 10 SECOND, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 1 MINUTE + INTERVAL 10 SECOND),
('msg_009', 'conv_002', 'USER', '需要提供哪些材料？', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 MINUTE, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 MINUTE),
('msg_010', 'conv_002', 'ASSISTANT', '申请工伤认定需要提供：1.工伤认定申请表；2.与用人单位存在劳动关系的证明材料；3.医疗诊断证明或者职业病诊断证明书。', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 MINUTE + INTERVAL 15 SECOND, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 MINUTE + INTERVAL 15 SECOND);

-- 对话3的消息（注意：role值必须与Java枚举一致，使用大写USER和ASSISTANT）
INSERT INTO messages (id, conversation_id, role, content, created_at, updated_at) VALUES
('msg_011', 'conv_003', 'USER', '公司单方面解除劳动合同需要支付赔偿金吗？', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('msg_012', 'conv_003', 'ASSISTANT', '这取决于解除的原因。如果用人单位违法解除劳动合同，根据《劳动合同法》第四十八条，劳动者可以要求继续履行劳动合同，或者要求用人单位支付赔偿金。赔偿金标准为经济补偿金的两倍。', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 12 SECOND, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 12 SECOND),
('msg_013', 'conv_003', 'USER', '什么情况下属于违法解除？', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 MINUTE, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 MINUTE),
('msg_014', 'conv_003', 'ASSISTANT', '违法解除主要包括：1.不符合法定解除条件而解除；2.解除程序不合法；3.解除理由不成立。比如，用人单位以"不符合录用条件"解除，但无法证明劳动者不符合录用条件，就属于违法解除。', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 MINUTE + INTERVAL 20 SECOND, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 MINUTE + INTERVAL 20 SECOND),
('msg_015', 'conv_003', 'USER', '如果公司以"严重违反规章制度"解除，但规章制度不合理，算违法吗？', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 2 MINUTE, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 2 MINUTE),
('msg_016', 'conv_003', 'ASSISTANT', '是的。用人单位的规章制度必须合法、合理，并且经过民主程序制定。如果规章制度本身不合法或不合理，以此为依据解除劳动合同，属于违法解除。', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 2 MINUTE + INTERVAL 15 SECOND, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 2 MINUTE + INTERVAL 15 SECOND),
('msg_017', 'conv_003', 'USER', '那我应该怎么维权？', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 MINUTE, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 MINUTE),
('msg_018', 'conv_003', 'ASSISTANT', '您可以：1.向劳动监察部门投诉；2.申请劳动仲裁；3.对仲裁结果不服的，可以向人民法院提起诉讼。建议您收集相关证据，如解除通知书、工资单、考勤记录等。', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 MINUTE + INTERVAL 20 SECOND, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 MINUTE + INTERVAL 20 SECOND);

-- 更新对话的消息数量
UPDATE conversations SET message_count = 4 WHERE id = 'conv_001';
UPDATE conversations SET message_count = 6 WHERE id = 'conv_002';
UPDATE conversations SET message_count = 8 WHERE id = 'conv_003';

-- ============================================
-- 6. 插入收藏记录
-- ============================================
INSERT INTO favorites (id, user_id, regulation_id, created_at, updated_at) VALUES
('fav_001', @user_id, 'reg_001', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
('fav_002', @user_id, 'reg_002', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('fav_003', @user_id, 'reg_003', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));

-- ============================================
-- 7. 插入工具使用记录
-- ============================================
INSERT INTO tool_usage_records (id, user_id, tool_type, tool_name, input_data, result_data, created_at, updated_at) VALUES
('tool_001', @user_id, 'calculator', 'compensation', 
 JSON_OBJECT('workYears', 5, 'months', 3, 'monthlySalary', 8000),
 JSON_OBJECT('totalCompensation', 43333.33, 'calculation', '5年3个月按5.5年计算，8000 * 5.5 = 44000元'),
 DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('tool_002', @user_id, 'calculator', 'work_injury',
 JSON_OBJECT('injuryLevel', '十级', 'monthlySalary', 6000, 'workYears', 2),
 JSON_OBJECT('compensation', 12000, 'calculation', '十级伤残，一次性伤残补助金为7个月工资'),
 DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
('tool_003', @user_id, 'document_review', 'contract_review',
 JSON_OBJECT('fileName', '劳动合同.pdf', 'fileSize', 245760),
 JSON_OBJECT('overallScore', 85, 'suggestionsCount', 3, 'status', 'reviewed'),
 DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('tool_004', @user_id, 'calculator', 'compensation',
 JSON_OBJECT('workYears', 3, 'months', 0, 'monthlySalary', 10000),
 JSON_OBJECT('totalCompensation', 30000, 'calculation', '3年整，10000 * 3 = 30000元'),
 DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- 8. 插入下载记录
-- ============================================
INSERT INTO download_records (id, user_id, template_id, created_at, updated_at) VALUES
('dl_001', @user_id, 'template_001', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
('dl_002', @user_id, 'template_002', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
('dl_003', @user_id, 'template_003', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));

-- 更新模板下载次数
UPDATE document_templates SET download_count = download_count + 1 WHERE id IN ('template_001', 'template_002', 'template_003');

-- ============================================
-- 9. 插入文件审查记录
-- ============================================
INSERT INTO document_reviews (id, user_id, file_name, file_url, file_size, file_type, suggestions, overall_score, created_at, updated_at) VALUES
('review_001', @user_id, '劳动合同.pdf', '/uploads/reviews/contract_001.pdf', 245760, 'pdf',
 JSON_ARRAY(
   JSON_OBJECT('type', 'warning', 'title', '试用期约定过长', 'description', '劳动合同约定试用期为6个月，但根据《劳动合同法》规定，三年以上固定期限劳动合同试用期最长不超过6个月，建议明确具体期限。', 'severity', 'medium'),
   JSON_OBJECT('type', 'info', 'title', '工作地点约定明确', 'description', '工作地点约定清晰，符合要求。', 'severity', 'low'),
   JSON_OBJECT('type', 'warning', 'title', '违约金条款需注意', 'description', '违约金条款约定较为严格，建议确认是否符合法律规定。', 'severity', 'medium')
 ),
 85, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('review_002', @user_id, '解除通知书.docx', '/uploads/reviews/termination_002.docx', 189440, 'docx',
 JSON_ARRAY(
   JSON_OBJECT('type', 'error', 'title', '解除理由不明确', 'description', '解除通知书中未明确说明解除的具体理由和法律依据，可能导致解除行为被认定为违法解除。', 'severity', 'high'),
   JSON_OBJECT('type', 'warning', 'title', '缺少解除程序说明', 'description', '建议补充说明解除程序是否符合法律规定。', 'severity', 'medium')
 ),
 65, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('review_003', @user_id, '保密协议.pdf', '/uploads/reviews/nda_003.pdf', 156672, 'pdf',
 JSON_ARRAY(
   JSON_OBJECT('type', 'info', 'title', '保密范围定义清晰', 'description', '保密范围定义明确，涵盖了必要的保密信息。', 'severity', 'low'),
   JSON_OBJECT('type', 'warning', 'title', '保密期限需明确', 'description', '建议明确保密期限，避免产生争议。', 'severity', 'medium')
 ),
 90, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================
-- 10. 插入案例搜索历史（注意：ID使用history_xxx格式，与API测试数据一致）
-- ============================================
INSERT INTO case_search_history (id, user_id, keyword, case_type, court, result_count, created_at, updated_at) VALUES
('history_001', @user_id, '经济补偿金', '民事', NULL, 15, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
('history_002', @user_id, '工伤认定', '行政', '上海市', 8, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('history_003', @user_id, '违法解除', '民事', NULL, 23, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
('history_004', @user_id, '劳动争议', '民事', '北京市', 45, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('history_005', @user_id, '劳动合同', '民事', NULL, 67, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- 脚本执行完成
-- ============================================
SELECT '测试数据插入完成！' AS message;
SELECT CONCAT('用户ID: ', @user_id) AS user_info;
SELECT '已插入的数据：' AS summary;
SELECT '  - 法律法规: 5条' AS item1;
SELECT '  - 案例: 3条' AS item2;
SELECT '  - 文书模板: 5条' AS item3;
SELECT '  - 对话记录: 3条' AS item4;
SELECT '  - 消息记录: 18条' AS item5;
SELECT '  - 收藏记录: 3条' AS item6;
SELECT '  - 工具使用记录: 4条' AS item7;
SELECT '  - 下载记录: 3条' AS item8;
SELECT '  - 文件审查记录: 3条' AS item9;
SELECT '  - 搜索历史: 5条' AS item10;

