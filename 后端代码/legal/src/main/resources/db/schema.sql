-- ============================================
-- 法智顾问 - 数据库建表脚本
-- 数据库: legal_assistant
-- MySQL版本: 8.0+
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS legal_assistant 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE legal_assistant;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY COMMENT '用户ID',
  phone VARCHAR(11) UNIQUE NOT NULL COMMENT '手机号',
  password VARCHAR(255) NOT NULL COMMENT '密码（BCrypt加密）',
  nickname VARCHAR(50) COMMENT '昵称',
  avatar VARCHAR(500) COMMENT '头像URL',
  email VARCHAR(100) COMMENT '邮箱',
  gender VARCHAR(10) DEFAULT 'unknown' COMMENT '性别：male/female/unknown',
  status INT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_phone (phone),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 验证码表 (verification_codes)
-- ============================================
CREATE TABLE verification_codes (
  id VARCHAR(50) PRIMARY KEY COMMENT '记录ID',
  phone VARCHAR(11) NOT NULL COMMENT '手机号',
  code VARCHAR(6) NOT NULL COMMENT '验证码',
  type VARCHAR(20) NOT NULL COMMENT '类型：register/reset_password',
  expired_at TIMESTAMP NOT NULL COMMENT '过期时间',
  used INT DEFAULT 0 COMMENT '是否已使用：0-未使用，1-已使用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_phone_type (phone, type),
  INDEX idx_expired_at (expired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证码表';

-- ============================================
-- 3. 对话表 (conversations)
-- ============================================
CREATE TABLE conversations (
  id VARCHAR(50) PRIMARY KEY COMMENT '对话ID',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  title VARCHAR(200) COMMENT '对话标题',
  first_message TEXT COMMENT '第一条消息内容',
  message_count INT DEFAULT 0 COMMENT '消息数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话表';

-- ============================================
-- 4. 消息表 (messages)
-- ============================================
CREATE TABLE messages (
  id VARCHAR(50) PRIMARY KEY COMMENT '消息ID',
  conversation_id VARCHAR(50) NOT NULL COMMENT '对话ID',
  role VARCHAR(20) NOT NULL COMMENT '角色：user/assistant',
  content TEXT NOT NULL COMMENT '消息内容',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- ============================================
-- 5. 法律法规表 (legal_regulations)
-- ============================================
CREATE TABLE legal_regulations (
  id VARCHAR(50) PRIMARY KEY COMMENT '法规ID',
  title VARCHAR(300) NOT NULL COMMENT '法规标题',
  article_count INT DEFAULT 0 COMMENT '条款数量',
  category VARCHAR(50) COMMENT '分类：宪法/民法/刑法等',
  effective_date DATE COMMENT '生效日期',
  update_date DATE COMMENT '更新日期',
  status VARCHAR(20) DEFAULT '有效' COMMENT '状态：有效/失效/修订',
  content LONGTEXT COMMENT '法规全文（HTML格式）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category (category),
  INDEX idx_title (title),
  INDEX idx_status (status),
  FULLTEXT idx_fulltext (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='法律法规表';

-- ============================================
-- 6. 案例表 (legal_cases)
-- ============================================
CREATE TABLE legal_cases (
  id VARCHAR(50) PRIMARY KEY COMMENT '案例ID',
  title VARCHAR(500) NOT NULL COMMENT '案例标题',
  case_number VARCHAR(100) COMMENT '案号',
  case_type VARCHAR(50) COMMENT '案件类型：民事/刑事/行政等',
  court VARCHAR(200) COMMENT '审理法院',
  publish_date DATE COMMENT '发布日期',
  content JSON COMMENT '案例内容（JSON格式）',
  keywords JSON COMMENT '关键词数组',
  related_laws JSON COMMENT '相关法条数组',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_case_type (case_type),
  INDEX idx_court (court),
  INDEX idx_publish_date (publish_date),
  FULLTEXT idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='案例表';

-- ============================================
-- 7. 文书模板表 (document_templates)
-- ============================================
CREATE TABLE document_templates (
  id VARCHAR(50) PRIMARY KEY COMMENT '模板ID',
  title VARCHAR(200) NOT NULL COMMENT '模板标题',
  description TEXT COMMENT '模板描述',
  category VARCHAR(50) COMMENT '分类：劳动合同/起诉状/合同等',
  file_url VARCHAR(500) COMMENT '文件URL',
  file_size BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
  file_type VARCHAR(20) DEFAULT 'pdf' COMMENT '文件类型：pdf/docx',
  download_count INT DEFAULT 0 COMMENT '下载次数',
  preview_url VARCHAR(500) COMMENT '预览图URL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category (category),
  INDEX idx_download_count (download_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文书模板表';

-- ============================================
-- 8. 收藏表 (favorites)
-- ============================================
CREATE TABLE favorites (
  id VARCHAR(50) PRIMARY KEY COMMENT '收藏ID',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  regulation_id VARCHAR(50) NOT NULL COMMENT '法规ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (regulation_id) REFERENCES legal_regulations(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_regulation (user_id, regulation_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ============================================
-- 9. 工具使用记录表 (tool_usage_records)
-- ============================================
CREATE TABLE tool_usage_records (
  id VARCHAR(50) PRIMARY KEY COMMENT '记录ID',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  tool_type VARCHAR(50) NOT NULL COMMENT '工具类型：calculator/document_review等',
  tool_name VARCHAR(100) COMMENT '工具名称：compensation/work_injury等',
  input_data JSON COMMENT '输入数据',
  result_data JSON COMMENT '结果数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_tool (user_id, tool_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工具使用记录表';

-- ============================================
-- 10. 下载记录表 (download_records)
-- ============================================
CREATE TABLE download_records (
  id VARCHAR(50) PRIMARY KEY COMMENT '记录ID',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  template_id VARCHAR(50) NOT NULL COMMENT '模板ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_template_id (template_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下载记录表';

-- ============================================
-- 11. 文件审查记录表 (document_reviews)
-- ============================================
CREATE TABLE document_reviews (
  id VARCHAR(50) PRIMARY KEY COMMENT '审查ID',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  file_name VARCHAR(255) NOT NULL COMMENT '文件名',
  file_url VARCHAR(500) COMMENT '文件URL',
  file_size BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
  file_type VARCHAR(20) COMMENT '文件类型：pdf/docx',
  suggestions JSON COMMENT '审查建议（JSON数组）',
  overall_score INT COMMENT '总体评分（0-100）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件审查记录表';

-- ============================================
-- 12. 案例搜索历史表 (case_search_history)
-- ============================================
CREATE TABLE case_search_history (
  id VARCHAR(50) PRIMARY KEY COMMENT '记录ID',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  keyword VARCHAR(200) COMMENT '搜索关键词',
  case_type VARCHAR(50) COMMENT '案件类型',
  court VARCHAR(200) COMMENT '法院',
  result_count INT DEFAULT 0 COMMENT '结果数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='案例搜索历史表';

-- ============================================
-- 初始化数据（可选）
-- ============================================

-- 插入测试用户（密码：123456，BCrypt加密后）
-- INSERT INTO users (id, phone, password, nickname, gender) 
-- VALUES ('user_001', '11111111111', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJwC', '测试用户', 'unknown');

-- ============================================
-- 脚本执行完成
-- ============================================

