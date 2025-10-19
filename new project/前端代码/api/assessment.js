// 测评报告API接口模块
// 处理心理测评报告的保存和历史查询

const AssessmentAPI = {
    // API基础地址（与其他API保持一致）
    baseURL: 'http://localhost:8081/api',
    
    // 开发模式标志
    isDevelopment: false,
    
    /**
     * 获取请求头（包含认证token）
     */
    getHeaders() {
        const token = localStorage.getItem('userToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },
    
    /**
     * 提交测评报告
     * @param {Object} reportData - 报告数据
     * @param {string} reportData.type - 测评类型（apeskPstr/sas/sds/bai/psqi/dass21/scl90）
     * @param {string} reportData.name - 测评名称
     * @param {number} reportData.score - 测评分数
     * @param {string} reportData.level - 结果等级（如：轻度焦虑、中度抑郁等）
     * @param {string} reportData.analysis - 结果分析文字
     * @param {Object} reportData.factorScores - 因子分数（可选，用于SCL-90、DASS-21等）
     * @returns {Promise} 返回保存结果
     */
    async submitReport(reportData) {
        try {
            // 数据验证
            if (!reportData.type || !reportData.name) {
                return {
                    success: false,
                    message: '请提供完整的测评信息'
                };
            }
            
            if (reportData.score === undefined || reportData.score === null) {
                return {
                    success: false,
                    message: '测评分数不能为空'
                };
            }
            
            // 构建完整数据
            const data = {
                type: reportData.type,
                name: reportData.name,
                score: reportData.score,
                level: reportData.level || '',
                analysis: reportData.analysis || '',
                factorScores: reportData.factorScores || null,
                timestamp: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD格式
            };
            
            // 开发模式：保存到localStorage
            if (this.isDevelopment) {
                console.log('📊 [模拟] 提交测评报告:', data);
                
                // 保存到localStorage
                const history = this.getLocalAssessmentHistory();
                const report = {
                    id: `assessment_${Date.now()}`,
                    ...data
                };
                history.push(report);
                localStorage.setItem('assessmentHistory', JSON.stringify(history));
                
                return {
                    success: true,
                    message: '测评报告保存成功',
                    data: report
                };
            }
            
            // 生产模式：调用真实API
            const response = await fetch(`${this.baseURL}/assessments`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('报告保存失败');
            }
            
            const result = await response.json();
            
            // 更新本地缓存
            if (result.success) {
                const history = this.getLocalAssessmentHistory();
                history.push(data);
                localStorage.setItem('assessmentHistory', JSON.stringify(history));
            }
            
            return result;
            
        } catch (error) {
            console.error('提交测评报告错误:', error);
            return {
                success: false,
                message: '报告保存失败，请检查网络连接'
            };
        }
    },
    
    /**
     * 获取测评报告历史
     * @param {Object} options - 查询选项
     * @param {number} options.days - 获取最近多少天的记录（默认90天）
     * @param {string} options.type - 筛选类型（可选）
     * @param {number} options.limit - 限制返回数量（默认不限制）
     * @returns {Promise} 返回历史记录列表
     */
    async getReportHistory(options = {}) {
        try {
            const { days = 90, type = null, limit = null } = options;
            
            // 开发模式：从localStorage读取
            if (this.isDevelopment) {
                let history = this.getLocalAssessmentHistory();
                
                // 按日期筛选
                if (days) {
                    const cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - days);
                    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
                    history = history.filter(item => item.date >= cutoffDateStr);
                }
                
                // 按类型筛选
                if (type) {
                    history = history.filter(item => item.type === type);
                }
                
                // 按时间倒序排列（最新的在前）
                history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                // 限制返回数量
                if (limit && limit > 0) {
                    history = history.slice(0, limit);
                }
                
                return {
                    success: true,
                    data: history
                };
            }
            
            // 生产模式：调用API
            const params = new URLSearchParams();
            if (days) params.append('days', days);
            if (type) params.append('type', type);
            if (limit) params.append('limit', limit);
            
            const response = await fetch(`${this.baseURL}/assessments/history?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取历史记录失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取测评历史错误:', error);
            return {
                success: false,
                message: '获取历史记录失败'
            };
        }
    },
    
    /**
     * 获取指定测评报告详情
     * @param {string} reportId - 报告ID
     * @returns {Promise} 返回报告详情
     */
    async getReportDetail(reportId) {
        try {
            // 开发模式：从localStorage读取
            if (this.isDevelopment) {
                const history = this.getLocalAssessmentHistory();
                const report = history.find(item => item.id === reportId);
                
                if (report) {
                    return {
                        success: true,
                        data: report
                    };
                } else {
                    return {
                        success: false,
                        message: '未找到该报告'
                    };
                }
            }
            
            // 生产模式：调用API
            const response = await fetch(`${this.baseURL}/assessments/${reportId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取报告详情失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取报告详情错误:', error);
            return {
                success: false,
                message: '获取报告详情失败'
            };
        }
    },
    
    /**
     * 获取测评统计数据
     * @returns {Promise} 返回统计信息
     */
    async getAssessmentStatistics() {
        try {
            // 开发模式：本地计算
            if (this.isDevelopment) {
                const history = this.getLocalAssessmentHistory();
                
                // 总测评次数
                const totalAssessments = history.length;
                
                // 按类型统计
                const typeCount = {
                    apeskPstr: history.filter(r => r.type === 'apeskPstr').length,
                    sas: history.filter(r => r.type === 'sas').length,
                    sds: history.filter(r => r.type === 'sds').length,
                    bai: history.filter(r => r.type === 'bai').length,
                    psqi: history.filter(r => r.type === 'psqi').length,
                    dass21: history.filter(r => r.type === 'dass21').length,
                    scl90: history.filter(r => r.type === 'scl90').length
                };
                
                // 最近一次测评
                const latestReport = history.length > 0 
                    ? history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
                    : null;
                
                // 最近30天的测评次数
                const today = new Date();
                const last30Days = [];
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const count = history.filter(r => r.date === dateStr).length;
                    last30Days.push({
                        date: dateStr,
                        count: count
                    });
                }
                
                return {
                    success: true,
                    data: {
                        totalAssessments: totalAssessments,
                        typeCount: typeCount,
                        latestReport: latestReport,
                        last30Days: last30Days
                    }
                };
            }
            
            // 生产模式：调用API
            const response = await fetch(`${this.baseURL}/assessments/statistics`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取统计数据失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取测评统计错误:', error);
            return {
                success: false,
                message: '获取统计数据失败'
            };
        }
    },
    
    /**
     * 删除测评报告
     * @param {string} reportId - 报告ID
     * @returns {Promise} 返回删除结果
     */
    async deleteReport(reportId) {
        try {
            // 开发模式：从localStorage删除
            if (this.isDevelopment) {
                const history = this.getLocalAssessmentHistory();
                const filteredHistory = history.filter(item => item.id !== reportId);
                localStorage.setItem('assessmentHistory', JSON.stringify(filteredHistory));
                
                return {
                    success: true,
                    message: '删除成功'
                };
            }
            
            // 生产模式：调用API
            const response = await fetch(`${this.baseURL}/assessments/${reportId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('删除失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('删除测评报告错误:', error);
            return {
                success: false,
                message: '删除失败'
            };
        }
    },
    
    // ==================== 辅助方法 ====================
    
    /**
     * 从localStorage获取测评历史
     */
    getLocalAssessmentHistory() {
        try {
            const stored = localStorage.getItem('assessmentHistory');
            if (stored) {
                return JSON.parse(stored);
            } else {
                // 如果没有数据，初始化一些示例数据
                const mockData = this.generateMockAssessmentData();
                localStorage.setItem('assessmentHistory', JSON.stringify(mockData));
                return mockData;
            }
        } catch (error) {
            console.error('读取本地测评历史错误:', error);
            return [];
        }
    },
    
    /**
     * 生成模拟测评数据（开发用）
     */
    generateMockAssessmentData() {
        const assessments = [
            {
                id: 'assessment_1',
                type: 'sds',
                name: 'SDS 抑郁自评量表',
                score: 65,
                level: '中度抑郁',
                analysis: '您目前处于中度抑郁状态。建议找心理专家咨询。主要问题可能包括：经常感到情绪消沉郁闷、要哭或想哭、夜间睡眠不好、体重减轻、便秘、感到心跳加快、感到疲劳、坐卧不安、容易激怒、想到死。建议您积极寻求心理咨询，学习情绪管理技巧，同时保持规律作息，适当运动。',
                factorScores: null,
                timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 'assessment_2',
                type: 'sas',
                name: 'SAS 焦虑自评量表',
                score: 58,
                level: '轻度焦虑',
                analysis: '您目前处于轻度焦虑状态。建议进行自我调节。主要问题可能包括：感到紧张不安、容易担心、坐立不安、感到疲乏、注意力难以集中、易怒、肌肉紧张、睡眠困难。建议您每天练习深呼吸和正念冥想，减少咖啡因摄入，合理安排工作和休息时间，给自己留出放松的时间。',
                factorScores: null,
                timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
                date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 'assessment_3',
                type: 'apeskPstr',
                name: 'APESK-PSTR 心理压力量表',
                score: 72,
                level: '中等压力',
                analysis: '您目前承受着中等程度的心理压力。建议学习压力管理技巧。主要问题可能包括：工作任务较重、时间压力大、人际关系紧张、工作生活失衡、易烦躁焦虑、睡眠质量下降。建议您列出任务清单分清轻重缓急，学习并实践渐进式肌肉放松和冥想，设置明确的工作边界保证休息时间，必要时寻求专业心理咨询。',
                factorScores: null,
                timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 'assessment_4',
                type: 'psqi',
                name: 'PSQI 匹兹堡睡眠质量指数',
                score: 12,
                level: '睡眠质量较差',
                analysis: '您的睡眠质量较差。建议改善睡眠习惯。主要问题可能包括：入睡困难、睡眠时间短、睡眠效率低、白天功能受影响、易醒多梦。建议您每天固定时间上床起床（包括周末），确保卧室安静黑暗凉爽，睡前1小时避免使用电子设备，下午3点后避免咖啡因，睡前3小时避免大量饮食。',
                factorScores: null,
                timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 'assessment_5',
                type: 'scl90',
                name: 'SCL-90 心理健康自评量表',
                score: 185,
                level: '轻度症状',
                analysis: '您的心理健康状况总体尚可，但在某些方面存在轻度症状。主要问题可能包括：偶尔感到身体不适、有时出现强迫性思维、人际交往中较为敏感、存在轻微抑郁情绪、偶尔感到焦虑。建议您注意身体症状可能与心理压力有关，学习放松技巧，尝试更开放的沟通方式，培养兴趣爱好增加积极体验，定期进行心理健康自我评估。',
                factorScores: {
                    躯体化: 1.8,
                    强迫症状: 2.1,
                    人际关系敏感: 2.3,
                    抑郁: 2.0,
                    焦虑: 1.9,
                    敌对: 1.5,
                    恐怖: 1.4,
                    偏执: 1.6,
                    精神病性: 1.7
                },
                timestamp: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
                date: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        ];
        
        return assessments;
    },
    
    /**
     * 获取测评类型的中文名称
     * @param {string} type - 测评类型
     * @returns {string} 中文名称
     */
    getTypeName(type) {
        const typeNames = {
            'apeskPstr': 'APESK-PSTR 心理压力量表',
            'sas': 'SAS 焦虑自评量表',
            'sds': 'SDS 抑郁自评量表',
            'bai': 'BAI 贝克焦虑测试',
            'psqi': 'PSQI 匹兹堡睡眠质量指数',
            'dass21': 'DASS-21 抑郁焦虑压力量表',
            'scl90': 'SCL-90 心理健康自评量表'
        };
        return typeNames[type] || type;
    },
    
    /**
     * 获取测评类型的图标
     * @param {string} type - 测评类型
     * @returns {string} FontAwesome图标类名
     */
    getTypeIcon(type) {
        const typeIcons = {
            'apeskPstr': 'fa-chart-line',
            'sas': 'fa-exclamation-triangle',
            'sds': 'fa-cloud-rain',
            'bai': 'fa-heartbeat',
            'psqi': 'fa-bed',
            'dass21': 'fa-chart-pie',
            'scl90': 'fa-notes-medical'
        };
        return typeIcons[type] || 'fa-file-alt';
    }
};

// 导出API（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssessmentAPI;
}

