/**
 * AI咨询相关API
 * 包括对话、历史记录等功能
 */

const aiConsultAPI = {
    /**
     * 创建新对话
     * @returns {Promise} 返回新对话ID
     */
    createConversation() {
        return post('/ai-consult/conversations');
    },

    /**
     * 发送消息
     * @param {string} conversationId - 对话ID
     * @param {string} message - 消息内容
     * @returns {Promise} 返回AI回复
     */
    sendMessage(conversationId, message) {
        return post('/ai-consult/messages', {
            conversationId,
            message,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * 流式发送消息（支持SSE）
     * @param {string} conversationId - 对话ID
     * @param {string} message - 消息内容
     * @param {function} onMessage - 接收消息回调
     * @param {function} onComplete - 完成回调
     * @param {function} onError - 错误回调
     * @returns {EventSource} 返回EventSource对象，用于关闭连接
     */
    sendMessageStream(conversationId, message, onMessage, onComplete, onError) {
        const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
        const url = `${API_CONFIG.BASE_URL}/ai-consult/messages/stream?conversationId=${conversationId}&message=${encodeURIComponent(message)}`;
        
        const eventSource = new EventSource(url + (token ? `&token=${token}` : ''));
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'message') {
                    onMessage && onMessage(data.content);
                } else if (data.type === 'done') {
                    onComplete && onComplete(data);
                    eventSource.close();
                }
            } catch (error) {
                onError && onError(error);
                eventSource.close();
            }
        };
        
        eventSource.onerror = (error) => {
            onError && onError(error);
            eventSource.close();
        };
        
        return eventSource;
    },

    /**
     * 获取对话历史记录列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @returns {Promise} 返回历史记录列表
     */
    getConversationHistory(page = 1, pageSize = 20) {
        return get('/ai-consult/conversations', {
            page,
            pageSize
        });
    },

    /**
     * 获取单个对话的详细内容
     * @param {string} conversationId - 对话ID
     * @returns {Promise} 返回对话详情
     */
    getConversationDetail(conversationId) {
        return get(`/ai-consult/conversations/${conversationId}`);
    },

    /**
     * 删除单个对话
     * @param {string} conversationId - 对话ID
     * @returns {Promise}
     */
    deleteConversation(conversationId) {
        return del(`/ai-consult/conversations/${conversationId}`);
    },

    /**
     * 清空所有对话记录
     * @returns {Promise}
     */
    clearAllConversations() {
        return del('/ai-consult/conversations/all');
    },

    /**
     * 更新对话标题
     * @param {string} conversationId - 对话ID
     * @param {string} title - 新标题
     * @returns {Promise}
     */
    updateConversationTitle(conversationId, title) {
        return patch(`/ai-consult/conversations/${conversationId}`, {
            title
        });
    },

    /**
     * 获取当前活动对话ID
     * @returns {string|null}
     */
    getCurrentConversationId() {
        return sessionStorage.getItem('current_conversation_id');
    },

    /**
     * 设置当前活动对话ID
     * @param {string} conversationId
     */
    setCurrentConversationId(conversationId) {
        sessionStorage.setItem('current_conversation_id', conversationId);
    },

    /**
     * 清除当前对话ID
     */
    clearCurrentConversationId() {
        sessionStorage.removeItem('current_conversation_id');
    }
};
