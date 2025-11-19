/**
 * API配置文件
 * 统一管理API基础配置
 */

// API基础配置
const API_CONFIG = {
    // 后端服务器地址（请根据实际情况修改）
    BASE_URL: 'http://localhost:8080/api',
    
    // 请求超时时间（毫秒）
    TIMEOUT: 30000,
    
    // Token存储键名
    TOKEN_KEY: 'legal_assistant_token',
    
    // 用户信息存储键名
    USER_INFO_KEY: 'legal_assistant_user_info'
};

// HTTP请求方法
const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
};

// 响应状态码
const STATUS_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
};

// 错误消息
const ERROR_MESSAGES = {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    TIMEOUT_ERROR: '请求超时，请稍后重试',
    UNAUTHORIZED_ERROR: '登录已过期，请重新登录',
    SERVER_ERROR: '服务器错误，请稍后重试',
    UNKNOWN_ERROR: '未知错误，请稍后重试'
};
