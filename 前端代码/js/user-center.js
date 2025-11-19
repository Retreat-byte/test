/* ==========================================
   个人中心页面功能 - user-center.js
========================================== */

const userCenterState = {
    profile: null
};

const avatarUploadState = {
    isUploading: false,
    maxSize: 2 * 1024 * 1024,
    acceptTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
};

document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 导航切换
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetTab = this.getAttribute('data-tab');
            
            // 更新导航项active状态
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // 切换标签页内容
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // 滚动到顶部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
    
    // 统计数字动画
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-info .stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    const target = entry.target;
                    const endValue = parseInt(target.textContent);
                    
                    animateNumber(target, 0, endValue, 1500);
                    target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.5
        });
        
        statNumbers.forEach(num => {
            observer.observe(num);
        });
    }
    
    function animateNumber(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 16);
    }
    
    animateStats();
    
    // 活动项动画
    function animateActivityItems() {
        const activityItems = document.querySelectorAll('.activity-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                        entry.target.classList.add('animated');
                    }, index * 100);
                }
            });
        }, {
            threshold: 0.3
        });
        
        activityItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'all 0.5s ease-out';
            observer.observe(item);
        });
    }
    
    animateActivityItems();
    
    loadUserCenterData();
    initAvatarUpload();
    
    // 快捷操作按钮动画
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            btn.style.transition = 'all 0.5s ease-out';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // 移动端优化：点击导航项后自动折叠菜单
    if (window.innerWidth <= 1024) {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const sidebar = document.querySelector('.user-sidebar');
                sidebar.classList.add('mobile-collapsed');
            });
        });
    }
    
    // 监听窗口大小变化
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // 重置某些样式
            if (window.innerWidth > 1024) {
                navItems.forEach(item => {
                    item.querySelector('span').style.display = '';
                });
            }
        }, 250);
    });
});

async function loadUserCenterData() {
    try {
        window.utils.showLoading('正在加载个人数据...');
        const [
            profileResp,
            statsResp,
            activitiesResp,
            toolUsageResp,
            downloadsResp,
            favoritesResp
        ] = await Promise.all([
            API.user.getUserInfo(),
            API.user.getUserStatistics(),
            API.user.getRecentActivities(6),
            API.user.getToolUsageRecords({ page: 1, pageSize: 5 }),
            API.legalTools.getDownloadHistory(1, 6),
            API.legalKnowledge.getFavoriteList(1, 6)
        ]);
        
        userCenterState.profile = profileResp.data;
        API.auth?.updateLocalUserInfo?.(profileResp.data);
        AuthManager?.updateUserDisplay?.();
        updateProfileCard(profileResp.data);
        populateSettingsForm(profileResp.data);
        renderStats(statsResp.data);
        renderRecentActivities(activitiesResp.data || []);
        renderToolHistory(toolUsageResp.data?.list || toolUsageResp.data?.content || []);
        renderDownloads(downloadsResp.data?.list || []);
        renderFavorites(favoritesResp.data?.list || []);
    } catch (error) {
        console.error('用户中心数据加载失败', error);
        window.utils.showToast(error.message || '加载用户数据失败，请稍后重试', 'error');
    } finally {
        window.utils.hideLoading();
    }
}

function updateProfileCard(profile) {
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    
    updateAvatarDisplays(profile.avatar);
    
    if (nameEl) {
        nameEl.textContent = profile.nickname || profile.phone || '未命名用户';
    }
    
    if (roleEl) {
        roleEl.textContent = profile.email || '普通用户';
    }
}

function renderStats(stats = {}) {
    const statNumbers = document.querySelectorAll('.stat-card .stat-number');
    if (!statNumbers.length) return;
    const values = [
        stats.toolUsageCount || 0,
        stats.downloadCount || 0,
        stats.favoriteCount || 0
    ];
    statNumbers.forEach((el, index) => {
        el.textContent = values[index] ?? 0;
    });
}

function renderRecentActivities(activities) {
    const container = document.querySelector('.activity-list');
    if (!container) return;
    
    if (!activities.length) {
        container.innerHTML = '<div class="empty-tip">暂无近期活动</div>';
        return;
    }
    
    const iconMap = {
        favorite: { icon: 'fa-star', color: 'orange', text: '收藏了' },
        download: { icon: 'fa-download', color: 'purple', text: '下载了' },
        tool: { icon: 'fa-tools', color: 'green', text: '使用了' },
        search: { icon: 'fa-search', color: 'blue', text: '检索了' }
    };
    
    container.innerHTML = activities.slice(0, 6).map(item => {
        const meta = iconMap[item.type] || iconMap.tool;
        return `
            <div class="activity-item">
                <div class="activity-icon ${meta.color}">
                    <i class="fas ${meta.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${meta.text} ${item.title || '内容'}</h4>
                    <p class="activity-time">${formatRelativeTime(item.time)}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderToolHistory(records) {
    const container = document.querySelector('.tools-history');
    if (!container) return;
    
    if (!records.length) {
        container.innerHTML = '<div class="empty-tip">暂无工具使用记录</div>';
        return;
    }
    
    container.innerHTML = records.map(record => `
        <div class="tool-history-item">
            <div class="tool-info">
                <i class="fas fa-toolbox"></i>
                <div>
                    <h4>${record.toolName || record.toolType || '法律工具'}</h4>
                    <p>${record.resultData ? truncateText(record.resultData, 60) : '已完成一次计算/使用'}</p>
                </div>
            </div>
            <span class="time">${formatDateTime(record.createdAt)}</span>
        </div>
    `).join('');
}

function renderDownloads(records) {
    const container = document.querySelector('.documents-grid');
    if (!container) return;
    
    if (!records.length) {
        container.innerHTML = '<div class="empty-tip">暂无下载记录</div>';
        return;
    }
    
    container.innerHTML = records.map(record => `
        <div class="document-card" data-template-id="${record.templateId || record.template?.id || ''}">
            <div class="document-icon">
                <i class="fas fa-file-contract"></i>
            </div>
            <h4>${record.templateTitle || record.template?.title || '文书模板'}</h4>
            <p>下载时间：${formatDateTime(record.createdAt || record.downloadTime)}</p>
            <div class="document-actions">
                <button class="btn btn-outline btn-small document-redownload-btn">
                    <i class="fas fa-download"></i> 重新下载
                </button>
            </div>
        </div>
    `).join('');
    
    container.querySelectorAll('.document-redownload-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const card = e.currentTarget.closest('.document-card');
            const templateId = card?.dataset.templateId;
            if (!templateId) return;
            try {
                await API.legalTools.downloadTemplate(templateId, card.querySelector('h4').textContent.trim());
                window.utils.showToast('开始下载模板', 'success');
            } catch (error) {
                window.utils.showToast(error.message || '下载失败', 'error');
            }
        });
    });
}

function renderFavorites(records) {
    const container = document.querySelector('.favorites-list');
    if (!container) return;
    
    if (!records.length) {
        container.innerHTML = '<div class="empty-tip">暂无收藏的法规</div>';
        return;
    }
    
    container.innerHTML = records.map(item => `
        <div class="favorite-item" data-regulation-id="${item.id}">
            <div class="favorite-info">
                <h4>${item.title}</h4>
                <p>收藏时间：${formatDateTime(item.favoriteAt)}</p>
            </div>
            <div class="favorite-actions">
                <button class="btn btn-primary btn-small" data-view-id="${item.id}">
                    查看
                </button>
                <button class="btn btn-outline btn-small favorite-remove-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    container.querySelectorAll('[data-view-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'legal-knowledge.html';
        });
    });
    
    container.querySelectorAll('.favorite-remove-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const favoriteItem = e.currentTarget.closest('.favorite-item');
            if (!favoriteItem) return;
            const regulationId = favoriteItem.dataset.regulationId;
            await removeFavorite(regulationId);
        });
    });
}

function populateSettingsForm(profile) {
    const settingsSection = document.getElementById('settings');
    if (!settingsSection) return;
    
    updateAvatarDisplays(profile.avatar);
    
    const nicknameInput = settingsSection.querySelector('input[type="text"]');
    const emailInput = settingsSection.querySelector('input[type="email"]');
    const phoneInput = settingsSection.querySelector('input[type="tel"]');
    const genderInputs = settingsSection.querySelectorAll('input[name="gender"]');
    const saveButton = settingsSection.querySelector('.btn.btn-primary');
    
    if (nicknameInput) nicknameInput.value = profile.nickname || '';
    if (emailInput) emailInput.value = profile.email || '';
    if (phoneInput) phoneInput.value = profile.phone || '';
    if (genderInputs.length) {
        genderInputs.forEach(input => {
            input.checked = input.value === (profile.gender || 'secret');
        });
    }
    
    if (saveButton && !saveButton.dataset.bound) {
        saveButton.dataset.bound = 'true';
        saveButton.addEventListener('click', (e) => {
            e.preventDefault();
            saveSettings();
        });
    }
}

function formatRelativeTime(value) {
    if (!value) return '';
    const target = new Date(value);
    if (Number.isNaN(target.getTime())) return value;
    const diff = Date.now() - target.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}天前`;
    return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

function formatDateTime(value) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function truncateText(text, maxLength = 80) {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

async function removeFavorite(target) {
    const regulationId = typeof target === 'string'
        ? target
        : target?.closest('.favorite-item')?.dataset.regulationId;
    
    if (!regulationId) return;
    
    try {
        await API.legalKnowledge.unfavoriteRegulation(regulationId);
        window.utils.showToast('已取消收藏', 'success');
        await loadUserCenterData();
    } catch (error) {
        window.utils.showToast(error.message || '取消收藏失败', 'error');
    }
}

async function saveSettings() {
    const settingsSection = document.getElementById('settings');
    if (!settingsSection) return;
    
    const nicknameInput = settingsSection.querySelector('input[type="text"]');
    const emailInput = settingsSection.querySelector('input[type="email"]');
    const genderInput = settingsSection.querySelector('input[name="gender"]:checked');
    
    try {
        window.utils.showLoading('保存设置中...');
        await API.user.updateUserInfo({
            nickname: nicknameInput?.value?.trim(),
            email: emailInput?.value?.trim(),
            gender: genderInput ? genderInput.value : 'secret'
        });
        window.utils.showToast('保存成功', 'success');
        await loadUserCenterData();
    } catch (error) {
        window.utils.showToast(error.message || '保存失败', 'error');
    } finally {
        window.utils.hideLoading();
    }
}

function initAvatarUpload() {
    const fileInput = document.getElementById('avatarFileInput');
    if (!fileInput) return;
    
    document.querySelectorAll('[data-avatar-upload-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            if (avatarUploadState.isUploading) return;
            fileInput.click();
        });
    });
    
    fileInput.addEventListener('change', handleAvatarFileChange);
}

async function handleAvatarFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!validateAvatarFile(file)) {
        event.target.value = '';
        return;
    }
    
    const previewUrl = previewLocalAvatar(file);
    
    try {
        avatarUploadState.isUploading = true;
        window.utils?.showLoading?.('上传头像中...');
        const response = await API.user.uploadAvatar(file);
        window.utils?.showToast?.('头像更新成功', 'success');
        
        const avatarUrl = response?.data?.avatarUrl || response?.avatarUrl || null;
        if (avatarUrl) {
            updateAvatarDisplays(avatarUrl);
        }
        
        try {
            const profileResp = await API.user.getUserInfo();
            userCenterState.profile = profileResp.data;
            API.auth?.updateLocalUserInfo?.(profileResp.data);
            updateProfileCard(profileResp.data);
            populateSettingsForm(profileResp.data);
            AuthManager?.updateUserDisplay?.();
        } catch (profileError) {
            console.error('刷新头像信息失败', profileError);
        }
    } catch (error) {
        console.error('头像上传失败', error);
        window.utils?.showToast?.(error.message || '上传失败，请稍后重试', 'error');
        updateAvatarDisplays(userCenterState.profile?.avatar || '');
    } finally {
        avatarUploadState.isUploading = false;
        window.utils?.hideLoading?.();
        event.target.value = '';
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    }
}

function validateAvatarFile(file) {
    if (!file.type.startsWith('image/')) {
        window.utils?.showToast?.('请选择图片文件', 'error');
        return false;
    }
    if (!avatarUploadState.acceptTypes.includes(file.type)) {
        window.utils?.showToast?.('仅支持 JPG/PNG/WebP 图片', 'error');
        return false;
    }
    if (file.size > avatarUploadState.maxSize) {
        window.utils?.showToast?.('图片大小不能超过 2MB', 'error');
        return false;
    }
    return true;
}

function previewLocalAvatar(file) {
    try {
        const url = URL.createObjectURL(file);
        updateAvatarDisplays(url);
        return url;
    } catch (error) {
        console.warn('无法创建头像预览', error);
        return '';
    }
}

function updateAvatarDisplays(avatarUrl) {
    const resolvedUrl = window.utils?.resolveAssetUrl?.(avatarUrl, 'avatars') || '';
    document.querySelectorAll('[data-avatar-preview]').forEach(el => {
        if (resolvedUrl) {
            el.innerHTML = `<img src="${resolvedUrl}" alt="用户头像">`;
            return;
        }
        const fallbackIcon = el.dataset.avatarDefaultIcon || 'user-circle';
        el.innerHTML = `<i class="fas fa-${fallbackIcon}"></i>`;
    });
}