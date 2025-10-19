// 心情打卡API接口模块
// 处理心情记录、获取历史记录、生成趋势分析等功能

const MoodAPI = {
    // API基础地址（与UserAPI保持一致）
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
     * 提交今日心情打卡
     * @param {Object} moodData - 心情数据
     * @param {string} moodData.mood - 心情文字（如："开心"、"难过"）
     * @param {number} moodData.value - 心情分数（1-10）
     * @returns {Promise} 返回打卡结果
     */
    async checkinMood(moodData) {
        try {
            // 数据验证
            if (!moodData.mood || !moodData.value) {
                return {
                    success: false,
                    message: '请选择你的心情'
                };
            }
            
            // 构建完整的数据
            const data = {
                mood: moodData.mood,
                value: moodData.value,
                timestamp: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD格式
            };
            
            // 开发模式：使用模拟数据
            if (this.isDevelopment) {
                console.log('📊 [模拟] 提交心情打卡:', data);
                
                // 保存到localStorage（模拟数据库）
                const moodHistory = this.getLocalMoodHistory();
                moodHistory.push(data);
                localStorage.setItem('moodData', JSON.stringify(moodHistory));
                
                return {
                    success: true,
                    message: '打卡成功！',
                    data: {
                        id: Date.now(),
                        ...data,
                        streak: this.calculateStreak(moodHistory) // 连续打卡天数
                    }
                };
            }
            
            // 生产模式：调用真实API
            const response = await fetch(`${this.baseURL}/moods`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('打卡失败');
            }
            
            const result = await response.json();
            
            // 更新本地缓存
            if (result.success) {
                const moodHistory = this.getLocalMoodHistory();
                moodHistory.push(data);
                localStorage.setItem('moodData', JSON.stringify(moodHistory));
            }
            
            return result;
            
        } catch (error) {
            console.error('心情打卡错误:', error);
            return {
                success: false,
                message: '打卡失败，请检查网络连接'
            };
        }
    },
    
    /**
     * 获取今日打卡状态
     * @returns {Promise} 返回今日是否已打卡
     */
    async getTodayCheckin() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // 开发模式：从localStorage读取
            if (this.isDevelopment) {
                const moodHistory = this.getLocalMoodHistory();
                const todayMood = moodHistory.find(item => item.date === today);
                
                return {
                    success: true,
                    data: {
                        hasCheckedIn: !!todayMood,
                        moodData: todayMood || null
                    }
                };
            }
            
            // 生产模式：调用API
            const response = await fetch(`${this.baseURL}/moods/today`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取今日打卡状态失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取今日打卡状态错误:', error);
            return {
                success: false,
                message: '获取失败'
            };
        }
    },
    
    /**
     * 获取心情历史记录
     * @param {number} days - 获取最近多少天的记录（默认30天）
     * @returns {Promise} 返回历史记录列表
     */
    async getMoodHistory(days = 30) {
        try {
            // 开发模式：从localStorage读取
            if (this.isDevelopment) {
                const moodHistory = this.getLocalMoodHistory();
                
                // 只返回最近N天的数据
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
                
                const recentMoods = moodHistory.filter(item => item.date >= cutoffDateStr);
                
                return {
                    success: true,
                    data: recentMoods.reverse() // 最新的在前
                };
            }
            
            // 生产模式：调用API
            const response = await fetch(`${this.baseURL}/moods?days=${days}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取历史记录失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取心情历史错误:', error);
            return {
                success: false,
                message: '获取历史记录失败'
            };
        }
    },
    
    /**
     * 获取心情统计数据
     * @returns {Promise} 返回统计信息（最近7天平均分、近一个月平均分、趋势等）
     */
    async getMoodStatistics() {
        try {
            // 开发模式：本地计算
            if (this.isDevelopment) {
                const moodHistory = this.getLocalMoodHistory();
                const today = new Date();
                
                // 计算累计打卡天数
                const totalDays = moodHistory.length;
                
                // 计算最近7天的数据
                const recent7DaysData = [];
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const moodEntry = moodHistory.find(entry => entry.date === dateStr);
                    if (moodEntry) {
                        recent7DaysData.push(moodEntry);
                    }
                }
                
                // 计算最近30天的数据
                const recent30DaysData = [];
                for (let i = 0; i < 30; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const moodEntry = moodHistory.find(entry => entry.date === dateStr);
                    if (moodEntry) {
                        recent30DaysData.push(moodEntry);
                    }
                }
                
                // 计算最近7天平均分
                let recentAverage = 100; // 默认值表示无数据
                if (recent7DaysData.length > 0) {
                    const sum = recent7DaysData.reduce((total, item) => total + item.value, 0);
                    recentAverage = parseFloat((sum / recent7DaysData.length).toFixed(1));
                }
                
                // 计算近一个月平均分
                let monthAverageScore = 100; // 默认值表示无数据
                if (recent30DaysData.length > 0) {
                    const sum = recent30DaysData.reduce((total, item) => total + item.value, 0);
                    monthAverageScore = parseFloat((sum / recent30DaysData.length).toFixed(1));
                }
                
                // 计算趋势（与上一次打卡相比）
                let trend = 'no_data';
                if (moodHistory.length >= 2) {
                    const sortedHistory = [...moodHistory].sort((a, b) => 
                        new Date(b.date) - new Date(a.date)
                    );
                    const latestValue = sortedHistory[0].value;
                    const previousValue = sortedHistory[1].value;
                    
                    if (latestValue > previousValue) {
                        trend = 'improving';
                    } else if (latestValue < previousValue) {
                        trend = 'declining';
                    } else {
                        trend = 'stable';
                    }
                } else if (moodHistory.length === 1) {
                    // 只有一次打卡，无法比较
                    trend = 'no_data';
                }
                
                return {
                    success: true,
                    data: {
                        totalDays: totalDays,
                        recentAverage: recentAverage,
                        monthAverageScore: monthAverageScore,
                        trend: trend
                    }
                };
            }
            
            // 生产模式：调用API
            const response = await fetch(`${this.baseURL}/moods/statistics`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取统计数据失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取心情统计错误:', error);
            return {
                success: false,
                message: '获取统计数据失败'
            };
        }
    },
    
    /**
     * 删除某条心情记录
     * @param {number|string} moodId - 心情记录ID
     * @returns {Promise} 返回删除结果
     */
    async deleteMood(moodId) {
        try {
            // 开发模式：从localStorage删除
            if (this.isDevelopment) {
                const moodHistory = this.getLocalMoodHistory();
                const filteredHistory = moodHistory.filter(item => item.timestamp !== moodId);
                localStorage.setItem('moodData', JSON.stringify(filteredHistory));
                
                return {
                    success: true,
                    message: '删除成功'
                };
            }
            
            // 生产模式：调用API
            const response = await fetch(`${this.baseURL}/moods/${moodId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('删除失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('删除心情记录错误:', error);
            return {
                success: false,
                message: '删除失败'
            };
        }
    },
    
    /**
     * 从localStorage获取心情历史（本地辅助方法）
     */
    getLocalMoodHistory() {
        try {
            const stored = localStorage.getItem('moodData');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('读取本地心情数据错误:', error);
            return [];
        }
    },
    
    /**
     * 计算连续打卡天数（本地辅助方法）
     */
    calculateStreak(moodHistory) {
        if (moodHistory.length === 0) return 0;
        
        // 按日期排序（最新的在前）
        const sortedHistory = [...moodHistory].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < sortedHistory.length; i++) {
            const recordDate = new Date(sortedHistory[i].date);
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            
            const recordDateStr = recordDate.toISOString().split('T')[0];
            const expectedDateStr = expectedDate.toISOString().split('T')[0];
            
            if (recordDateStr === expectedDateStr) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
};

// 导出API（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoodAPI;
}


