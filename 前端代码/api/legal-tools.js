/**
 * 法律工具相关API
 * 包括法律计算器、文件审查、文书模板、案例检索
 */

const legalToolsAPI = {
    // ==================== 法律计算器 ====================
    
    /**
     * 经济补偿金计算
     * @param {object} data - 计算参数
     * @returns {Promise}
     */
    calculateCompensation(data) {
        return post('/legal-tools/calculator/compensation', {
            monthlyWage: data.monthlyWage,        // 月工资
            workYears: data.workYears,            // 工作年限
            workMonths: data.workMonths,          // 工作月数
            calculationType: data.calculationType  // 计算类型
        });
    },

    /**
     * 工伤赔偿计算
     * @param {object} data - 计算参数
     * @returns {Promise}
     */
    calculateWorkInjury(data) {
        return post('/legal-tools/calculator/work-injury', {
            disabilityLevel: data.disabilityLevel,  // 伤残等级
            monthlyWage: data.monthlyWage,          // 月工资
            localAvgWage: data.localAvgWage,        // 当地平均工资
            medicalCost: data.medicalCost,          // 医疗费用
            otherCosts: data.otherCosts             // 其他费用
        });
    },

    /**
     * 诉讼费计算
     * @param {object} data - 计算参数
     * @returns {Promise}
     */
    calculateLitigationFee(data) {
        return post('/legal-tools/calculator/litigation-fee', {
            caseType: data.caseType,                // 案件类型
            disputeAmount: data.disputeAmount       // 争议金额
        });
    },

    /**
     * 违约金计算
     * @param {object} data - 计算参数
     * @returns {Promise}
     */
    calculatePenalty(data) {
        return post('/legal-tools/calculator/penalty', {
            contractAmount: data.contractAmount,    // 合同金额
            breachType: data.breachType,            // 违约类型
            penaltyRate: data.penaltyRate,          // 违约金比例
            actualLoss: data.actualLoss             // 实际损失
        });
    },

    // ==================== 法律文件审查 ====================
    
    /**
     * 上传并审查法律文件
     * @param {File} file - 文件对象
     * @returns {Promise} 返回审查结果
     */
    reviewLegalDocument(file) {
        return upload('/legal-tools/document-review', file);
    },

    /**
     * 获取文件审查历史记录
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @returns {Promise}
     */
    getReviewHistory(page = 1, pageSize = 10) {
        return get('/legal-tools/document-review/history', {
            page,
            pageSize
        });
    },

    /**
     * 获取审查详情
     * @param {string} reviewId - 审查记录ID
     * @returns {Promise}
     */
    getReviewDetail(reviewId) {
        return get(`/legal-tools/document-review/${reviewId}`);
    },

    /**
     * 删除审查记录
     * @param {string} reviewId - 审查记录ID
     * @returns {Promise}
     */
    deleteReview(reviewId) {
        return del(`/legal-tools/document-review/${reviewId}`);
    },

    // ==================== 法律文书模板 ====================
    
    /**
     * 获取模板分类列表
     * @returns {Promise}
     */
    getTemplateCategories() {
        return get('/legal-tools/templates/categories');
    },

    /**
     * 获取热门模板列表
     * @param {number} limit - 返回数量
     * @returns {Promise}
     */
    getPopularTemplates(limit = 6) {
        return get('/legal-tools/templates/popular', {
            limit
        });
    },

    /**
     * 获取文书模板列表
     * @param {object} params - 查询参数
     * @returns {Promise}
     */
    getTemplateList(params = {}) {
        return get('/legal-tools/templates', {
            category: params.category,      // 分类
            keyword: params.keyword,        // 关键词
            page: params.page || 1,
            pageSize: params.pageSize || 12
        });
    },

    /**
     * 获取模板详情
     * @param {string} templateId - 模板ID
     * @returns {Promise}
     */
    getTemplateDetail(templateId) {
        return get(`/legal-tools/templates/${templateId}`);
    },

    /**
     * 预览模板PDF
     * @param {string} templateId - 模板ID
     * @returns {Promise} 返回PDF文件URL
     */
    previewTemplate(templateId) {
        return get(`/legal-tools/templates/${templateId}/preview`);
    },

    /**
     * 下载模板
     * @param {string} templateId - 模板ID
     * @param {string} templateName - 模板名称
     * @returns {Promise}
     */
    async downloadTemplate(templateId, templateName) {
        const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
        const url = `${API_CONFIG.BASE_URL}/legal-tools/templates/${templateId}/download`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('下载失败');
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${templateName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
            // 记录下载行为
            await this.recordTemplateDownload(templateId);
            
            return { success: true };
        } catch (error) {
            throw new Error('下载失败：' + error.message);
        }
    },

    /**
     * 记录模板下载
     * @param {string} templateId - 模板ID
     * @returns {Promise}
     */
    recordTemplateDownload(templateId) {
        return post('/legal-tools/templates/download-record', {
            templateId,
            downloadTime: new Date().toISOString()
        });
    },

    /**
     * 获取下载记录
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @returns {Promise}
     */
    getDownloadHistory(page = 1, pageSize = 10) {
        return get('/legal-tools/templates/download-history', {
            page,
            pageSize
        });
    },

    // ==================== 智能案例检索 ====================
    
    /**
     * 搜索案例
     * @param {object} params - 搜索参数
     * @returns {Promise}
     */
    searchCases(params = {}) {
        return post('/legal-tools/cases/search', {
            keyword: params.keyword,            // 关键词
            caseType: params.caseType,          // 案例类型
            court: params.court,                // 法院
            dateRange: params.dateRange,        // 日期范围
            page: params.page || 1,
            pageSize: params.pageSize || 10
        });
    },

    /**
     * 获取所有案例（无搜索条件）
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @returns {Promise}
     */
    getAllCases(page = 1, pageSize = 10) {
        return get('/legal-tools/cases', {
            page,
            pageSize
        });
    },

    /**
     * 获取案例详情
     * @param {string} caseId - 案例ID
     * @returns {Promise}
     */
    getCaseDetail(caseId) {
        return get(`/legal-tools/cases/${caseId}`);
    },

    /**
     * 获取案例类型列表
     * @returns {Promise}
     */
    getCaseTypes() {
        return get('/legal-tools/cases/types');
    },
    
    /**
     * 获取法院列表
     * @returns {Promise}
     */
    getCourts() {
        return get('/legal-tools/cases/courts');
    },

    /**
     * 记录搜索历史
     * @param {object} searchParams - 搜索参数
     * @returns {Promise}
     */
    recordSearchHistory(searchParams) {
        return post('/legal-tools/cases/search-history', {
            ...searchParams,
            searchTime: new Date().toISOString()
        });
    },

    /**
     * 获取搜索历史
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @returns {Promise}
     */
    getSearchHistory(page = 1, pageSize = 10) {
        return get('/legal-tools/cases/search-history', {
            page,
            pageSize
        });
    },

    /**
     * 删除单条搜索历史
     * @param {string} historyId - 搜索历史ID
     * @returns {Promise}
     */
    deleteSearchHistory(historyId) {
        return del(`/legal-tools/cases/search-history/${historyId}`);
    },

    /**
     * 清空搜索历史
     * @returns {Promise}
     */
    clearSearchHistory() {
        return del('/legal-tools/cases/search-history/all');
    }
};
