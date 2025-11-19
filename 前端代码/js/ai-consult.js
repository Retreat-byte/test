/* ==========================================
   AI咨询页面 - 与后端接口联动
========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        chatMessages: document.getElementById('chatMessages'),
        chatInput: document.getElementById('chatInput'),
        sendButton: document.getElementById('sendButton'),
        questionItems: document.querySelectorAll('.question-item'),
        historyToggleBtn: document.getElementById('historyToggleBtn'),
        historyCloseBtn: document.getElementById('historyCloseBtn'),
        historySidebar: document.getElementById('historySidebar'),
        historyOverlay: document.getElementById('historyOverlay'),
        historyList: document.getElementById('historyList'),
        clearAllBtn: document.getElementById('clearAllBtn'),
        newChatBtn: document.getElementById('newChatBtn')
    };
    
    const state = {
        conversationId: API.aiConsult.getCurrentConversationId(),
        historyPage: 1,
        historyPageSize: 30,
        loading: false,
        typingIndicator: null
    };
    
    init();
    
    function init() {
        bindEvents();
        bootstrapConversation();
    }
    
    function bindEvents() {
        if (elements.sendButton) {
            elements.sendButton.addEventListener('click', sendMessage);
        }
        
        if (elements.chatInput) {
            elements.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
        
        elements.questionItems.forEach(item => {
            item.addEventListener('click', () => {
                const question = item.getAttribute('data-question');
                if (!question) return;
                elements.chatInput.value = question;
                sendMessage();
            });
        });
        
        if (elements.historyToggleBtn) {
            elements.historyToggleBtn.addEventListener('click', () => {
                openHistorySidebar();
            });
        }
        
        if (elements.historyCloseBtn) {
            elements.historyCloseBtn.addEventListener('click', closeHistorySidebar);
        }
        
        if (elements.historyOverlay) {
            elements.historyOverlay.addEventListener('click', closeHistorySidebar);
        }
        
        if (elements.clearAllBtn) {
            elements.clearAllBtn.addEventListener('click', clearAllHistory);
        }
        
        if (elements.newChatBtn) {
            elements.newChatBtn.addEventListener('click', startNewConversation);
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.historySidebar.classList.contains('active')) {
                closeHistorySidebar();
            }
        });
    }
    
    async function bootstrapConversation() {
        try {
            if (!state.conversationId) {
                await createConversation();
            }
            await Promise.all([
                loadConversationDetail(state.conversationId),
                refreshHistoryList()
            ]);
        } catch (error) {
            notify(error.message || '初始化失败', 'error');
        }
    }
    
    async function createConversation() {
        const resp = await API.aiConsult.createConversation();
        state.conversationId = resp.data.conversationId;
        API.aiConsult.setCurrentConversationId(state.conversationId);
    }
    
    async function startNewConversation() {
        if (state.loading) return;
        try {
            await createConversation();
            elements.chatMessages.innerHTML = '';
            addWelcomeMessage();
            notify('已创建新对话', 'success');
            await refreshHistoryList();
        } catch (error) {
            notify(error.message || '新建对话失败', 'error');
        }
    }
    
    async function loadConversationDetail(conversationId) {
        if (!conversationId) {
            addWelcomeMessage();
            return;
        }
        
        try {
            const resp = await API.aiConsult.getConversationDetail(conversationId);
            const messages = Array.isArray(resp.data) ? resp.data : [];
            renderMessages(messages);
        } catch (error) {
            addWelcomeMessage();
            notify(error.message || '加载对话失败', 'error');
        }
    }
    
    function renderMessages(messages) {
        elements.chatMessages.innerHTML = '';
        
        if (!messages.length) {
            addWelcomeMessage();
            return;
        }
        
        messages.forEach(msg => {
            addMessage(msg.content, msg.role === 'assistant' ? 'ai' : 'user', msg.timestamp);
        });
        
        scrollToBottom();
    }
    
    function addWelcomeMessage() {
        addMessage(
            '您好！我是法智顾问AI助手，很高兴为您提供法律咨询服务。\n请描述您遇到的法律问题，我会为您提供专业的建议和解决方案。',
            'ai'
        );
    }
    
    function addMessage(text, type = 'ai', timestamp = new Date().toISOString()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'ai' 
            ? '<img src="../img/ai.png" alt="AI" class="avatar-img">' 
            : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const paragraphs = text.split('\n').filter(Boolean);
        paragraphs.forEach(p => {
            const pElement = document.createElement('p');
            pElement.textContent = p;
            bubble.appendChild(pElement);
        });
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = formatTime(timestamp);
        
        content.appendChild(bubble);
        content.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        elements.chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        hideTypingIndicator();
        const indicator = document.createElement('div');
        indicator.className = 'message ai-message';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-avatar">
                <img src="../img/ai.png" alt="AI" class="avatar-img">
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        elements.chatMessages.appendChild(indicator);
        state.typingIndicator = indicator;
        scrollToBottom();
    }
    
    function hideTypingIndicator() {
        if (state.typingIndicator) {
            state.typingIndicator.remove();
            state.typingIndicator = null;
        }
    }
    
    async function sendMessage() {
        if (state.loading) return;
        const message = elements.chatInput.value.trim();
        if (!message) {
            notify('请输入咨询内容', 'warning');
            return;
        }
        
        if (!state.conversationId) {
            await createConversation();
        }
        
        state.loading = true;
        elements.sendButton.disabled = true;
        
        addMessage(message, 'user');
        elements.chatInput.value = '';
        showTypingIndicator();
        
        try {
            const resp = await API.aiConsult.sendMessage(state.conversationId, message);
            hideTypingIndicator();
            addMessage(resp.data.reply, 'ai', resp.data.timestamp);
            await refreshHistoryList();
        } catch (error) {
            hideTypingIndicator();
            notify(error.message || '发送失败，请稍后重试', 'error');
        } finally {
            state.loading = false;
            elements.sendButton.disabled = false;
        }
    }
    
    async function refreshHistoryList() {
        try {
            const resp = await API.aiConsult.getConversationHistory(state.historyPage, state.historyPageSize);
            const list = resp.data?.content || resp.data?.list || [];
            renderHistoryList(list);
        } catch (error) {
            console.error('加载历史记录失败', error);
        }
    }
    
    function renderHistoryList(conversations) {
        if (!conversations.length) {
            elements.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-inbox"></i>
                    <p>暂无历史记录</p>
                </div>
            `;
            return;
        }
        
        elements.historyList.innerHTML = conversations.map(conv => `
            <div class="history-item" data-conversation-id="${conv.conversationId}">
                <div class="history-item-header">
                    <div class="history-item-title">
                        <i class="fas fa-comments"></i>
                        ${conv.title || '新对话'}
                    </div>
                    <div class="history-item-time">${formatHistoryTime(conv.updatedAt)}</div>
                </div>
                <div class="history-item-preview">${conv.lastMessage || '暂无内容'}</div>
                <div class="history-item-meta">
                    <div class="history-item-actions">
                        <button class="history-item-delete" data-conversation-id="${conv.conversationId}">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        elements.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.history-item-delete')) return;
                const conversationId = item.getAttribute('data-conversation-id');
                switchConversation(conversationId);
            });
        });
        
        elements.historyList.querySelectorAll('.history-item-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const conversationId = btn.getAttribute('data-conversation-id');
                await deleteConversation(conversationId);
            });
        });
    }
    
    async function switchConversation(conversationId) {
        if (!conversationId || conversationId === state.conversationId) {
            closeHistorySidebar();
            return;
        }
        
        state.conversationId = conversationId;
        API.aiConsult.setCurrentConversationId(conversationId);
        closeHistorySidebar();
        await loadConversationDetail(conversationId);
    }
    
    async function deleteConversation(conversationId) {
        if (!conversationId) return;
        const confirmed = confirm('确定删除该对话吗？');
        if (!confirmed) return;
        
        try {
            await API.aiConsult.deleteConversation(conversationId);
            notify('已删除对话', 'success');
            if (state.conversationId === conversationId) {
                state.conversationId = null;
                API.aiConsult.clearCurrentConversationId();
                elements.chatMessages.innerHTML = '';
                addWelcomeMessage();
            }
            await refreshHistoryList();
        } catch (error) {
            notify(error.message || '删除失败', 'error');
        }
    }
    
    async function clearAllHistory() {
        const confirmed = confirm('确定要清空所有历史记录吗？该操作不可恢复。');
        if (!confirmed) return;
        
        try {
            await API.aiConsult.clearAllConversations();
            state.conversationId = null;
            API.aiConsult.clearCurrentConversationId();
            elements.chatMessages.innerHTML = '';
            addWelcomeMessage();
            await refreshHistoryList();
            notify('已清空历史记录', 'success');
        } catch (error) {
            notify(error.message || '清空失败', 'error');
        }
    }
    
    function openHistorySidebar() {
        elements.historySidebar.classList.add('active');
        elements.historyOverlay.classList.add('active');
        refreshHistoryList();
    }
    
    function closeHistorySidebar() {
        elements.historySidebar.classList.remove('active');
        elements.historyOverlay.classList.remove('active');
    }
    
    function scrollToBottom() {
        setTimeout(() => {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        }, 50);
    }
    
    function formatTime(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }
    
    function formatHistoryTime(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}小时前`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}天前`;
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
    
    function notify(message, type = 'info') {
        if (window.utils && typeof window.utils.showToast === 'function') {
            window.utils.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
});

