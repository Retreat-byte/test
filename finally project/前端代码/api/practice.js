// 练习记录API接口模块
// 处理正念呼吸、冥想音频等练习的记录和历史查询

const PracticeAPI = {
    // API基础地址（与其他API保持一致）
    baseURL: 'http://localhost:8080/api',
    
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
     * 提交练习记录
     * @param {Object} practiceData - 练习数据
     * @param {string} practiceData.type - 练习类型（breathing/meditation）
     * @param {string} practiceData.name - 练习名称（如：正念呼吸、晨间冥想等）
     * @param {number} practiceData.duration - 持续时长（秒）
     * @param {string} practiceData.audio - 音频文件路径（仅冥想类型需要）
     * @returns {Promise} 返回记录结果
     */
    async submitPractice(practiceData) {
        try {
            // 数据验证
            if (!practiceData.type || !practiceData.name) {
                return {
                    success: false,
                    message: '请提供完整的练习信息'
                };
            }
            
            if (!practiceData.duration || practiceData.duration < 1) {
                return {
                    success: false,
                    message: '练习时长至少为1秒'
                };
            }
            
            // 构建完整数据
            const data = {
                type: practiceData.type, // breathing 或 meditation
                name: practiceData.name,
                duration: Math.round(practiceData.duration), // 秒数，向下取整
                audio: practiceData.audio || null,
                timestamp: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD格式
            };
            
            // 开发模式：保存到localStorage
            if (this.isDevelopment) {
                console.log('📊 [模拟] 提交练习记录:', data);
                
                // 保存到localStorage
                const history = this.getLocalPracticeHistory();
                const record = {
                    id: `practice_${Date.now()}`,
                    ...data
                };
                history.push(record);
                localStorage.setItem('practiceHistory', JSON.stringify(history));
                
                return {
                    success: true,
                    message: '练习记录保存成功',
                    data: record
                };
            }
            
            // 生产模式：调用真实API
            const response = await fetch(`${this.baseURL}/practices`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('记录保存失败');
            }
            
            const result = await response.json();
            
            // 更新本地缓存
            if (result.success) {
                const history = this.getLocalPracticeHistory();
                history.push(data);
                localStorage.setItem('practiceHistory', JSON.stringify(history));
            }
            
            return result;
            
        } catch (error) {
            console.error('提交练习记录错误:', error);
            return {
                success: false,
                message: '记录保存失败，请检查网络连接'
            };
        }
    },
    
    /**
     * 获取练习历史记录
     * @param {Object} options - 查询选项
     * @param {number} options.days - 获取最近多少天的记录（默认30天）
     * @param {string} options.type - 筛选类型（breathing/meditation，不传则返回全部）
     * @param {number} options.limit - 限制返回数量（默认不限制）
     * @returns {Promise} 返回历史记录列表
     */
    async getPracticeHistory(options = {}) {
        try {
            const { days = 30, type = null, limit = null } = options;
            
            // 开发模式：从localStorage读取
            if (this.isDevelopment) {
                let history = this.getLocalPracticeHistory();
                
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
            
            const response = await fetch(`${this.baseURL}/practices/history?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取历史记录失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取练习历史错误:', error);
            return {
                success: false,
                message: '获取历史记录失败'
            };
        }
    },
    
    /**
     * 获取练习统计数据
     * @returns {Promise} 返回统计信息
     */
    async getPracticeStatistics() {
        try {
            // 开发模式：本地计算
            if (this.isDevelopment) {
                const history = this.getLocalPracticeHistory();
                
                // 总练习次数
                const totalPractices = history.length;
                
                // 呼吸练习次数
                const breathingCount = history.filter(p => p.type === 'breathing').length;
                
                // 冥想练习次数
                const meditationCount = history.filter(p => p.type === 'meditation').length;
                
                // 累计练习时长（分钟）
                const totalMinutes = Math.floor(
                    history.reduce((sum, p) => sum + (p.duration || 0), 0) / 60
                );
                
                // 累计呼吸时长（分钟）
                const breathingMinutes = Math.floor(
                    history
                        .filter(p => p.type === 'breathing')
                        .reduce((sum, p) => sum + (p.duration || 0), 0) / 60
                );
                
                // 累计冥想时长（分钟）
                const meditationMinutes = Math.floor(
                    history
                        .filter(p => p.type === 'meditation')
                        .reduce((sum, p) => sum + (p.duration || 0), 0) / 60
                );
                
                // 最近7天的练习次数
                const today = new Date();
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const count = history.filter(p => p.date === dateStr).length;
                    last7Days.push({
                        date: dateStr,
                        count: count
                    });
                }
                
                // 最常练习的类型
                let favoriteType = 'none';
                if (breathingCount > meditationCount) {
                    favoriteType = 'breathing';
                } else if (meditationCount > breathingCount) {
                    favoriteType = 'meditation';
                } else if (breathingCount > 0 && meditationCount > 0) {
                    favoriteType = 'both';
                }
                
                // 平均每次练习时长（分钟）
                const avgDuration = totalPractices > 0 
                    ? Math.floor(totalMinutes / totalPractices) 
                    : 0;
                
                return {
                    success: true,
                    data: {
                        totalPractices: totalPractices,
                        breathingCount: breathingCount,
                        meditationCount: meditationCount,
                        totalMinutes: totalMinutes,
                        breathingMinutes: breathingMinutes,
                        meditationMinutes: meditationMinutes,
                        avgDuration: avgDuration,
                        favoriteType: favoriteType,
                        last7Days: last7Days
                    }
                };
            }
            
            // 生产模式：调用API
            const response = await fetch(`${this.baseURL}/practices/statistics`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取统计数据失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取练习统计错误:', error);
            return {
                success: false,
                message: '获取统计数据失败'
            };
        }
    },
    
    /**
     * 删除练习记录
     * @param {string} practiceId - 练习记录ID
     * @returns {Promise} 返回删除结果
     */
    async deletePractice(practiceId) {
        try {
            // 开发模式：从localStorage删除
            if (this.isDevelopment) {
                const history = this.getLocalPracticeHistory();
                const filteredHistory = history.filter(item => item.id !== practiceId);
                localStorage.setItem('practiceHistory', JSON.stringify(filteredHistory));
                
                return {
                    success: true,
                    message: '删除成功'
                };
            }
            
            // 生产模式：调用API
            const response = await fetch(`${this.baseURL}/practices/${practiceId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('删除失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('删除练习记录错误:', error);
            return {
                success: false,
                message: '删除失败'
            };
        }
    },
    
    /**
     * 开始练习（创建临时会话）
     * @param {Object} sessionData - 会话数据
     * @param {string} sessionData.type - 练习类型
     * @param {string} sessionData.name - 练习名称
     * @returns {Object} 返回会话信息
     */
    startPracticeSession(sessionData) {
        const session = {
            id: `session_${Date.now()}`,
            type: sessionData.type,
            name: sessionData.name,
            audio: sessionData.audio || null,
            startTime: Date.now(),
            startTimestamp: new Date().toISOString()
        };
        
        // 保存到sessionStorage（临时存储）
        sessionStorage.setItem('currentPracticeSession', JSON.stringify(session));
        
        console.log('🎯 开始练习会话:', session);
        
        return session;
    },
    
    /**
     * 结束练习（自动提交记录）
     * @returns {Promise} 返回提交结果
     */
    async endPracticeSession() {
        try {
            // 获取当前会话
            const sessionStr = sessionStorage.getItem('currentPracticeSession');
            if (!sessionStr) {
                return {
                    success: false,
                    message: '没有正在进行的练习会话'
                };
            }
            
            const session = JSON.parse(sessionStr);
            
            // 计算持续时长（秒）
            const duration = Math.floor((Date.now() - session.startTime) / 1000);
            
            // 提交记录
            const result = await this.submitPractice({
                type: session.type,
                name: session.name,
                audio: session.audio,
                duration: duration
            });
            
            // 清除会话
            if (result.success) {
                sessionStorage.removeItem('currentPracticeSession');
                console.log('✅ 练习会话结束，时长:', duration, '秒');
            }
            
            return result;
            
        } catch (error) {
            console.error('结束练习会话错误:', error);
            return {
                success: false,
                message: '结束练习失败'
            };
        }
    },
    
    /**
     * 获取当前练习会话信息
     * @returns {Object|null} 返回会话信息或null
     */
    getCurrentSession() {
        const sessionStr = sessionStorage.getItem('currentPracticeSession');
        if (!sessionStr) return null;
        
        try {
            const session = JSON.parse(sessionStr);
            // 计算已经练习的时长
            session.elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
            return session;
        } catch (error) {
            console.error('获取当前会话错误:', error);
            return null;
        }
    },
    
    /**
     * 取消当前练习会话
     */
    cancelPracticeSession() {
        sessionStorage.removeItem('currentPracticeSession');
        console.log('❌ 练习会话已取消');
    },
    
    // ==================== 辅助方法 ====================
    
    /**
     * 从localStorage获取练习历史
     */
    getLocalPracticeHistory() {
        try {
            const stored = localStorage.getItem('practiceHistory');
            if (stored) {
                return JSON.parse(stored);
            } else {
                // 如果没有数据，返回空数组
                return [];
            }
        } catch (error) {
            console.error('读取本地练习历史错误:', error);
            return [];
        }
    },
    
    /**
     * 格式化时长显示
     * @param {number} seconds - 秒数
     * @returns {string} 格式化的时长字符串
     */
    formatDuration(seconds) {
        if (!seconds || seconds < 0) return '0秒';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${secs}秒`;
        } else {
            return `${secs}秒`;
        }
    },
    
    /**
     * 获取练习类型的中文名称
     * @param {string} type - 练习类型
     * @returns {string} 中文名称
     */
    getTypeName(type) {
        const typeNames = {
            'breathing': '正念呼吸',
            'meditation': '冥想音频'
        };
        return typeNames[type] || type;
    }
};

// 导出API（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PracticeAPI;
}

