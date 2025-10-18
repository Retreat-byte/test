// 个人设置和成就API接口模块
// 处理用户个人信息、成就勋章等功能

const ProfileAPI = {
    // API基础地址（与UserAPI保持一致）
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
     * 获取用户完整个人信息
     * @returns {Promise} 返回用户详细信息
     */
    async getUserProfile() {
        try {
            // 开发模式：从localStorage读取并生成模拟数据
            if (this.isDevelopment) {
                console.log('📊 [模拟] 获取用户个人信息');
                
                // 获取基础用户信息
                const userInfo = localStorage.getItem('userInfo');
                const user = userInfo ? JSON.parse(userInfo) : {
                    id: Date.now(),
                    phone: '13800138000',
                    nickname: '情绪岛居民'
                };
                
                // 获取用户设置
                const settings = this.getLocalSettings();
                
                // 获取心情数据
                const moodHistory = this.getLocalMoodHistory();
                
                // 获取练习历史
                const practiceHistory = this.getLocalPracticeHistory();
                
                // 获取测评历史
                const assessmentHistory = this.getLocalAssessmentHistory();
                
                // 计算注册天数
                const registrationDate = settings.registrationDate || new Date().toISOString().split('T')[0];
                const daysFromRegistration = this.calculateDaysBetween(registrationDate, new Date().toISOString().split('T')[0]);
                
                const profileData = {
                    id: user.id,
                    phone: user.phone,
                    nickname: settings.nickname || user.nickname || '情绪岛居民',
                    avatar: settings.avatar || null,
                    gender: settings.gender || 'female',
                    birthday: settings.birthday || '1995-06-15',
                    registrationDate: registrationDate,
                    daysFromRegistration: daysFromRegistration,
                    statistics: {
                        totalCheckins: moodHistory.length, // 打卡天数
                        totalPractices: practiceHistory.length, // 练习次数
                        totalAssessments: assessmentHistory.length // 完成的测评数
                    }
                };
                
                return {
                    success: true,
                    data: profileData
                };
            }
            
            // 生产模式：调用真实API
            const response = await fetch(`${this.baseURL}/profile/info`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取个人信息失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取个人信息错误:', error);
            return {
                success: false,
                message: '获取个人信息失败'
            };
        }
    },
    
    /**
     * 更新个人设置
     * @param {Object} settings - 设置数据
     * @param {string} settings.nickname - 昵称
     * @param {string} settings.avatar - 头像URL
     * @param {string} settings.gender - 性别（male/female/other）
     * @param {string} settings.birthday - 生日（YYYY-MM-DD格式）
     * @returns {Promise} 返回更新结果
     */
    async updateProfile(settings) {
        try {
            // 数据验证
            if (settings.nickname && settings.nickname.trim().length === 0) {
                return {
                    success: false,
                    message: '昵称不能为空'
                };
            }
            
            if (settings.nickname && settings.nickname.length > 20) {
                return {
                    success: false,
                    message: '昵称长度不能超过20个字符'
                };
            }
            
            // 验证生日格式
            if (settings.birthday && !this.isValidDate(settings.birthday)) {
                return {
                    success: false,
                    message: '请输入正确的生日格式'
                };
            }
            
            // 开发模式：保存到localStorage
            if (this.isDevelopment) {
                console.log('📊 [模拟] 更新个人设置:', settings);
                
                // 获取现有设置
                const currentSettings = this.getLocalSettings();
                
                // 合并新设置
                const updatedSettings = {
                    ...currentSettings,
                    ...settings,
                    updatedAt: new Date().toISOString()
                };
                
                // 保存到localStorage
                localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
                
                // 同时更新userInfo中的昵称
                if (settings.nickname) {
                    const userInfo = localStorage.getItem('userInfo');
                    if (userInfo) {
                        const user = JSON.parse(userInfo);
                        user.nickname = settings.nickname;
                        localStorage.setItem('userInfo', JSON.stringify(user));
                    }
                }
                
                return {
                    success: true,
                    message: '设置保存成功',
                    data: updatedSettings
                };
            }
            
            // 生产模式：调用真实API
            const response = await fetch(`${this.baseURL}/profile/update`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(settings)
            });
            
            if (!response.ok) {
                throw new Error('更新设置失败');
            }
            
            const result = await response.json();
            
            // 更新本地缓存
            if (result.success) {
                const currentSettings = this.getLocalSettings();
                const updatedSettings = { ...currentSettings, ...settings };
                localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
            }
            
            return result;
            
        } catch (error) {
            console.error('更新个人设置错误:', error);
            return {
                success: false,
                message: '保存设置失败，请稍后重试'
            };
        }
    },
    
    /**
     * 上传头像
     * @param {File} file - 头像文件
     * @returns {Promise} 返回上传结果
     */
    async uploadAvatar(file) {
        try {
            // 验证文件
            if (!file) {
                return {
                    success: false,
                    message: '请选择要上传的图片'
                };
            }
            
            // 验证文件类型
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                return {
                    success: false,
                    message: '只支持JPG、PNG、GIF格式的图片'
                };
            }
            
            // 验证文件大小（最大2MB）
            const maxSize = 2 * 1024 * 1024;
            if (file.size > maxSize) {
                return {
                    success: false,
                    message: '图片大小不能超过2MB'
                };
            }
            
            // 开发模式：使用Base64模拟
            if (this.isDevelopment) {
                console.log('📊 [模拟] 上传头像:', file.name);
                
                // 转换为Base64
                const base64 = await this.fileToBase64(file);
                
                // 保存到localStorage
                const settings = this.getLocalSettings();
                settings.avatar = base64;
                localStorage.setItem('userSettings', JSON.stringify(settings));
                
                return {
                    success: true,
                    message: '头像上传成功',
                    data: {
                        avatar: base64
                    }
                };
            }
            
            // 生产模式：上传到服务器
            const formData = new FormData();
            formData.append('avatar', file);
            
            const token = localStorage.getItem('userToken');
            const response = await fetch(`${this.baseURL}/profile/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('上传头像失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('上传头像错误:', error);
            return {
                success: false,
                message: '上传失败，请稍后重试'
            };
        }
    },
    
    /**
     * 获取成就勋章列表
     * @returns {Promise} 返回成就列表
     */
    async getAchievements() {
        try {
            // 开发模式：计算成就
            if (this.isDevelopment) {
                console.log('📊 [模拟] 获取成就勋章');
                
                const moodHistory = this.getLocalMoodHistory();
                const practiceHistory = this.getLocalPracticeHistory();
                const assessmentHistory = this.getLocalAssessmentHistory();
                const registrationDate = this.getLocalSettings().registrationDate || new Date().toISOString().split('T')[0];
                
                // 计算连续打卡天数
                const currentStreak = this.calculateStreak(moodHistory);
                
                // 定义成就规则
                const achievements = [
                    {
                        id: 'first_checkin',
                        name: '初心者',
                        description: '完成第一次打卡',
                        icon: 'fa-heart',
                        color: 'purple',
                        unlocked: moodHistory.length >= 1,
                        unlockedDate: moodHistory.length >= 1 ? moodHistory[0].date : null,
                        progress: moodHistory.length >= 1 ? 1 : 0,
                        total: 1
                    },
                    {
                        id: 'streak_7',
                        name: '坚持者',
                        description: '连续打卡7天',
                        icon: 'fa-calendar-check',
                        color: 'blue',
                        unlocked: currentStreak >= 7,
                        unlockedDate: currentStreak >= 7 ? this.getStreakUnlockDate(moodHistory, 7) : null,
                        progress: Math.min(currentStreak, 7),
                        total: 7
                    },
                    {
                        id: 'practice_10',
                        name: '呼吸大师',
                        description: '完成10次呼吸练习',
                        icon: 'fa-wind',
                        color: 'green',
                        unlocked: practiceHistory.length >= 10,
                        unlockedDate: practiceHistory.length >= 10 ? practiceHistory[9].date : null,
                        progress: Math.min(practiceHistory.length, 10),
                        total: 10
                    },
                    {
                        id: 'meditation_60',
                        name: '冥想达人',
                        description: '累计冥想60分钟',
                        icon: 'fa-om',
                        color: 'purple',
                        unlocked: this.getTotalMeditationMinutes(practiceHistory) >= 60,
                        unlockedDate: this.getMeditationUnlockDate(practiceHistory, 60),
                        progress: Math.min(this.getTotalMeditationMinutes(practiceHistory), 60),
                        total: 60
                    },
                    {
                        id: 'streak_30',
                        name: '情绪管理师',
                        description: '连续打卡30天',
                        icon: 'fa-trophy',
                        color: 'blue',
                        unlocked: currentStreak >= 30,
                        unlockedDate: currentStreak >= 30 ? this.getStreakUnlockDate(moodHistory, 30) : null,
                        progress: Math.min(currentStreak, 30),
                        total: 30
                    },
                    {
                        id: 'assessment_5',
                        name: '心理探索者',
                        description: '完成5项测评',
                        icon: 'fa-star',
                        color: 'green',
                        unlocked: assessmentHistory.length >= 5,
                        unlockedDate: assessmentHistory.length >= 5 ? assessmentHistory[4].date : null,
                        progress: Math.min(assessmentHistory.length, 5),
                        total: 5
                    },
                    {
                        id: 'checkin_50',
                        name: '情绪记录家',
                        description: '累计打卡50天',
                        icon: 'fa-book',
                        color: 'blue',
                        unlocked: moodHistory.length >= 50,
                        unlockedDate: moodHistory.length >= 50 ? moodHistory[49].date : null,
                        progress: Math.min(moodHistory.length, 50),
                        total: 50
                    },
                    {
                        id: 'assessment_10',
                        name: '自我认知者',
                        description: '完成10项测评',
                        icon: 'fa-brain',
                        color: 'purple',
                        unlocked: assessmentHistory.length >= 10,
                        unlockedDate: assessmentHistory.length >= 10 ? assessmentHistory[9].date : null,
                        progress: Math.min(assessmentHistory.length, 10),
                        total: 10
                    },
                    {
                        id: 'practice_50',
                        name: '正念修行者',
                        description: '完成50次练习',
                        icon: 'fa-spa',
                        color: 'green',
                        unlocked: practiceHistory.length >= 50,
                        unlockedDate: practiceHistory.length >= 50 ? practiceHistory[49].date : null,
                        progress: Math.min(practiceHistory.length, 50),
                        total: 50
                    }
                ];
                
                return {
                    success: true,
                    data: achievements
                };
            }
            
            // 生产模式：调用真实API
            const response = await fetch(`${this.baseURL}/profile/achievements`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('获取成就失败');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('获取成就错误:', error);
            return {
                success: false,
                message: '获取成就失败'
            };
        }
    },
    
    // ==================== 辅助方法 ====================
    
    /**
     * 从localStorage获取用户设置
     */
    getLocalSettings() {
        try {
            const stored = localStorage.getItem('userSettings');
            if (stored) {
                return JSON.parse(stored);
            } else {
                // 初始化默认设置
                const defaultSettings = {
                    nickname: '情绪岛居民',
                    avatar: null,
                    gender: 'female',
                    birthday: '1995-06-15',
                    registrationDate: new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
                return defaultSettings;
            }
        } catch (error) {
            console.error('读取本地设置错误:', error);
            return {};
        }
    },
    
    /**
     * 从localStorage获取心情历史
     */
    getLocalMoodHistory() {
        try {
            const stored = localStorage.getItem('moodData');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('读取心情数据错误:', error);
            return [];
        }
    },
    
    /**
     * 从localStorage获取练习历史
     */
    getLocalPracticeHistory() {
        try {
            const stored = localStorage.getItem('practiceHistory');
            if (stored) {
                return JSON.parse(stored);
            } else {
                // 生成模拟数据
                const mockData = this.generateMockPracticeHistory();
                localStorage.setItem('practiceHistory', JSON.stringify(mockData));
                return mockData;
            }
        } catch (error) {
            console.error('读取练习历史错误:', error);
            return [];
        }
    },
    
    /**
     * 从localStorage获取测评历史
     */
    getLocalAssessmentHistory() {
        try {
            const stored = localStorage.getItem('assessmentHistory');
            if (stored) {
                return JSON.parse(stored);
            } else {
                // 生成模拟数据
                const mockData = this.generateMockAssessmentHistory();
                localStorage.setItem('assessmentHistory', JSON.stringify(mockData));
                return mockData;
            }
        } catch (error) {
            console.error('读取测评历史错误:', error);
            return [];
        }
    },
    
    /**
     * 计算两个日期之间的天数差
     */
    calculateDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },
    
    /**
     * 验证日期格式
     */
    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },
    
    /**
     * 文件转Base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * 计算连续打卡天数
     */
    calculateStreak(moodHistory) {
        if (moodHistory.length === 0) return 0;
        
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
    },
    
    /**
     * 获取连续打卡成就解锁日期
     */
    getStreakUnlockDate(moodHistory, targetDays) {
        if (moodHistory.length < targetDays) return null;
        
        const sortedHistory = [...moodHistory].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        // 找到第一次达到连续打卡目标的日期
        let currentStreak = 1;
        for (let i = 1; i < sortedHistory.length; i++) {
            const prevDate = new Date(sortedHistory[i - 1].date);
            const currDate = new Date(sortedHistory[i].date);
            
            const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
                currentStreak++;
                if (currentStreak === targetDays) {
                    return sortedHistory[i].date;
                }
            } else {
                currentStreak = 1;
            }
        }
        
        return null;
    },
    
    /**
     * 计算累计冥想分钟数
     */
    getTotalMeditationMinutes(practiceHistory) {
        return practiceHistory.reduce((total, practice) => {
            return total + (practice.duration || 0);
        }, 0);
    },
    
    /**
     * 获取冥想成就解锁日期
     */
    getMeditationUnlockDate(practiceHistory, targetMinutes) {
        let totalMinutes = 0;
        const sortedHistory = [...practiceHistory].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        for (const practice of sortedHistory) {
            totalMinutes += practice.duration || 0;
            if (totalMinutes >= targetMinutes) {
                return practice.date;
            }
        }
        
        return null;
    },
    
    /**
     * 生成模拟练习历史
     */
    generateMockPracticeHistory() {
        const practices = [
            { type: '正念呼吸', duration: 10 },
            { type: '晨间冥想', duration: 15 },
            { type: '睡前冥想', duration: 20 },
            { type: '正念呼吸', duration: 8 },
            { type: '森林冥想', duration: 10 }
        ];
        
        const history = [];
        for (let i = 0; i < 156; i++) { // 生成156条记录
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(i / 2));
            const practice = practices[i % practices.length];
            
            history.push({
                id: `practice_${i}`,
                type: practice.type,
                duration: practice.duration,
                date: date.toISOString().split('T')[0],
                timestamp: date.toISOString()
            });
        }
        
        return history;
    },
    
    /**
     * 生成模拟测评历史
     */
    generateMockAssessmentHistory() {
        const assessments = [
            { type: 'sds', name: '抑郁症筛查量表' },
            { type: 'sas', name: '焦虑症筛查量表' },
            { type: 'stress', name: '压力感知量表' },
            { type: 'psqi', name: '匹兹堡睡眠质量指数' },
            { type: 'scl90', name: 'SCL-90 心理健康自评' }
        ];
        
        const history = [];
        for (let i = 0; i < 8; i++) { // 生成8条记录
            const date = new Date();
            date.setDate(date.getDate() - (i * 5));
            const assessment = assessments[i % assessments.length];
            
            history.push({
                id: `assessment_${i}`,
                type: assessment.type,
                name: assessment.name,
                date: date.toISOString().split('T')[0],
                timestamp: date.toISOString()
            });
        }
        
        return history;
    }
};

// 导出API（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileAPI;
}

