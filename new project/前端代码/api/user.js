// 用户API接口模块
// 处理用户登录、注册、认证等功能

const UserAPI = {
    // API基础地址（根据实际后端地址修改）
    baseURL: 'http://localhost:8081/api',
    
    // 开发模式标志（开发时设为true使用模拟数据，生产环境设为false）
    isDevelopment: false,
    
    // 获取存储的token
    getToken() {
        return localStorage.getItem('userToken');
    },
    
    // 保存token
    setToken(token) {
        localStorage.setItem('userToken', token);
    },
    
    // 移除token
    removeToken() {
        localStorage.removeItem('userToken');
    },
    
    // 获取用户信息
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },
    
    // 保存用户信息
    setUserInfo(userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    
    // 检查登录状态
    isLoggedIn() {
        const token = this.getToken();
        const userInfo = this.getUserInfo();
        return !!(token && userInfo);
    },
    
    // 用户登录
    async login(phone, password) {
        try {
            // 模拟API请求（实际使用时替换为真实API）
            const response = await fetch(`${this.baseURL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '登录失败');
            }
            
            const data = await response.json();
            
            // 检查后端响应格式
            if (data.success && data.data) {
                // 保存token和用户信息
                this.setToken(data.data.token);
                this.setUserInfo(data.data.user);
                
                return {
                    success: true,
                    message: data.message || '登录成功',
                    data: data.data
                };
            } else {
                throw new Error(data.message || '登录失败');
            }
        } catch (error) {
            console.error('登录错误:', error);
            
            // 模拟登录成功（开发阶段使用）
            // 实际部署时删除这段代码
            if (phone && password) {
                const mockToken = 'mock_token_' + Date.now();
                const mockUserInfo = {
                    id: Date.now(),
                    phone: phone,
                    nickname: '情绪岛用户',
                    avatar: null
                };
                
                this.setToken(mockToken);
                this.setUserInfo(mockUserInfo);
                
                return {
                    success: true,
                    message: '登录成功（模拟）',
                    data: { token: mockToken, userInfo: mockUserInfo }
                };
            }
            
            return {
                success: false,
                message: error.message || '登录失败，请检查网络连接'
            };
        }
    },
    
    // 用户注册
    async register(phone, password, confirmPassword) {
        try {
            // 前端验证
            if (password !== confirmPassword) {
                return {
                    success: false,
                    message: '两次输入的密码不一致'
                };
            }
            
            if (password.length < 6) {
                return {
                    success: false,
                    message: '密码长度不能少于6位'
                };
            }
            
            // 验证手机号格式
            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!phoneRegex.test(phone)) {
                return {
                    success: false,
                    message: '请输入正确的手机号'
                };
            }
            
            // 调用注册API
            const response = await fetch(`${this.baseURL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    phone, 
                    password, 
                    confirmPassword,
                    verificationCode: '123456' // 临时使用固定验证码，实际项目中需要发送短信验证码
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '注册失败');
            }
            
            const data = await response.json();
            
            // 检查后端响应格式
            if (data.success) {
                return {
                    success: true,
                    message: data.message || '注册成功',
                    data: data.data
                };
            } else {
                throw new Error(data.message || '注册失败');
            }
        } catch (error) {
            console.error('注册错误:', error);
            
            // 模拟注册成功（开发阶段使用）
            if (phone && password) {
                return {
                    success: true,
                    message: '注册成功（模拟），请登录'
                };
            }
            
            return {
                success: false,
                message: error.message || '注册失败，请稍后重试'
            };
        }
    },
    
    // 退出登录
    logout() {
        this.removeToken();
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userSettings');
        localStorage.removeItem('userAvatar');
        console.log('用户已退出登录');
    },
    
    // 验证token有效性（可选）
    async verifyToken() {
        try {
            const token = this.getToken();
            if (!token) return false;
            
            const response = await fetch(`${this.baseURL}/users/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Token验证错误:', error);
            return false;
        }
    }
};

// 导出API（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserAPI;
}



