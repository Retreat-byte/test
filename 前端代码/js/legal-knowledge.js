/* ==========================================
   法律知识页面功能 - legal-knowledge.js
========================================== */

function getLawFavorites() {
    try {
        var raw = localStorage.getItem('lawFavorites');
        if (!raw) return [];
        var list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

function isLawFavorite(lawName) {
    if (!lawName) return false;
    var list = getLawFavorites();
    return list.indexOf(lawName) !== -1;
}

function setLawFavorite(lawName, isFav) {
    if (!lawName) return;
    var list = getLawFavorites();
    var idx = list.indexOf(lawName);
    if (isFav) {
        if (idx === -1) list.push(lawName);
    } else {
        if (idx !== -1) list.splice(idx, 1);
    }
    try {
        localStorage.setItem('lawFavorites', JSON.stringify(list));
    } catch (_) {}
}

function updateFavoriteButtonUI(lawName) {
    var btn = document.getElementById('lawModalFavorite');
    if (!btn) return;
    if (lawName && isLawFavorite(lawName)) {
        btn.classList.add('is-favorited');
        btn.innerHTML = '<i class="fas fa-star"></i> 已收藏';
    } else {
        btn.classList.remove('is-favorited');
        btn.innerHTML = '<i class="far fa-star"></i> 收藏';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const lawCards = document.querySelectorAll('.law-card');
    const lawModal = document.getElementById('lawModal');
    const lawModalTitle = document.getElementById('lawModalTitle');
    const lawModalMeta = document.getElementById('lawModalMeta');
    const lawModalContent = document.getElementById('lawModalContent');
    const lawModalClose = document.getElementById('lawModalClose');
    const lawModalFavorite = document.getElementById('lawModalFavorite');
    
    // 筛选标签点击事件
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // 更新活动标签
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选卡片
            filterLawCards(filter);
        });
    });
    
    // 筛选法规卡片
    function filterLawCards(filter) {
        lawCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = '';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                const badge = card.querySelector('.law-badge');
                if (badge && badge.classList.contains(filter)) {
                    card.style.display = '';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            }
        });
    }
    
    // 卡片悬停效果
    lawCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('more-card')) {
                this.style.transform = 'translateY(-5px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('more-card')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
    
    // 统计数字动画
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    const target = entry.target;
                    const value = target.textContent;
                    
                    // 如果是数字，执行动画
                    if (!isNaN(parseInt(value))) {
                        animateNumber(target, 0, parseInt(value.replace(/,/g, '')), 1500);
                    }
                    
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
            
            // 格式化数字（添加逗号）
            element.textContent = Math.round(current).toLocaleString();
        }, 16);
    }
    
    animateStats();

    function showLawModal() {
        if (!lawModal) return;
        lawModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hideLawModal() {
        if (!lawModal) return;
        lawModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    if (lawModalClose) lawModalClose.addEventListener('click', hideLawModal);
    if (lawModal) lawModal.addEventListener('click', function(e) {
        if (e.target === lawModal) hideLawModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lawModal && lawModal.classList.contains('show')) hideLawModal();
    });
    if (lawModalFavorite) lawModalFavorite.addEventListener('click', function() {
        var currentLawName = lawModal && lawModal.getAttribute('data-current-law');
        if (!currentLawName) return;
        var alreadyFav = isLawFavorite(currentLawName);
        setLawFavorite(currentLawName, !alreadyFav);
        updateFavoriteButtonUI(currentLawName);
        if (window.utils && window.utils.showToast) {
            if (!alreadyFav) {
                window.utils.showToast('已收藏《' + currentLawName + '》，后续可在个人中心查看', 'success');
            } else {
                window.utils.showToast('已取消收藏《' + currentLawName + '》', 'info');
            }
        }
    });
});

// 搜索法规
function searchLaws() {
    const searchInput = document.getElementById('lawSearch');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        window.utils.showToast('请输入搜索关键词', 'warning');
        return;
    }
    
    const lawCards = document.querySelectorAll('.law-card:not(.more-card)');
    let foundCount = 0;
    
    lawCards.forEach(card => {
        const title = card.querySelector('.law-title').textContent.toLowerCase();
        const intro = card.querySelector('.law-intro').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase()).join(' ');
        
        const matches = title.includes(query) || intro.includes(query) || tags.includes(query);
        
        if (matches) {
            card.style.display = '';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            foundCount++;
            
            // 高亮匹配的文字
            highlightMatch(card, query);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
    
    if (foundCount === 0) {
        window.utils.showToast('未找到匹配的法规', 'info');
    } else {
        window.utils.showToast(`找到 ${foundCount} 条相关法规`, 'success');
    }
}

// 高亮匹配文字（简化版）
function highlightMatch(card, query) {
    // 这里可以实现更复杂的高亮逻辑
    // 简化版本：只添加视觉提示
    card.style.borderColor = 'var(--primary-color)';
    setTimeout(() => {
        card.style.borderColor = '';
    }, 2000);
}

function viewLaw(lawName, docPath) {
    const titleEl = document.getElementById('lawModalTitle');
    const metaEl = document.getElementById('lawModalMeta');
    const contentEl = document.getElementById('lawModalContent');
    const overlay = document.getElementById('lawModal');
    if (!titleEl || !metaEl || !contentEl || !overlay) return;
    
    titleEl.textContent = `《${lawName}》全文`;
    contentEl.innerHTML = '<div style="text-align:center; padding: 2rem;"><div class="spinner"></div><p>正在加载文档...</p></div>';
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    overlay.setAttribute('data-current-law', lawName);
    updateFavoriteButtonUI(lawName);
    
    var metaHtml = '';
    if (lawName === '宪法') {
        metaHtml = '<div class="law-meta-row"><span><i class="fas fa-bookmark"></i> 1260条</span><span><i class="fas fa-calendar"></i> 生效: 2021-01-01</span><span><i class="fas fa-sync-alt"></i> 更新: 2020-05-28</span></div>';
    } else if (lawName === '刑法') {
        metaHtml = '<div class="law-meta-row"><span><i class="fas fa-bookmark"></i> 452条</span><span><i class="fas fa-calendar"></i> 生效: 1980-01-01</span><span><i class="fas fa-sync-alt"></i> 更新: 2020-12-26</span></div>';
    } else if (lawName === '民法典') {
        metaHtml = '<div class="law-meta-row"><span><i class="fas fa-bookmark"></i> 1260条</span><span><i class="fas fa-calendar"></i> 生效: 2021-01-01</span><span><i class="fas fa-sync-alt"></i> 更新: 2020-05-28</span></div>';
    } else if (lawName === '行政处罚法') {
        metaHtml = '<div class="law-meta-row"><span><i class="fas fa-bookmark"></i> 83条</span><span><i class="fas fa-calendar"></i> 生效: 1996-10-01</span><span><i class="fas fa-sync-alt"></i> 更新: 2021-07-15</span></div>';
    } else if (lawName === '劳动合同法') {
        metaHtml = '<div class="law-meta-row"><span><i class="fas fa-bookmark"></i> 98条</span><span><i class="fas fa-calendar"></i> 生效: 2008-01-01</span><span><i class="fas fa-sync-alt"></i> 更新: 2012-12-28</span></div>';
    } else if (lawName === '公司法') {
        metaHtml = '<div class="law-meta-row"><span><i class="fas fa-bookmark"></i> 218条</span><span><i class="fas fa-calendar"></i> 生效: 1994-07-01</span><span><i class="fas fa-sync-alt"></i> 更新: 2018-10-26</span></div>';
    }
    metaEl.innerHTML = metaHtml;
    
    if (docPath) {
        contentEl.innerHTML = '<div style="text-align:center; padding: 2rem;"><div class="spinner"></div><p>正在加载文档...</p></div>';
        fetch(docPath)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                var options = {
                    arrayBuffer: arrayBuffer,
                    styleMap: [
                        "p => p:fresh",
                        "h1 => h1:fresh",
                        "h2 => h2:fresh",
                        "h3 => h3:fresh",
                        "h4 => h4:fresh",
                        "h5 => h5:fresh",
                        "h6 => h6:fresh",
                        "strong => strong",
                        "em => em",
                        "u => u",
                        "b => b",
                        "i => i",
                        "table => table:fresh",
                        "tr => tr:fresh",
                        "td => td:fresh",
                        "th => th:fresh",
                        "ul => ul:fresh",
                        "ol => ol:fresh",
                        "li => li:fresh"
                    ]
                };
                return mammoth.convertToHtml(options);
            })
            .then(result => {
                var html = '<div class="law-document-preview">' + result.value + '</div>';
                contentEl.innerHTML = html;
                enhanceLawDocumentPreview(contentEl);
                if (window.utils && window.utils.showToast) window.utils.showToast(`已打开《${lawName}》全文`, 'success');
            })
            .catch(err => {
                contentEl.innerHTML = '<div style="color: var(--error-color); padding: 2rem; text-align: center;">文档加载失败: ' + err.message + '</div>';
                if (window.utils && window.utils.showToast) window.utils.showToast('文档加载失败', 'error');
            });
    } else {
        var contentHtml = '';
        if (lawName === '宪法') {
            contentHtml = '<div class="law-section"><h4>序言</h4><p>为了巩固人民民主专政，保障社会主义现代化建设的顺利进行，根据人民民主专政的理论，制定本宪法。</p></div>'+
                          '<div class="law-section"><h4>第一章 总纲</h4><div class="law-article"><div class="law-article-title">第一条</div><div class="law-article-body">中华人民共和国是工人阶级领导的、以工农联盟为基础的人民民主专政的社会主义国家。</div></div><div class="law-article"><div class="law-article-title">第二条</div><div class="law-article-body">中华人民共和国的一切权力属于人民。</div></div></div>';
        } else if (lawName === '刑法') {
            contentHtml = '<div class="law-section"><h4>总则</h4><div class="law-article"><div class="law-article-title">第一条</div><div class="law-article-body">为了惩罚犯罪，保护人民，维护社会秩序和公共安全，保障社会主义建设事业的顺利进行，制定本法。</div></div></div>'+
                          '<div class="law-section"><h4>分则</h4><div class="law-article"><div class="law-article-title">第二百六十四条</div><div class="law-article-body">盗窃公私财物，数额较大的，处三年以下有期徒刑、拘役或者管制，并处或者单处罚金。</div></div></div>';
        } else if (lawName === '民法典') {
            contentHtml = '<div class="law-section"><h4>总则编</h4><div class="law-article"><div class="law-article-title">第一条</div><div class="law-article-body">为了保护民事主体的合法权益，调整民事关系，维护社会和经济秩序，适应中国特色社会主义发展要求，制定本法典。</div></div></div>'+
                          '<div class="law-section"><h4>合同编</h4><div class="law-article"><div class="law-article-title">第五百零九条</div><div class="law-article-body">当事人应当按照约定全面履行自己的义务。</div></div></div>';
        } else if (lawName === '行政处罚法') {
            contentHtml = '<div class="law-section"><h4>总则</h4><div class="law-article"><div class="law-article-title">第一条</div><div class="law-article-body">为了规范行政处罚的设定和实施，保障和监督行政机关有效实施行政管理，保护公民、法人和其他组织的合法权益，维护社会公共利益和公共秩序，制定本法。</div></div></div>';
        } else if (lawName === '劳动合同法') {
            contentHtml = '<div class="law-section"><h4>总则</h4><div class="law-article"><div class="law-article-title">第一条</div><div class="law-article-body">为了完善劳动合同制度，明确劳动合同双方当事人的权利和义务，保护劳动者的合法权益，构建和发展和谐稳定的劳动关系，制定本法。</div></div></div>';
        } else if (lawName === '公司法') {
            contentHtml = '<div class="law-section"><h4>总则</h4><div class="law-article"><div class="law-article-title">第一条</div><div class="law-article-body">为了规范公司的组织和行为，保护公司、股东和债权人的合法权益，维护社会经济秩序，促进社会主义市场经济的发展，制定本法。</div></div></div>';
        } else {
            contentHtml = '<div class="law-section"><h4>正文</h4><p>内容加载中。</p></div>';
        }
        contentEl.innerHTML = contentHtml;
        if (window.utils && window.utils.showToast) window.utils.showToast(`已打开《${lawName}》全文`, 'success');
    }
}

function enhanceLawDocumentPreview(container) {
    if (!container) return;
    var wrapper = container.querySelector('.law-document-preview');
    if (!wrapper) return;
    var paragraphs = wrapper.querySelectorAll('p');
    if (!paragraphs.length) return;

    if (paragraphs[0]) paragraphs[0].classList.add('law-doc-main-title');
    if (paragraphs[1]) paragraphs[1].classList.add('law-doc-sub-title');
    if (paragraphs[2]) paragraphs[2].classList.add('law-doc-date');

    paragraphs.forEach(function(p) {
        var text = p.textContent;
        if (!text) return;
        text = text.replace(/\s+/g, '').trim();
        if (!text) return;

        if (/^[一二三四五六七八九十]+、/.test(text) || /^第[一二三四五六七八九十百千万0-9]+条/.test(text)) {
            p.classList.add('law-doc-article-title');
        }
    });

    for (var i = 0; i < paragraphs.length; i++) {
        var p = paragraphs[i];
        var raw = (p.textContent || '').trim();
        var norm = raw.replace(/\s+/g, '');
        if (!norm) continue;
        var looksLikeChapter = /^第[一二三四五六七八九十百千万0-9]+章/.test(norm);
        var looksLikeToc = /目|录|\.\.\.|…{2,}|\d+$/.test(raw);
        var isShort = norm.length <= 12; // 常见“第X章”+2-4字标题
        var next = paragraphs[i+1] ? paragraphs[i+1].textContent || '' : '';
        var nextNorm = next.replace(/\s+/g, '');
        var nextLooksLikeContent = /^(第[一二三四五六七八九十百千万0-9]+条|[一二三四五六七八九十]+、)/.test(nextNorm);
        if (looksLikeChapter && isShort && !looksLikeToc && nextLooksLikeContent) {
            p.classList.add('law-doc-chapter-title');
        }
    }
}

// 键盘快捷键：按 / 聚焦搜索框
document.addEventListener('keydown', function(e) {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        document.getElementById('lawSearch').focus();
    }
    
    // Enter 键搜索
    if (e.key === 'Enter' && document.activeElement.id === 'lawSearch') {
        e.preventDefault();
        searchLaws();
    }
});

// 清空搜索
document.getElementById('lawSearch').addEventListener('input', function() {
    if (this.value === '') {
        // 重置显示所有卡片
        const lawCards = document.querySelectorAll('.law-card');
        lawCards.forEach(card => {
            card.style.display = '';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }
});




