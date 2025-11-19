/* ==========================================
   首页功能 - home.js
   包含：首页特定的交互功能
========================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // CTA按钮点击事件
    const ctaButtons = document.querySelectorAll('.cta-button, .btn-primary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 如果按钮没有onclick属性，则执行默认行为
            if (!this.hasAttribute('onclick')) {
                e.preventDefault();
                window.location.href = 'ai-consult.html';
            }
        });
    });
    
    // 功能卡片点击效果
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的是链接，不处理
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            
            // 查找卡片内的链接并跳转
            const link = this.querySelector('.feature-link');
            if (link) {
                window.location.href = link.href;
            }
        });
        
        // 添加鼠标移入/移出效果
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 滚动指示器点击事件
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const featuresSection = document.getElementById('features');
            if (featuresSection) {
                const offsetTop = featuresSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // 英雄区背景动画
    function initHeroAnimation() {
        const heroPattern = document.querySelector('.hero-pattern');
        if (heroPattern) {
            let scrollPosition = 0;
            
            window.addEventListener('scroll', () => {
                scrollPosition = window.pageYOffset;
                heroPattern.style.transform = `translateY(${scrollPosition * 0.3}px)`;
            });
        }
    }
    
    initHeroAnimation();
    
    // 统计数字动画增强
    function enhanceStatsAnimation() {
        const statItems = document.querySelectorAll('.stat-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // 添加延迟动画
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, {
            threshold: 0.5
        });
        
        statItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'all 0.6s ease-out';
            observer.observe(item);
        });
    }
    
    enhanceStatsAnimation();
    
    // 优势列表项动画
    function animateAdvantages() {
        const advantageItems = document.querySelectorAll('.advantage-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                        entry.target.classList.add('animated');
                    }, index * 150);
                }
            });
        }, {
            threshold: 0.3
        });
        
        advantageItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.transition = 'all 0.6s ease-out';
            observer.observe(item);
        });
    }
    
    animateAdvantages();
    
    // 流程步骤动画
    function animateProcessSteps() {
        const processSteps = document.querySelectorAll('.process-step');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'scale(1)';
                        entry.target.classList.add('animated');
                    }, index * 200);
                }
            });
        }, {
            threshold: 0.5
        });
        
        processSteps.forEach(step => {
            step.style.opacity = '0';
            step.style.transform = 'scale(0.8)';
            step.style.transition = 'all 0.6s ease-out';
            observer.observe(step);
        });
    }
    
    animateProcessSteps();
    
    // 图片懒加载
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    initLazyLoading();
    
    // 添加页面加载完成的类
    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 100);
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面不可见时暂停动画
            document.body.classList.add('page-hidden');
        } else {
            // 页面可见时恢复动画
            document.body.classList.remove('page-hidden');
        }
    });
});

// 页面卸载动画
window.addEventListener('beforeunload', () => {
    document.body.classList.add('page-unloading');
});




