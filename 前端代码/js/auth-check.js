/**
 * 登录检测和用户状态管理
 */

// 用户状态管理
const AuthManager = {
    // 检查是否已登录
    isLoggedIn() {
        return API.auth.isLoggedIn();
    },

    // 获取当前用户信息
    getCurrentUser() {
        return API.auth.getLocalUserInfo();
    },

    // 需要登录才能访问的功能
    requireAuth(callback) {
        if (!this.isLoggedIn()) {
            window.showLoginModal();
            return false;
        }
        if (callback) callback();
        return true;
    },

    // 更新页面用户信息显示
    updateUserDisplay() {
        const userInfo = this.getCurrentUser();
        const profileTrigger = document.querySelector('.profile-trigger');
        const navProfile = document.querySelector('.nav-profile');
        
        if (!profileTrigger) return;
        
        if (this.isLoggedIn() && userInfo) {
            const resolvedAvatar = window.utils?.resolveAssetUrl?.(userInfo.avatar, 'avatars') || '';
            // 已登录：显示头像
            profileTrigger.innerHTML = `
                <div class="profile-avatar">
                    ${resolvedAvatar ? 
                        `<img src="${resolvedAvatar}" alt="${userInfo.nickname || '用户头像'}">` : 
                        `<i class="fas fa-user"></i>`
                    }
                </div>
            `;
            
            // 显示用户信息菜单
            if (navProfile) {
                navProfile.style.display = 'block';
            }
        } else {
            // 未登录：显示登录按钮
            profileTrigger.innerHTML = `
                <button class="btn-login">登录</button>
            `;
            profileTrigger.classList.add('login-mode');
            
            // 绑定登录按钮点击事件
            profileTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                window.showLoginModal();
            });
            
            // 隐藏用户菜单
            if (navProfile) {
                const profileMenu = navProfile.querySelector('.profile-menu');
                if (profileMenu) {
                    profileMenu.style.display = 'none';
                }
            }
        }
    },

    // 登出
    logout() {
        // 清除本地数据
        localStorage.removeItem('legal_assistant_token');
        localStorage.removeItem('legal_assistant_user_info');
        
        // 恢复页面交互状态
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        
        // 判断当前路径，决定跳转地址
        const currentPath = window.location.pathname;
        
        // 使用replace而不是href，避免可以通过后退按钮返回
        if (currentPath.includes('/page/')) {
            // 在子目录页面，使用相对路径
            window.location.replace('../index.html');
        } else if (currentPath.toLowerCase().includes('index.html') || currentPath === '/') {
            // 已经在首页，直接刷新
            window.location.reload();
        } else {
            // 其他情况，跳转到首页
            window.location.replace('/index.html');
        }
    },

    // 初始化
    init() {
        // 更新用户显示
        this.updateUserDisplay();
        
        // 绑定退出登录按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('确定要退出登录吗？')) {
                    this.logout();
                }
            });
        }
        
        // 延迟添加功能拦截器，确保AuthModal已初始化
        setTimeout(() => {
            this.addInterceptors();
        }, 100);
    },
    
    // 添加功能拦截器
    addInterceptors() {
        const currentPath = window.location.pathname;
        
        // 需要登录的页面列表
        const protectedPages = ['ai-consult', 'legal-tools', 'legal-knowledge', 'user-center'];
        const needsAuth = protectedPages.some(page => currentPath.includes(page));
        
        // 如果是受保护的页面且未登录，立即弹出登录框
        if (needsAuth && !this.isLoggedIn()) {
            if (typeof window.showLoginModal === 'function') {
                window.showLoginModal();
            }
            
            // 禁用页面交互
            document.body.style.pointerEvents = 'none';
            // 但允许模态框交互
            setTimeout(() => {
                const overlay = document.getElementById('authModalOverlay');
                if (overlay) {
                    overlay.style.pointerEvents = 'auto';
                }
            }, 50);
        }
        
        // AI咨询页面 - 额外拦截
        if (currentPath.includes('ai-consult')) {
            // 拦截发送消息按钮
            const chatSubmit = document.querySelector('.chat-submit');
            if (chatSubmit) {
                chatSubmit.addEventListener('click', (e) => {
                    if (!this.requireAuth()) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            }
            
            // 拦截输入框
            const chatInput = document.querySelector('.chat-input');
            if (chatInput) {
                chatInput.addEventListener('focus', (e) => {
                    if (!this.requireAuth()) {
                        e.target.blur();
                    }
                });
            }
        }
        
        // 法律工具页面 - 拦截工具卡片
        if (currentPath.includes('legal-tools')) {
            const toolCards = document.querySelectorAll('.tool-card');
            toolCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    if (!this.requireAuth()) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            });
        }
        
        // 法律知识页面 - 拦截搜索和下载
        if (currentPath.includes('legal-knowledge')) {
            const searchBtn = document.querySelector('.search-btn');
            const downloadBtns = document.querySelectorAll('.btn-download, .download-btn');
            
            if (searchBtn) {
                searchBtn.addEventListener('click', (e) => {
                    if (!this.requireAuth()) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            }
            
            downloadBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (!this.requireAuth()) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            });
        }
        
        // 导航菜单的个人中心链接
        const userCenterLinks = document.querySelectorAll('a[href*="user-center"]');
        userCenterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (!this.requireAuth()) {
                    e.preventDefault();
                }
            });
        });
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
});
