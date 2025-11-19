/**
 * 登录/注册模态框功能
 */

class AuthModal {
    constructor() {
        this.overlay = null;
        this.modal = null;
        this.currentTab = 'login';
        this.countdownTimer = null;
        this.codeTimer = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        // 将显示方法暴露到全局
        window.showLoginModal = () => this.show();
        window.hideLoginModal = () => this.hide();
    }

    createModal() {
        const modalHTML = `
            <div class="auth-modal-overlay" id="authModalOverlay">
                <div class="auth-modal">
                    <button class="auth-modal-close" id="authModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="auth-modal-header">
                        <div class="auth-modal-logo">
                            <i class="fas fa-balance-scale"></i>
                        </div>
                        <h2 class="auth-modal-title">欢迎回到法智顾问</h2>
                        <p class="auth-modal-subtitle">登录以继续您的法律咨询之旅</p>
                    </div>
                    
                    <div class="auth-modal-body">
                        <div class="auth-error" id="authError"></div>
                        <div class="auth-success" id="authSuccess"></div>
                        
                        <!-- 登录表单 -->
                        <div class="auth-form-content active" id="loginForm">
                            <form id="loginFormElement" style="display: flex; flex-direction: column; gap: 20px;">
                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="fas fa-mobile-alt"></i>
                                        手机号
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="fas fa-mobile-alt auth-input-icon"></i>
                                        <input 
                                            type="tel" 
                                            class="auth-input" 
                                            name="phone" 
                                            placeholder="请输入手机号"
                                            maxlength="11"
                                            required
                                        >
                                    </div>
                                </div>
                                
                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="fas fa-lock"></i>
                                        密码
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="fas fa-lock auth-input-icon"></i>
                                        <input 
                                            type="password" 
                                            class="auth-input" 
                                            name="password" 
                                            placeholder="请输入密码"
                                            required
                                        >
                                        <button type="button" class="auth-password-toggle" data-target="loginFormElement">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="auth-options">
                                    <label class="auth-remember">
                                        <input type="checkbox" name="remember">
                                        <span>记住我</span>
                                    </label>
                                    <a href="#" class="auth-forgot-link">忘记密码？</a>
                                </div>
                                
                                <button type="submit" class="auth-submit-btn">
                                    <i class="fas fa-sign-in-alt"></i>
                                    登录
                                </button>
                                
                                <div class="auth-switch">
                                    还没有账号？ <a href="#" id="switchToRegister">立即注册</a>
                                </div>
                            </form>
                        </div>
                        
                        <!-- 注册表单 -->
                        <div class="auth-form-content" id="registerForm">
                            <form id="registerFormElement" style="display: flex; flex-direction: column; gap: 20px;">
                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="fas fa-mobile-alt"></i>
                                        手机号
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="fas fa-mobile-alt auth-input-icon"></i>
                                        <input 
                                            type="tel" 
                                            class="auth-input" 
                                            name="phone" 
                                            placeholder="请输入手机号"
                                            maxlength="11"
                                            required
                                        >
                                    </div>
                                </div>
                                
                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="fas fa-lock"></i>
                                        密码
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="fas fa-lock auth-input-icon"></i>
                                        <input 
                                            type="password" 
                                            class="auth-input" 
                                            name="password" 
                                            placeholder="请设置密码（至少6位）"
                                            minlength="6"
                                            maxlength="20"
                                            required
                                        >
                                        <button type="button" class="auth-password-toggle">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="fas fa-lock"></i>
                                        确认密码
                                    </label>
                                    <div class="auth-input-wrapper">
                                        <i class="fas fa-lock auth-input-icon"></i>
                                        <input 
                                            type="password" 
                                            class="auth-input" 
                                            name="confirmPassword" 
                                            placeholder="请再次输入密码"
                                            minlength="6"
                                            maxlength="20"
                                            required
                                        >
                                        <button type="button" class="auth-password-toggle">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="auth-form-group">
                                    <label class="auth-form-label">
                                        <i class="fas fa-shield-alt"></i>
                                        验证码
                                    </label>
                                    <div class="auth-input-wrapper auth-code-wrapper">
                                        <i class="fas fa-shield-alt auth-input-icon"></i>
                                        <input 
                                            type="text" 
                                            class="auth-input" 
                                            name="verificationCode" 
                                            placeholder="请输入短信验证码"
                                            maxlength="6"
                                            required
                                        >
                                        <button type="button" class="auth-send-code" data-type="register">
                                            获取验证码
                                        </button>
                                    </div>
                                </div>
                                
                                <label class="auth-agreement">
                                    <input type="checkbox" name="agreement" required>
                                    <span>我已阅读并同意 <a href="#">用户协议</a> 和 <a href="#">隐私政策</a></span>
                                </label>
                                
                                <button type="submit" class="auth-submit-btn">
                                    <i class="fas fa-user-plus"></i>
                                    注册
                                </button>
                                
                                <div class="auth-switch">
                                    已有账号？ <a href="#" id="switchToLogin">立即登录</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.overlay = document.getElementById('authModalOverlay');
        this.modal = this.overlay.querySelector('.auth-modal');
    }

    bindEvents() {
        // 关闭按钮
        document.getElementById('authModalClose').addEventListener('click', () => {
            const needsAuth = this.checkIfProtectedPage();
            if (needsAuth && !this.isLoggedIn()) {
                // 在受保护页面未登录时，关闭后跳转到首页
                window.location.href = window.location.pathname.includes('/page/') ? '../index.html' : '/index.html';
            } else {
                this.hide();
            }
        });
        
        // 点击遮罩关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                const needsAuth = this.checkIfProtectedPage();
                if (needsAuth && !this.isLoggedIn()) {
                    // 在受保护页面未登录时，关闭后跳转到首页
                    window.location.href = window.location.pathname.includes('/page/') ? '../index.html' : '/index.html';
                } else {
                    this.hide();
                }
            }
        });
        
        // 表单切换链接
        document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('register');
        });
        
        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('login');
        });
        
        // 密码可见性切换
        document.querySelectorAll('.auth-password-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.togglePasswordVisibility(btn));
        });
        
        // 表单提交
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e.target);
        });
        
        document.getElementById('registerFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(e.target);
        });
        
        // 发送验证码按钮
        document.querySelectorAll('.auth-send-code').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSendCode(btn);
            });
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                const needsAuth = this.checkIfProtectedPage();
                if (needsAuth && !this.isLoggedIn()) {
                    // 在受保护页面未登录时，关闭后跳转到首页
                    window.location.href = window.location.pathname.includes('/page/') ? '../index.html' : '/index.html';
                } else {
                    this.hide();
                }
            }
        });
    }

    show() {
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.clearMessages();
    }

    hide() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        this.clearMessages();
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // 更新表单显示
        document.querySelectorAll('.auth-form-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}Form`);
        });
        
        // 更新标题和副标题
        const title = document.querySelector('.auth-modal-title');
        const subtitle = document.querySelector('.auth-modal-subtitle');
        
        if (tab === 'login') {
            title.textContent = '欢迎回到法智顾问';
            subtitle.textContent = '登录以继续您的法律咨询之旅';
        } else {
            title.textContent = '加入法智顾问';
            subtitle.textContent = '开启您的法律服务管理之旅';
        }
        
        this.clearMessages();
    }

    togglePasswordVisibility(button) {
        // 找到按钮所在的input-wrapper，然后找到其中的input
        const wrapper = button.closest('.auth-input-wrapper');
        const input = wrapper.querySelector('input[type="password"], input[type="text"]');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const phone = formData.get('phone').trim();
        const password = formData.get('password');
        const remember = formData.get('remember') === 'on';
        
        // 验证手机号格式（测试账号除外）
        if (phone !== '11111111111' && !/^1[3-9]\d{9}$/.test(phone)) {
            this.showError('请输入正确的手机号');
            return;
        }
        
        if (password.length < 6) {
            this.showError('密码长度不能少于6位');
            return;
        }
        
        const submitBtn = form.querySelector('.auth-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="auth-loading"></span>登录中...';
        
        try {
            const response = await API.auth.login(phone, password);
            
            // 保存用户信息
            API.auth.saveUserInfo(response.data.userInfo, response.data.token);
            
            this.showSuccess('登录成功！');
            
            setTimeout(() => {
                this.hide();
                // 刷新页面或更新UI
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            this.showError(error.message || '登录失败');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 登录';
        }
    }

    async handleRegister(form) {
        const formData = new FormData(form);
        const phone = formData.get('phone').trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const agreement = formData.get('agreement');
        const verificationCode = formData.get('verificationCode')?.trim();
        
        // 验证
        if (!/^1[3-9]\d{9}$/.test(phone) && phone !== '11111111111') {
            this.showError('请输入正确的手机号');
            return;
        }
        
        if (password.length < 6) {
            this.showError('密码长度不能少于6位');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('两次输入的密码不一致');
            return;
        }
        
        if (!verificationCode || !/^\d{4,6}$/.test(verificationCode)) {
            this.showError('请输入正确的验证码');
            return;
        }
        
        if (!agreement) {
            this.showError('请阅读并同意用户协议和隐私政策');
            return;
        }
        
        const submitBtn = form.querySelector('.auth-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="auth-loading"></span>注册中...';
        
        try {
            await API.auth.register({
                phone,
                password,
                verificationCode,
                nickname: `用户${phone.slice(-4)}`,
                email: '',
                gender: 'unknown'
            });
            
            this.showSuccess('注册成功！请使用账号登录');
            
            setTimeout(() => {
                this.switchTab('login');
                const loginPhoneInput = document.querySelector('#loginForm input[name="phone"]');
                if (loginPhoneInput) {
                    loginPhoneInput.value = phone;
                }
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> 注册';
            }, 1500);
            
        } catch (error) {
            this.showError(error.message || '注册失败');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> 注册';
        }
    }
    
    async handleSendCode(button) {
        if (button.disabled) return;
        
        const registerForm = document.getElementById('registerFormElement');
        const phoneInput = registerForm?.querySelector('input[name="phone"]');
        const phone = phoneInput?.value.trim();
        
        if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
            this.showError('请先输入正确的手机号');
            return;
        }
        
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = '发送中...';
        
        try {
            await API.auth.sendVerificationCode(phone, button.dataset.type || 'register');
            this.showSuccess('验证码已发送，请注意查收');
            this.startCodeCountdown(button);
        } catch (error) {
            this.showError(error.message || '验证码发送失败');
            button.disabled = false;
            button.textContent = originalText;
        }
    }
    
    startCodeCountdown(button) {
        let remaining = 60;
        button.textContent = `${remaining}s`;
        
        if (this.codeTimer) {
            clearInterval(this.codeTimer);
        }
        
        this.codeTimer = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                clearInterval(this.codeTimer);
                this.codeTimer = null;
                button.disabled = false;
                button.textContent = '重新获取';
            } else {
                button.textContent = `${remaining}s`;
            }
        }, 1000);
    }

    showError(message) {
        const errorEl = document.getElementById('authError');
        const successEl = document.getElementById('authSuccess');
        successEl.classList.remove('show');
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }

    showSuccess(message) {
        const errorEl = document.getElementById('authError');
        const successEl = document.getElementById('authSuccess');
        errorEl.classList.remove('show');
        successEl.textContent = message;
        successEl.classList.add('show');
    }

    clearMessages() {
        document.getElementById('authError').classList.remove('show');
        document.getElementById('authSuccess').classList.remove('show');
    }
    
    // 检查当前是否是受保护的页面
    checkIfProtectedPage() {
        const currentPath = window.location.pathname;
        const protectedPages = ['ai-consult', 'legal-tools', 'legal-knowledge', 'user-center'];
        return protectedPages.some(page => currentPath.includes(page));
    }
    
    // 检查是否已登录
    isLoggedIn() {
        return API.auth.isLoggedIn();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new AuthModal();
});
