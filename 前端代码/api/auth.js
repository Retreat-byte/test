/**
 * 认证相关API
 * 包括登录、注册、登出等功能
 */

const authAPI = {
    /**
     * 用户登录
     * @param {string} phone - 手机号
     * @param {string} password - 密码
     * @returns {Promise} 返回用户信息和token
     */
    login(phone, password) {
        return post('/auth/login', {
            phone,
            password
        });
    },

    /**
     * 用户注册
     * @param {object} userData - 用户数据
     * @returns {Promise}
     */
    register(userData) {
        return post('/auth/register', {
            phone: userData.phone,
            password: userData.password,
            nickname: userData.nickname || '新用户',
            email: userData.email || '',
            gender: userData.gender || 'unknown',
            verificationCode: userData.verificationCode
        });
    },

    /**
     * 发送验证码
     * @param {string} phone - 手机号
     * @param {string} type - 类型：register-注册，reset-重置密码
     * @returns {Promise}
     */
    sendVerificationCode(phone, type = 'register') {
        return post('/auth/send-code', {
            phone,
            type
        });
    },

    /**
     * 验证验证码
     * @param {string} phone - 手机号
     * @param {string} code - 验证码
     * @returns {Promise}
     */
    verifyCode(phone, code) {
        return post('/auth/verify-code', {
            phone,
            code
        });
    },

    /**
     * 重置密码
     * @param {string} phone - 手机号
     * @param {string} code - 验证码
     * @param {string} newPassword - 新密码
     * @returns {Promise}
     */
    resetPassword(phone, code, newPassword) {
        return post('/auth/reset-password', {
            phone,
            code,
            newPassword
        });
    },

    /**
     * 登出
     * @returns {Promise}
     */
    logout() {
        return post('/auth/logout');
    },

    /**
     * 刷新token
     * @returns {Promise}
     */
    refreshToken() {
        return post('/auth/refresh-token');
    },

    /**
     * 获取当前用户信息
     * @returns {Promise}
     */
    getCurrentUser() {
        return get('/auth/current-user');
    },

    /**
     * 检查登录状态
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!localStorage.getItem('legal_assistant_token');
    },

    /**
     * 保存用户信息到本地
     * @param {object} userInfo - 用户信息
     * @param {string} token - token
     */
    saveUserInfo(userInfo, token) {
        localStorage.setItem('legal_assistant_user_info', JSON.stringify(userInfo));
        localStorage.setItem('legal_assistant_token', token);
    },

    /**
     * 获取本地用户信息
     * @returns {object|null}
     */
    getLocalUserInfo() {
        const userInfo = localStorage.getItem('legal_assistant_user_info');
        return userInfo ? JSON.parse(userInfo) : null;
    },

    /**
     * 局部更新本地缓存的用户信息
     * @param {object} partialInfo - 需要更新的字段
     * @returns {object|null} 更新后的完整用户信息
     */
    updateLocalUserInfo(partialInfo) {
        if (!partialInfo || typeof partialInfo !== 'object') {
            return this.getLocalUserInfo();
        }
        const current = this.getLocalUserInfo() || {};
        const updated = { ...current, ...partialInfo };
        localStorage.setItem('legal_assistant_user_info', JSON.stringify(updated));
        return updated;
    },

    /**
     * 清除用户信息
     */
    clearUserInfo() {
        localStorage.removeItem('legal_assistant_user_info');
        localStorage.removeItem('legal_assistant_token');
    }
};
