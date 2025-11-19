/* ==========================================
   动画功能 - animations.js
   包含：滚动动画、元素进入视口动画
========================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // AOS (Animate On Scroll) 初始化
    function initAOS() {
        const elementsToAnimate = document.querySelectorAll('[data-aos]');
        
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, observerOptions);
        
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    }
    
    // 初始化滚动动画
    initAOS();
    
    // 数字计数动画
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        const observerOptions = {
            threshold: 0.5
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    const target = entry.target;
                    const endValue = parseInt(target.getAttribute('data-count'));
                    animateCounter(target, 0, endValue, 2000);
                    target.classList.add('counted');
                }
            });
        }, observerOptions);
        
        counters.forEach(counter => {
            observer.observe(counter);
        });
    }
    
    // 数字动画函数
    function animateCounter(element, start, end, duration) {
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
    
    // 初始化计数动画
    initCounterAnimation();
    
    // 视差滚动效果
    function initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.getAttribute('data-parallax') || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 10));
    }
    
    // 初始化视差效果
    initParallax();
    
    // 鼠标跟随效果（可选）
    function initMouseFollower() {
        const follower = document.createElement('div');
        follower.className = 'mouse-follower';
        follower.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(follower);
        
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            follower.style.opacity = '0.6';
        });
        
        document.addEventListener('mouseleave', () => {
            follower.style.opacity = '0';
        });
        
        function animate() {
            const distX = mouseX - followerX;
            const distY = mouseY - followerY;
            
            followerX += distX * 0.1;
            followerY += distY * 0.1;
            
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    // 如果不是移动设备，启用鼠标跟随效果
    if (window.innerWidth > 1024) {
        // initMouseFollower(); // 取消注释以启用
    }
    
    // 滚动进度条
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            progressBar.style.transform = `scaleX(${scrolled / 100})`;
        });
    }
    
    // 初始化滚动进度条
    initScrollProgress();
    
    // 页面加载动画
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // 隐藏加载遮罩（如果存在）
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.remove();
                }, 300);
            }, 500);
        }
    });
    
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 节流函数
    function throttle(func, wait) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, wait);
            }
        };
    }
});

// 页面切换动画
function pageTransition(url) {
    document.body.classList.add('page-transition-exit');
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}




