/**
 * API统一导出文件
 * 方便其他模块引用
 */

// 导出所有API模块
window.API = {
    auth: authAPI,
    aiConsult: aiConsultAPI,
    legalTools: legalToolsAPI,
    legalKnowledge: legalKnowledgeAPI,
    user: userAPI
};

// 导出配置和工具函数
window.API_CONFIG = API_CONFIG;
window.HTTP_METHODS = HTTP_METHODS;
window.STATUS_CODES = STATUS_CODES;
window.ERROR_MESSAGES = ERROR_MESSAGES;

console.log('✅ API模块加载完成');
