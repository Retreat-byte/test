/**
 * 法律知识库相关API
 * 包括法律法规查询、收藏等功能
 */

const legalKnowledgeAPI = {
    /**
     * 获取法律法规列表
     * @param {object} params - 查询参数
     * @returns {Promise}
     */
    getLegalRegulations(params = {}) {
        return get('/legal-knowledge/regulations', {
            category: params.category,          // 分类
            keyword: params.keyword,            // 关键词
            effectStatus: params.effectStatus,  // 效力状态
            page: params.page || 1,
            pageSize: params.pageSize || 12
        });
    },

    /**
     * 搜索法律法规
     * @param {string} keyword - 搜索关键词
     * @param {object} filters - 筛选条件
     * @returns {Promise}
     */
    searchRegulations(keyword, filters = {}) {
        return post('/legal-knowledge/regulations/search', {
            keyword,
            category: filters.category,
            effectStatus: filters.effectStatus,
            updateYear: filters.updateYear,
            page: filters.page || 1,
            pageSize: filters.pageSize || 12
        });
    },

    /**
     * 获取法律法规详情
     * @param {string} regulationId - 法规ID
     * @returns {Promise}
     */
    getRegulationDetail(regulationId) {
        return get(`/legal-knowledge/regulations/${regulationId}`);
    },

    /**
     * 获取法律法规全文（HTML格式）
     * @param {string} regulationId - 法规ID
     * @returns {Promise}
     */
    getRegulationContent(regulationId) {
        return get(`/legal-knowledge/regulations/${regulationId}/content`);
    },

    /**
     * 获取法律法规分类
     * @returns {Promise}
     */
    getCategories() {
        return get('/legal-knowledge/categories');
    },

    /**
     * 收藏法律法规
     * @param {string} regulationId - 法规ID
     * @returns {Promise}
     */
    favoriteRegulation(regulationId) {
        return post('/legal-knowledge/favorites', {
            regulationId,
            favoriteTime: new Date().toISOString()
        });
    },

    /**
     * 取消收藏
     * @param {string} regulationId - 法规ID
     * @returns {Promise}
     */
    unfavoriteRegulation(regulationId) {
        return del(`/legal-knowledge/favorites/${regulationId}`);
    },

    /**
     * 获取收藏列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @returns {Promise}
     */
    getFavoriteList(page = 1, pageSize = 10) {
        return get('/legal-knowledge/favorites', {
            page,
            pageSize
        });
    },

    /**
     * 检查是否已收藏
     * @param {string} regulationId - 法规ID
     * @returns {Promise}
     */
    checkIsFavorite(regulationId) {
        return get(`/legal-knowledge/favorites/check/${regulationId}`);
    },

    /**
     * 批量检查收藏状态
     * @param {Array<string>} regulationIds - 法规ID列表
     * @returns {Promise}
     */
    batchCheckFavorites(regulationIds) {
        return post('/legal-knowledge/favorites/batch-check', {
            regulationIds
        });
    },

    /**
     * 获取热门法律法规
     * @param {number} limit - 数量限制
     * @returns {Promise}
     */
    getPopularRegulations(limit = 10) {
        return get('/legal-knowledge/regulations/popular', {
            limit
        });
    },

    /**
     * 获取最新更新的法律法规
     * @param {number} limit - 数量限制
     * @returns {Promise}
     */
    getLatestRegulations(limit = 10) {
        return get('/legal-knowledge/regulations/latest', {
            limit
        });
    }
};
