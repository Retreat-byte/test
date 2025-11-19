/**
 * 用户相关API
 * 包括个人信息、活动记录、统计数据等
 */

const userAPI = {
    /**
     * 获取用户个人信息
     * @returns {Promise}
     */
    getUserInfo() {
        return get('/user/profile');
    },

    /**
     * 更新用户信息
     * @param {object} userData - 用户数据
     * @returns {Promise}
     */
    updateUserInfo(userData) {
        return put('/user/profile', {
            nickname: userData.nickname,
            email: userData.email,
            gender: userData.gender,
            avatar: userData.avatar
        });
    },

    /**
     * 上传头像
     * @param {File} file - 头像文件
     * @returns {Promise}
     */
    uploadAvatar(file) {
        return upload('/user/avatar', file);
    },

    /**
     * 修改密码
     * @param {string} oldPassword - 旧密码
     * @param {string} newPassword - 新密码
     * @returns {Promise}
     */
    changePassword(oldPassword, newPassword) {
        return post('/user/change-password', {
            oldPassword,
            newPassword
        });
    },

    /**
     * 获取用户统计数据
     * @returns {Promise}
     */
    getUserStatistics() {
        return get('/user/statistics');
    },

    /**
     * 获取最近活动记录
     * @param {number} limit - 数量限制
     * @returns {Promise}
     */
    getRecentActivities(limit = 5) {
        return get('/user/activities/recent', { limit });
    },

    /**
     * 获取工具使用记录
     * @param {object} params - 查询参数
     * @returns {Promise}
     */
    getToolUsageRecords(params = {}) {
        return get('/user/tool-usage', {
            toolType: params.toolType,
            page: params.page || 1,
            pageSize: params.pageSize || 10
        });
    }
};
