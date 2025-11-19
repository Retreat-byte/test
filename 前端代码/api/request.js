/**
 * HTTP请求封装
 * 统一处理请求和响应
 */

/**
 * 基础请求函数
 * @param {string} url - 请求URL
 * @param {object} options - 请求选项
 * @returns {Promise} 返回Promise对象
 */
async function request(url, options = {}) {
    // 获取token
    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
    
    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;
    
    // 默认配置
    const defaultOptions = {
        method: options.method || HTTP_METHODS.GET,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        },
        timeout: API_CONFIG.TIMEOUT
    };
    
    // 处理请求体
    if (options.body) {
        if (options.body instanceof FormData) {
            // FormData不需要设置Content-Type，浏览器会自动设置
            delete defaultOptions.headers['Content-Type'];
            defaultOptions.body = options.body;
        } else {
            defaultOptions.body = JSON.stringify(options.body);
        }
    }
    
    try {
        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        
        // 发送请求
        const response = await fetch(fullUrl, {
            ...defaultOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // 检查响应状态
        if (!response.ok) {
            // 处理HTTP错误状态
            if (response.status === STATUS_CODES.UNAUTHORIZED) {
                // 未授权，清除token并跳转登录
                localStorage.removeItem(API_CONFIG.TOKEN_KEY);
                localStorage.removeItem(API_CONFIG.USER_INFO_KEY);
                
                // 显示登录弹窗
                if (window.showLoginModal) {
                    window.showLoginModal();
                }
                
                throw new Error(ERROR_MESSAGES.UNAUTHORIZED_ERROR);
            }
            
            // 尝试解析错误响应
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }
        
        // 解析响应数据
        const data = await response.json();
        
        // 检查业务状态码
        if (data.code !== undefined && data.code !== STATUS_CODES.SUCCESS) {
            throw new Error(data.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        }
        
        return data;
        
    } catch (error) {
        // 处理各种错误
        if (error.name === 'AbortError') {
            throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
        }
        
        if (error.message.includes('Failed to fetch')) {
            throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }
        
        throw error;
    }
}

/**
 * GET请求
 */
function get(url, params = {}, options = {}) {
    // 构建查询字符串
    const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return request(fullUrl, {
        ...options,
        method: HTTP_METHODS.GET
    });
}

/**
 * POST请求
 */
function post(url, data = {}, options = {}) {
    return request(url, {
        ...options,
        method: HTTP_METHODS.POST,
        body: data
    });
}

/**
 * PUT请求
 */
function put(url, data = {}, options = {}) {
    return request(url, {
        ...options,
        method: HTTP_METHODS.PUT,
        body: data
    });
}

/**
 * DELETE请求
 */
function del(url, options = {}) {
    return request(url, {
        ...options,
        method: HTTP_METHODS.DELETE
    });
}

/**
 * PATCH请求
 */
function patch(url, data = {}, options = {}) {
    return request(url, {
        ...options,
        method: HTTP_METHODS.PATCH,
        body: data
    });
}

/**
 * 上传文件
 */
function upload(url, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // 添加额外数据
    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });
    
    return request(url, {
        method: HTTP_METHODS.POST,
        body: formData
    });
}
