/* ==========================================
   法律工具页面功能 - legal-tools.js
========================================== */

const escapeHtml = (str = '') => String(str).replace(/[&<>"']/g, (match) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[match] || match));

const formatFileSize = (size = 0) => {
    if (!Number.isFinite(size) || size <= 0) return '—';
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
};

const formatCaseDateLabel = (value) => {
    if (!value) return '未知时间';
    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${date.getFullYear()}-${mm}-${dd}`;
    } catch {
        return value;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    
    // 工具卡片点击效果
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 使用次数动画
    function animateUsageCount() {
        const usageCounts = document.querySelectorAll('.usage-count');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(10px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'all 0.6s ease-out';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                }
            });
        }, {
            threshold: 0.5
        });
        
        usageCounts.forEach(count => {
            observer.observe(count);
        });
    }
    
    animateUsageCount();
});

// 打开工具模态框
function openToolModal(toolType) {
    const toolInfo = {
        calculator: {
            title: '法律计算器',
            content: `
                <div class="calculator-tool">
                    <div class="calculator-tabs">
                        <button class="calc-tab active" data-calc="lawsuit">诉讼费用</button>
                        <button class="calc-tab" data-calc="compensation">劳动补偿</button>
                        <button class="calc-tab" data-calc="interest">逾期利息</button>
                        <button class="calc-tab" data-calc="penalty">违约金</button>
                    </div>
                    
                    <div class="calculator-content">
                        <div class="calc-panels">
                            <div class="calc-panel active" data-panel="lawsuit">
                                <h3>诉讼费用估算</h3>
                                <div class="calc-layout">
                                    <div class="calc-form">
                                        <div class="form-group">
                                            <label>诉讼请求金额（元）</label>
                                            <input type="number" id="lawsuitAmount" placeholder="请输入诉讼请求金额" min="0">
                                        </div>
                                        <div class="form-group">
                                            <label>案件受理费率（%）</label>
                                            <input type="number" id="lawsuitRate" placeholder="常见为 1% - 2.5%" min="0" step="0.1">
                                        </div>
                                        <div class="form-group">
                                            <label>其他固定费用（元，可选）</label>
                                            <input type="number" id="lawsuitExtra" placeholder="如鉴定费、公告费等" min="0">
                                        </div>
                                        <button class="btn btn-primary" onclick="calculateLawsuitFee()">
                                            <i class="fas fa-scale-balanced"></i> 估算费用
                                        </button>
                                    </div>
                                    <div class="calc-summary">
                                        <div id="calcResultLawsuit" class="calc-result">
                                            <div class="result-card">
                                                <h4>费用估算</h4>
                                                <div class="result-item">
                                                    <span>诉讼请求金额：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <div class="result-item">
                                                    <span>按费率收取：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <div class="result-total">
                                                    <span>预估诉讼总费用：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <p class="result-note">
                                                    <i class="fas fa-info-circle"></i>
                                                    此估算基于输入费率，仅供参考。实际费用以法院通知为准，可能包含材料费、公告费等额外项目。
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="calc-panel" data-panel="compensation">
                                <h3>劳动补偿金计算</h3>
                                <div class="calc-layout">
                                    <div class="calc-form">
                                    <div class="form-group">
                                            <label>工作年限（年）</label>
                                            <input type="number" id="workYears" placeholder="请输入工作年限" min="0" step="0.1">
                                        </div>
                                        <div class="form-group">
                                            <label>月平均工资（元）</label>
                                            <input type="number" id="avgSalary" placeholder="请输入月平均工资" min="0">
                                        </div>
                                        <button class="btn btn-primary" onclick="calculateCompensation()">
                                            <i class="fas fa-calculator"></i> 开始计算
                                        </button>
                                    </div>
                                    <div class="calc-summary">
                                        <div id="calcResultCompensation" class="calc-result">
                                            <div class="result-card">
                                                <h4>计算结果</h4>
                                                <div class="result-item">
                                                    <span>工作年限：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <div class="result-item">
                                                    <span>月平均工资：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <div class="result-total">
                                                    <span>应得补偿金：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <p class="result-note">
                                                    <i class="fas fa-info-circle"></i>
                                                    根据《劳动合同法》规定，经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="calc-panel" data-panel="interest">
                                <h3>逾期利息计算</h3>
                                <div class="calc-layout">
                                    <div class="calc-form">
                                        <div class="form-group">
                                            <label>本金金额（元）</label>
                                            <input type="number" id="interestPrincipal" placeholder="请输入本金金额" min="0">
                                        </div>
                                        <div class="form-group form-group-inline">
                                            <div>
                                                <label>年利率（%）</label>
                                                <input type="number" id="interestRate" placeholder="请输入年化利率" min="0" step="0.01">
                                            </div>
                                            <div>
                                                <label>逾期天数（天）</label>
                                                <input type="number" id="interestDays" placeholder="请输入逾期天数" min="0">
                                            </div>
                                        </div>
                                        <button class="btn btn-primary" onclick="calculateInterest()">
                                            <i class="fas fa-clock"></i> 计算利息
                                        </button>
                                    </div>
                                    <div class="calc-summary">
                                        <div id="calcResultInterest" class="calc-result">
                                            <div class="result-card">
                                                <h4>逾期利息</h4>
                                                <div class="result-item">
                                                    <span>本金：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <div class="result-item">
                                                    <span>年利率：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <div class="result-item">
                                                    <span>逾期天数：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <div class="result-total">
                                                    <span>应计逾期利息：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <p class="result-note">
                                                    <i class="fas fa-info-circle"></i>
                                                    逾期利息按单利计算，若合同有复利约定或需采用司法裁判利率，请以实际协议或裁判标准为准。
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="calc-panel" data-panel="penalty">
                                <h3>违约金估算</h3>
                                <div class="calc-layout">
                                    <div class="calc-form">
                                        <div class="form-group">
                                            <label>合同约定金额（元）</label>
                                            <input type="number" id="penaltyAmount" placeholder="请输入合同总金额" min="0">
                                        </div>
                                        <div class="form-group">
                                            <label>违约金比例（%）</label>
                                            <input type="number" id="penaltyRate" placeholder="请输入约定比例" min="0" step="0.1">
                                        </div>
                                        <div class="form-group form-group-inline">
                                            <div>
                                                <label>违约天数（天，可选）</label>
                                                <input type="number" id="penaltyDays" placeholder="如无按 0 填写" min="0">
                                            </div>
                                            <div>
                                                <label>日违约金比例（‰，可选）</label>
                                                <input type="number" id="penaltyDailyRate" placeholder="按千分比计算" min="0" step="0.1">
                                            </div>
                                        </div>
                                        <button class="btn btn-primary" onclick="calculatePenalty()">
                                            <i class="fas fa-file-signature"></i> 估算违约金
                                        </button>
                                    </div>
                                    <div class="calc-summary">
                                        <div id="calcResultPenalty" class="calc-result">
                                            <div class="result-card">
                                                <h4>违约金估算</h4>
                                                <div class="result-item">
                                                    <span>合同金额：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <div class="result-item">
                                                    <span>固定比例违约金：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <div class="result-total">
                                                    <span>预估违约金总额：</span>
                                                    <strong>-</strong>
                                                </div>
                                                <p class="result-note">
                                                    <i class="fas fa-info-circle"></i>
                                                    违约金应当以合同约定或司法调整为准。若违约金明显过高或过低，法院可能酌情调整。您在主张或履行违约金时，建议结合实际损失等因素综合考量，以保障自身权益的合理性。
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        review: {
            title: '法律文件审查',
            content: `
                <div class="review-tool">
                    <p class="review-intro">上传合同或法律文件，系统将识别潜在风险条款并生成针对性的修改建议。</p>
                    <div class="review-interface">
                        <div class="review-dropzone" id="uploadArea">
                            <div class="dropzone-icon">
                                <i class="fas fa-cloud-arrow-up"></i>
                            </div>
                            <div class="dropzone-copy" id="dropzoneInstructions">
                                <strong>拖拽文件到此处，或点击上传</strong>
                                <span>支持 PDF / DOC / DOCX · 单个文件不超过 10MB</span>
                            </div>
                            <div class="uploaded-file" id="uploadedFileName" hidden>
                                <span class="uploaded-file__name"></span>
                                <button type="button" class="uploaded-file__remove" id="removeUploadedFile" aria-label="删除已上传文件">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        <input type="file" id="fileInput" accept=".pdf,.doc,.docx" style="display:none">
                        </div>
                        <div class="review-result-pane">
                            <div class="review-placeholder" id="reviewPlaceholder">
                                <i class="fas fa-file-lines"></i>
                                <p>上传文件后，将在此展示风险条款、修改建议与关注要点。</p>
                            </div>
                            <div id="reviewResult" class="review-result"></div>
                        </div>
                    </div>
                    <div class="review-note">
                        <span><i class="fas fa-shield-check"></i> 数据仅用于审查过程，不会保存或对外传播您的文件内容。</span>
                        <a href="privacy.html">了解数据安全规范</a>
                    </div>
                </div>
            `
        },
        template: {
            title: '法律文书模板',
            content: `
                <div class="template-tool">
                    <div class="template-categories">
                        <button class="template-cat active" data-cat="contract">合同类</button>
                        <button class="template-cat" data-cat="dispute">纠纷解决类</button>
                        <button class="template-cat" data-cat="rights">权益声明 / 告知类</button>
                        <button class="template-cat" data-cat="common">其他常用类</button>
                    </div>
                    
                    <div class="template-scroll-area">
                        <div class="template-list" id="templateList"></div>
                    </div>
                </div>
            `
        },
        search: {
            title: '智能案例检索',
            content: `
                <div class="search-tool">
                    <div class="search-input-group">
                        <input type="text" id="caseSearch" placeholder="请输入案件关键词、案由或当事人...">
                        <button class="btn btn-primary" onclick="searchCases()">
                            <i class="fas fa-search"></i> 搜索
                        </button>
                    </div>
                    
                    <div class="search-filters">
                        <div class="custom-select" data-name="caseType">
                            <div class="select-trigger">
                                <span class="select-value">全部案件类型</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="select-options">
                                <div class="select-option" data-value="全部案件类型">全部案件类型</div>
                                <div class="select-option" data-value="人民调解工作">人民调解工作</div>
                                <div class="select-option" data-value="法律援助工作">法律援助工作</div>
                                <div class="select-option" data-value="公证工作">公证工作</div>
                                <div class="select-option" data-value="司法鉴定工作">司法鉴定工作</div>
                                <div class="select-option" data-value="社区矫正工作">社区矫正工作</div>
                                <div class="select-option" data-value="律师工作">律师工作</div>
                                <div class="select-option" data-value="戒毒工作">戒毒工作</div>
                                <div class="select-option" data-value="监狱工作">监狱工作</div>
                                <div class="select-option" data-value="法制工作">法制工作</div>
                                <div class="select-option" data-value="法治宣传教育工作">法治宣传教育工作</div>
                                <div class="select-option" data-value="司法考试工作">司法考试工作</div>
                                <div class="select-option" data-value="仲裁案例">仲裁案例</div>
                            </div>
                        </div>
                        <div class="custom-select" data-name="region">
                            <div class="select-trigger">
                                <span class="select-value">全部审理地区</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="select-options">
                                <div class="select-option" data-value="全部审理地区">全部审理地区</div>
                                <div class="select-option" data-value="北京市">北京市</div>
                                <div class="select-option" data-value="天津市">天津市</div>
                                <div class="select-option" data-value="上海市">上海市</div>
                                <div class="select-option" data-value="重庆市">重庆市</div>
                                <div class="select-option" data-value="河北省">河北省</div>
                                <div class="select-option" data-value="山西省">山西省</div>
                                <div class="select-option" data-value="辽宁省">辽宁省</div>
                                <div class="select-option" data-value="吉林省">吉林省</div>
                                <div class="select-option" data-value="黑龙江省">黑龙江省</div>
                                <div class="select-option" data-value="江苏省">江苏省</div>
                                <div class="select-option" data-value="浙江省">浙江省</div>
                                <div class="select-option" data-value="安徽省">安徽省</div>
                                <div class="select-option" data-value="福建省">福建省</div>
                                <div class="select-option" data-value="江西省">江西省</div>
                                <div class="select-option" data-value="山东省">山东省</div>
                                <div class="select-option" data-value="河南省">河南省</div>
                                <div class="select-option" data-value="湖北省">湖北省</div>
                                <div class="select-option" data-value="湖南省">湖南省</div>
                                <div class="select-option" data-value="广东省">广东省</div>
                                <div class="select-option" data-value="海南省">海南省</div>
                                <div class="select-option" data-value="四川省">四川省</div>
                                <div class="select-option" data-value="贵州省">贵州省</div>
                                <div class="select-option" data-value="云南省">云南省</div>
                                <div class="select-option" data-value="陕西省">陕西省</div>
                                <div class="select-option" data-value="甘肃省">甘肃省</div>
                                <div class="select-option" data-value="青海省">青海省</div>
                            </div>
                        </div>
                        <div class="custom-select" data-name="year">
                            <div class="select-trigger">
                                <span class="select-value">全部判决年份</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="select-options">
                                <div class="select-option" data-value="全部判决年份">全部判决年份</div>
                                <div class="select-option" data-value="2025年">2025年</div>
                                <div class="select-option" data-value="2024年">2024年</div>
                                <div class="select-option" data-value="2023年">2023年</div>
                                <div class="select-option" data-value="2022年">2022年</div>
                                <div class="select-option" data-value="2021年">2021年</div>
                                <div class="select-option" data-value="2020年">2020年</div>
                                <div class="select-option" data-value="2019年">2019年</div>
                                <div class="select-option" data-value="2018年">2018年</div>
                                <div class="select-option" data-value="2017年">2017年</div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="searchResults" class="search-results">
                        <!-- 默认显示所有案例 -->
                    </div>
                </div>
            `
        },
        evidence: {
            title: '证据管理工具',
            content: `
                <div class="evidence-tool">
                    <p class="tool-intro">系统化管理您的诉讼证据，支持分类整理和快速检索</p>
                    <div class="evidence-categories">
                        <div class="evidence-cat">
                            <i class="fas fa-folder"></i>
                            <span>合同文件</span>
                            <span class="badge">0</span>
                        </div>
                        <div class="evidence-cat">
                            <i class="fas fa-image"></i>
                            <span>图片证据</span>
                            <span class="badge">0</span>
                        </div>
                        <div class="evidence-cat">
                            <i class="fas fa-video"></i>
                            <span>视频证据</span>
                            <span class="badge">0</span>
                        </div>
                        <div class="evidence-cat">
                            <i class="fas fa-file-audio"></i>
                            <span>录音证据</span>
                            <span class="badge">0</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                        <i class="fas fa-plus"></i> 上传证据
                    </button>
                    <p class="tool-hint">此功能需要登录后使用</p>
                </div>
            `
        }
    };
    
    const info = toolInfo[toolType];
    if (!info) {
        window.utils.showToast('该工具正在开发中...', 'info');
        return;
    }
    
    // 创建模态框
    const overlay = document.createElement('div');
    overlay.className = 'tool-modal-overlay';
    overlay.innerHTML = `
        <div class="tool-modal with-title">
            <div class="tool-modal-header">
                <h3 class="tool-modal-title">${info.title}</h3>
                <button class="tool-modal-close" onclick="closeToolModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="tool-modal-body">
                ${info.content}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    if (toolType === 'calculator') {
        const modal = overlay.querySelector('.tool-modal');
        if (modal) {
            modal.classList.add('calculator-modal');
        }
    } else if (toolType === 'template') {
        const modal = overlay.querySelector('.tool-modal');
        if (modal) {
            modal.classList.add('template-modal');
        }
    } else if (toolType === 'search') {
        const modal = overlay.querySelector('.tool-modal');
        if (modal) {
            modal.classList.add('search-modal');
        }
    }
    
    // 显示模态框
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    // 点击背景关闭
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeToolModal();
        }
    });
    
    // 初始化工具特定功能
    initToolFeatures(toolType);
}

// 关闭工具模态框
function closeToolModal() {
    const overlay = document.querySelector('.tool-modal-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// 初始化工具特定功能
function initToolFeatures(toolType) {
    setTimeout(() => {
        if (toolType === 'review') {
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const placeholder = document.getElementById('reviewPlaceholder');
            const reviewResult = document.getElementById('reviewResult');
            const uploadedFileLabel = document.getElementById('uploadedFileName');
            const uploadedFileNameText = uploadedFileLabel?.querySelector('.uploaded-file__name');
            const removeFileBtn = document.getElementById('removeUploadedFile');
            const instructions = document.getElementById('dropzoneInstructions');
            const dropzoneIcon = uploadArea?.querySelector('.dropzone-icon');
            const placeholderDefault = placeholder ? placeholder.innerHTML : '';
            const reviewPane = document.querySelector('.review-result-pane');

            const REVIEW_SEVERITY_CLASS = {
                high: 'is-critical',
                medium: 'is-warning',
                low: 'is-info'
            };
            const REVIEW_SEVERITY_LABEL = {
                high: '高风险',
                medium: '中风险',
                low: '提示'
            };
            const FALLBACK_SUGGESTIONS = [
                {
                    title: '合同解除条款约定模糊',
                    severity: 'high',
                    problem: '未明确合同解除的具体情形、通知方式及解除后的责任划分，易引发解约纠纷。',
                    suggestion: '补充“约定解除（如根本违约情形）、法定解除的适用条件”，明确书面通知的送达要求及解约后双方的清理义务。'
                },
                {
                    title: '知识产权归属约定缺失',
                    severity: 'medium',
                    problem: '合同未对合作产生的知识产权归属、使用权限及收益分配做出约定，存在权属争议风险。',
                    suggestion: '新增“知识产权归属条款”，明确成果所有权、许可使用范围、期限及收益分配。'
                },
                {
                    title: '保密义务条款范围过窄',
                    severity: 'low',
                    problem: '仅约定对“商业秘密”的保密责任，未涵盖技术秘密、客户信息等敏感数据。',
                    suggestion: '扩大保密范围，明确保密期限，并约定违约责任或违约金计算方式。'
                },
                {
                    title: '争议解决方式约定冲突',
                    severity: 'medium',
                    problem: '同时约定法院管辖与仲裁，管辖约定矛盾导致条款无效。',
                    suggestion: '统一争议解决方式，明确由特定法院或仲裁机构管辖。'
                }
            ];

            const setPlaceholderState = (state, message = '') => {
                if (!placeholder) return;
                placeholder.classList.remove('is-hidden', 'is-processing');
                placeholder.innerHTML = placeholderDefault;
                if (state === 'loading') {
                    placeholder.classList.add('is-processing');
                    placeholder.innerHTML = `
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>${message}</p>
                    `;
                } else if (state === 'error') {
                    placeholder.innerHTML = `
                        <i class="fas fa-triangle-exclamation"></i>
                        <p>${message}</p>
                    `;
                } else if (state === 'hidden') {
                    placeholder.classList.add('is-hidden');
                }
            };

            const buildSuggestions = (suggestions = []) => {
                if (Array.isArray(suggestions) && suggestions.length) {
                    return suggestions.map(item => ({
                        title: item.title || '条款提示',
                        severity: (item.severity || item.type || 'low').toLowerCase(),
                        problem: item.description || item.problem || '系统识别到该条款存在潜在风险，需要人工复核。',
                        suggestion: item.recommendation || item.suggestion || '请结合实际情况补充条款要素，确保责任义务表述清晰。'
                    }));
                }
                return FALLBACK_SUGGESTIONS;
            };

            const renderReviewReport = (reviewData = {}) => {
                const suggestions = buildSuggestions(reviewData.suggestions);
                const score = Number.isFinite(reviewData.overallScore) ? reviewData.overallScore : 80;
                return `
                    <div class="review-report">
                        <div class="review-summary">
                            <div class="review-summary__item">
                                <span class="review-summary__label">文件名称</span>
                                <strong class="review-summary__value">${escapeHtml(reviewData.fileName || '未命名文件')}</strong>
                            </div>
                            <div class="review-summary__item">
                                <span class="review-summary__label">文件大小</span>
                                <strong class="review-summary__value">${formatFileSize(reviewData.fileSize)}</strong>
                            </div>
                            <div class="review-summary__score">
                                <span>整体合规评分</span>
                                <strong>${score}</strong>
                            </div>
                        </div>
                        <div class="review-carousel">
                            <button type="button" class="review-carousel__nav review-carousel__nav--prev" aria-label="查看上一条">&lt;</button>
                            <div class="review-cards" id="reviewCards">
                                ${suggestions.map((issue, index) => `
                                    <article class="review-card${index === 0 ? ' active' : ''}" data-index="${index}">
                                        <header class="review-card__header">
                                            <span class="review-card__badge ${REVIEW_SEVERITY_CLASS[issue.severity] || 'is-info'}">
                                                ${REVIEW_SEVERITY_LABEL[issue.severity] || '提示'}
                                            </span>
                                            <h4 class="review-card__title">${escapeHtml(issue.title)}</h4>
                                        </header>
                                        <div class="review-card__body">
                                            <p class="review-card__label">具体问题</p>
                                            <p class="review-card__text">${escapeHtml(issue.problem)}</p>
                                            <p class="review-card__label">改进意见</p>
                                            <p class="review-card__text">${escapeHtml(issue.suggestion)}</p>
                                        </div>
                                    </article>
                                `).join('')}
                            </div>
                            <button type="button" class="review-carousel__nav review-carousel__nav--next" aria-label="查看下一条">&gt;</button>
                        </div>
                        <div class="review-switcher" id="reviewSwitcher">
                            ${suggestions.map((_, index) => `
                                <button type="button" class="review-switcher__dot${index === 0 ? ' is-active' : ''}" data-target="${index}" aria-label="查看问题 ${index + 1}"></button>
                            `).join('')}
                        </div>
                    </div>
                `;
            };

            const bindReviewCarousel = () => {
                if (!reviewResult) return;
                const cards = reviewResult.querySelectorAll('.review-card');
                const switcher = reviewResult.querySelector('#reviewSwitcher');
                const prevBtn = reviewResult.querySelector('.review-carousel__nav--prev');
                const nextBtn = reviewResult.querySelector('.review-carousel__nav--next');
                let activeIndex = 0;
                const setActiveCard = (target) => {
                    const max = cards.length - 1;
                    if (max < 0) return;
                    const nextIndex = ((target % (max + 1)) + (max + 1)) % (max + 1);
                    activeIndex = nextIndex;
                    cards.forEach((card, idx) => {
                        card.classList.toggle('active', idx === activeIndex);
                    });
                    if (switcher) {
                        switcher.querySelectorAll('.review-switcher__dot').forEach((btn, idx) => {
                            btn.classList.toggle('is-active', idx === activeIndex);
                        });
                    }
                };
                prevBtn?.addEventListener('click', () => setActiveCard(activeIndex - 1));
                nextBtn?.addEventListener('click', () => setActiveCard(activeIndex + 1));
                if (switcher) {
                    switcher.querySelectorAll('.review-switcher__dot').forEach(dot => {
                        dot.addEventListener('click', () => {
                            const target = Number(dot.getAttribute('data-target'));
                            setActiveCard(target);
                        });
                    });
                }
            };

            const resetReviewState = (withToast = false) => {
                if (uploadedFileLabel && uploadedFileNameText) {
                    uploadedFileLabel.hidden = true;
                    uploadedFileNameText.textContent = '';
                }
                if (instructions) {
                    instructions.hidden = false;
                    instructions.classList.remove('is-hidden');
                }
                dropzoneIcon?.classList.remove('is-hidden');
                if (placeholder) {
                    placeholder.classList.remove('is-processing');
                    placeholder.classList.remove('is-hidden');
                    placeholder.innerHTML = placeholderDefault;
                }
                if (reviewResult) {
                    reviewResult.innerHTML = '';
                    reviewResult.classList.remove('has-content');
                }
                reviewPane?.classList.remove('has-cards');
                uploadArea?.classList.remove('is-processing');
                if (fileInput) {
                    fileInput.value = '';
                }
                if (withToast) {
                    window.utils?.showToast?.('已移除上传文件', 'info');
                }
            };

            const handleFile = async (file) => {
                if (!file) return;
                if (uploadedFileLabel && uploadedFileNameText) {
                    uploadedFileLabel.hidden = false;
                    uploadedFileNameText.textContent = file.name;
                }
                if (instructions) {
                    instructions.hidden = true;
                    instructions.classList.add('is-hidden');
                }
                dropzoneIcon?.classList.add('is-hidden');
                reviewResult?.classList.remove('has-content');
                reviewPane?.classList.remove('has-cards');

                setPlaceholderState('loading', `正在审查 <strong>${escapeHtml(file.name)}</strong> …`);
                uploadArea?.classList.add('is-processing');
                window.utils?.showToast?.('正在生成审查结果…', 'info');

                if (!window.API?.legalTools?.reviewLegalDocument) {
                    setPlaceholderState('error', '审查服务暂不可用，请稍后重试。');
                    uploadArea?.classList.remove('is-processing');
                    return;
                }

                try {
                    const resp = await API.legalTools.reviewLegalDocument(file);
                    const data = resp.data || {};
                    reviewResult.innerHTML = renderReviewReport({
                        ...data,
                        fileName: data.fileName || file.name,
                        fileSize: data.fileSize ?? file.size
                    });
                    reviewResult.classList.add('has-content');
                    reviewPane?.classList.add('has-cards');
                    setPlaceholderState('hidden');
                    bindReviewCarousel();
                    window.utils?.showToast?.('审查完成', 'success');
                } catch (error) {
                    console.error('文档审查失败', error);
                    const message = error.message || '审查失败，请稍后再试';
                    setPlaceholderState('error', message);
                    window.utils?.showToast?.(message, 'error');
                } finally {
                    uploadArea?.classList.remove('is-processing');
                }
            };
            
            if (uploadArea && fileInput) {
                uploadArea.addEventListener('click', () => fileInput.click());
                
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = 'rgba(60, 70, 84, 0.6)';
                    uploadArea.style.background = 'rgba(99, 110, 123, 0.08)';
                });
                
                uploadArea.addEventListener('dragleave', () => {
                    uploadArea.style.borderColor = '';
                    uploadArea.style.background = '';
                });
                
                uploadArea.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = '';
                    uploadArea.style.background = '';
                    const file = e.dataTransfer?.files?.[0];
                    if (file) {
                        const transfer = new DataTransfer();
                        transfer.items.add(file);
                        fileInput.files = transfer.files;
                        await handleFile(file);
                        fileInput.value = '';
                    }
                });
                
                fileInput.addEventListener('change', async () => {
                    const file = fileInput.files?.[0];
                    if (file) {
                        await handleFile(file);
                        fileInput.value = '';
                    }
                });
            }

            if (removeFileBtn) {
                removeFileBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    resetReviewState(true);
                });
            }

            resetReviewState();
        }
        
        if (toolType === 'template') {
            const templateList = document.getElementById('templateList');
            const categoryButtons = document.querySelectorAll('.template-cat');
            const templateData = {
                contract: [
                    {
                        title: '劳动合同（标准版）',
                        description: '适用于一般企业的正式用工，包含试用期、保密与竞业限制等常规条款。',
                        icon: 'fa-file-contract'
                    },
                    {
                        title: '服务合同（委托类）',
                        description: '约定服务范围、费用结算、违约责任等，适用于顾问/外包服务情形。',
                        icon: 'fa-pen-to-square'
                    },
                    {
                        title: '采购合同（货物买卖）',
                        description: '涵盖质量验收、交付方式、价款结算与争议解决等关键约定。',
                        icon: 'fa-box-open'
                    },
                    {
                        title: '战略合作框架协议',
                        description: '明确合作范围、技术共享、收益分配和退出机制，适用于公司间战略协作。',
                        icon: 'fa-sitemap'
                    },
                    {
                        title: '项目外包合同',
                        description: '适用于软件、设计等外包项目，约定可交付成果、验收标准与违约责任。',
                        icon: 'fa-diagram-project'
                    },
                    {
                        title: '租赁合同（房屋）',
                        description: '规范房屋租赁关系，明确租金、押金、维修责任及违约处理等条款。',
                        icon: 'fa-home'
                    },
                    {
                        title: '销售代理协议',
                        description: '约定代理销售的区域、产品、佣金比例及市场保护等核心条款。',
                        icon: 'fa-handshake'
                    },
                    {
                        title: '技术开发合同',
                        description: '明确技术开发的目标、进度、知识产权归属及验收标准等关键事项。',
                        icon: 'fa-code'
                    },
                    {
                        title: '供应商框架协议',
                        description: '建立长期供应关系，约定质量标准、价格机制及供货保障等条款。',
                        icon: 'fa-truck'
                    },
                    {
                        title: '股权转让协议',
                        description: '规范股权转让的价格、支付方式、过户手续及相关保证条款。',
                        icon: 'fa-chart-pie'
                    }
                ],
                dispute: [
                    {
                        title: '民事起诉状',
                        description: '用于向人民法院提起诉讼时使用，含当事人信息、诉讼请求与事实理由等。',
                        icon: 'fa-gavel'
                    },
                    {
                        title: '仲裁申请书',
                        description: '提交仲裁机构时使用，列明仲裁请求、事实依据、证据清单等内容。',
                        icon: 'fa-scale-balanced'
                    },
                    {
                        title: '民事调解协议书',
                        description: '适用于协商和解后固定双方权利义务，便于司法确认或履行。',
                        icon: 'fa-handshake'
                    },
                    {
                        title: '执行申请书',
                        description: '用于向法院申请强制执行生效法律文书，列明执行依据、标的及财产线索。',
                        icon: 'fa-gavel'
                    },
                    {
                        title: '律师函模板',
                        description: '规范主张权利或催告义务的文本，强调法律依据与整改期限。',
                        icon: 'fa-envelope-open-text'
                    },
                    {
                        title: '民事答辩状',
                        description: '用于应诉时提交法院，针对起诉状的事实和理由进行反驳和抗辩。',
                        icon: 'fa-file-shield'
                    },
                    {
                        title: '财产保全申请书',
                        description: '向法院申请冻结对方财产，防止判决执行时财产转移或隐匿。',
                        icon: 'fa-lock'
                    },
                    {
                        title: '证据保全申请书',
                        description: '申请法院对可能灭失的证据进行保全，确保诉讼中证据的完整性。',
                        icon: 'fa-folder-open'
                    },
                    {
                        title: '上诉状模板',
                        description: '对一审判决不服时使用，明确上诉请求、事实理由和法律依据。',
                        icon: 'fa-arrow-up'
                    },
                    {
                        title: '劳动仲裁申请书',
                        description: '向劳动仲裁委员会申请仲裁，解决劳动争议和权益纠纷。',
                        icon: 'fa-users'
                    }
                ],
                rights: [
                    {
                        title: '隐私权告知与授权书',
                        description: '详述个人信息采集、使用范围与保存期限，满足知情与同意要求。',
                        icon: 'fa-shield-halved'
                    },
                    {
                        title: '员工入职告知承诺书',
                        description: '用于告知劳动安全、保密义务与规章制度，并留存员工签名确认。',
                        icon: 'fa-id-card-clip'
                    },
                    {
                        title: '产品风险提示书',
                        description: '适合高风险产品销售前的提示确认，提醒潜在风险及免责范围。',
                        icon: 'fa-triangle-exclamation'
                    },
                    {
                        title: '个人信息撤回授权申请',
                        description: '帮助用户撤回对敏感个人信息的授权，规范处理流程与反馈时限。',
                        icon: 'fa-user-shield'
                    },
                    {
                        title: '未成年人监护声明书',
                        description: '监护人确认授权孩子参与活动、使用产品的相关风险知悉与责任承担。',
                        icon: 'fa-children'
                    },
                    {
                        title: '免责声明书',
                        description: '明确活动或服务的风险范围，限制组织方在特定情况下的法律责任。',
                        icon: 'fa-exclamation-triangle'
                    },
                    {
                        title: '知识产权声明',
                        description: '声明作品、商标、专利等知识产权的归属和使用限制。',
                        icon: 'fa-copyright'
                    },
                    {
                        title: '数据处理告知书',
                        description: '告知用户数据收集、处理目的、方式及用户权利等信息。',
                        icon: 'fa-database'
                    },
                    {
                        title: '竞业限制告知书',
                        description: '告知员工竞业限制的范围、期限、补偿标准及违约责任。',
                        icon: 'fa-ban'
                    },
                    {
                        title: '安全责任告知书',
                        description: '告知参与者活动安全注意事项、应急措施及责任分担。',
                        icon: 'fa-hard-hat'
                    }
                ],
                common: [
                    {
                        title: '授权委托书',
                        description: '用于授权他人办理工商、税务、诉讼等事项，列明授权范围与期限。',
                        icon: 'fa-stamp'
                    },
                    {
                        title: '保密协议（双向）',
                        description: '约定双方对商业秘密、技术资料等信息的保密范围与违约责任。',
                        icon: 'fa-lock'
                    },
                    {
                        title: '会议纪要模板',
                        description: '记录会议决议、责任分工与跟进事项，支持导出归档与追溯。',
                        icon: 'fa-clipboard-check'
                    },
                    {
                        title: '对外投资决议',
                        description: '用于有限公司股东会议通过对外投资事项，明确投资额度与表决情况。',
                        icon: 'fa-building-columns'
                    },
                    {
                        title: '固定资产借用单',
                        description: '登记资产借出与归还，注明责任人、使用期限与维护要求。',
                        icon: 'fa-warehouse'
                    },
                    {
                        title: '股东会决议',
                        description: '记录股东会议的决议事项、表决结果及执行安排。',
                        icon: 'fa-users-gear'
                    },
                    {
                        title: '董事会决议',
                        description: '记录董事会重大决策、人事任免及业务决定等事项。',
                        icon: 'fa-briefcase'
                    },
                    {
                        title: '离职证明书',
                        description: '证明员工离职时间、岗位及工作表现，用于办理相关手续。',
                        icon: 'fa-id-badge'
                    },
                    {
                        title: '收据/收条模板',
                        description: '规范收款凭证的格式，明确收款事由、金额及相关信息。',
                        icon: 'fa-receipt'
                    },
                    {
                        title: '借条/欠条模板',
                        description: '规范借贷关系的书面凭证，明确金额、期限及还款方式。',
                        icon: 'fa-file-invoice-dollar'
                    },
                    {
                        title: '公司章程模板',
                        description: '有限责任公司章程范本，包含股东权利、治理结构等核心条款。',
                        icon: 'fa-building'
                    }
                ]
            };

            const renderTemplates = (category) => {
                if (!templateList) return;
                const templates = templateData[category] || [];
                if (!templates.length) {
                    templateList.innerHTML = `
                        <div class="template-empty">
                            <i class="fas fa-inbox"></i>
                            <p>该分类暂无模板，敬请期待。</p>
                        </div>
                    `;
                    return;
                }

                templateList.innerHTML = templates.map(item => `
                    <div class="template-item">
                        <i class="fas ${item.icon}"></i>
                        <div class="template-info">
                            <h4>${item.title}</h4>
                            <p>${item.description}</p>
                        </div>
                        <div class="template-actions">
                            <button class="btn template-btn btn-view" data-action="view" data-template="${item.title}">
                                查看
                            </button>
                            <button class="btn template-btn btn-download" data-action="download" data-template="${item.title}">
                                下载
                            </button>
                        </div>
                    </div>
                `).join('');
                
                // 渲染完成后立即绑定事件
                setTimeout(() => {
                    const viewButtons = document.querySelectorAll('.template-btn[data-action="view"]');
                    const downloadButtons = document.querySelectorAll('.template-btn[data-action="download"]');
                    
                    viewButtons.forEach(btn => {
                        if (btn._templateViewHandler) {
                            btn.removeEventListener('click', btn._templateViewHandler);
                        }
                        
                        btn._templateViewHandler = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const templateName = btn.dataset.template;
                            if (!templatePreviewInitialized) {
                                initTemplatePreview();
                            }
                            window.handleTemplateView?.(null, templateName);
                        };
                        
                        btn.addEventListener('click', btn._templateViewHandler);
                    });
                    
                    downloadButtons.forEach(btn => {
                        if (btn._templateDownloadHandler) {
                            btn.removeEventListener('click', btn._templateDownloadHandler);
                        }
                        
                        btn._templateDownloadHandler = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const templateName = btn.dataset.template;
                            window.handleTemplateDownload?.(null, templateName);
                        };
                        
                        btn.addEventListener('click', btn._templateDownloadHandler);
                    });
                }, 100);
            };

            const activateCategory = (targetBtn) => {
                categoryButtons.forEach(btn => {
                    btn.classList.toggle('active', btn === targetBtn);
                });
                const category = targetBtn?.dataset?.cat || 'contract';
                renderTemplates(category);
            };

            if (categoryButtons.length) {
                categoryButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        if (!button.classList.contains('active')) {
                            activateCategory(button);
                        }
                    });
                });
                const initialActive = Array.from(categoryButtons).find(btn => btn.classList.contains('active')) || categoryButtons[0];
                activateCategory(initialActive);
            } else {
                renderTemplates('contract');
            }

            initTemplatePreview();
        }
        
        if (toolType === 'calculator') {
            const tabs = document.querySelectorAll('.calc-tab');
            const panels = document.querySelectorAll('.calc-panel');
            
            const activatePanel = (panelKey) => {
                tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.calc === panelKey));
                panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === panelKey));
            };
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    if (!tab.classList.contains('active')) {
                        activatePanel(tab.dataset.calc);
                    }
                });
            });
        } else if (toolType === 'search') {
            initCustomSelects();
            loadAllCases();
            const searchInput = document.getElementById('caseSearch');
            searchInput?.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    searchCases();
                }
            });
        }
    }, 100);
}

// 计算劳动补偿金
async function calculateCompensation() {
    const workYearsValue = parseFloat(document.getElementById('workYears').value);
    const avgSalary = parseFloat(document.getElementById('avgSalary').value);
    const resultDiv = document.getElementById('calcResultCompensation');
    
    if (!Number.isFinite(workYearsValue) || workYearsValue <= 0) {
        showCalcError(resultDiv, '请输入有效的工作年限');
        return;
    }
    if (!Number.isFinite(avgSalary) || avgSalary <= 0) {
        showCalcError(resultDiv, '请输入有效的月平均工资');
        return;
    }
    if (!window.API?.legalTools?.calculateCompensation) {
        showCalcError(resultDiv, '计算服务暂不可用，请稍后重试');
        return;
    }
    
    const workYears = Math.max(Math.floor(workYearsValue), 0);
    const monthsDecimal = Math.max(workYearsValue - workYears, 0);
    const workMonths = Math.round(monthsDecimal * 12);
    
    setCalcLoading(resultDiv, '正在根据后台规则计算补偿金...');
    
    try {
        const resp = await API.legalTools.calculateCompensation({
            monthlyWage: avgSalary,
            workYears,
            workMonths,
            calculationType: 'normal'
        });
        const data = resp.data || {};
        resultDiv.innerHTML = `
            <div class="result-card">
                <h4>计算结果</h4>
                <div class="result-item">
                    <span>累计工龄：</span>
                    <strong>${(data.totalYears ?? (workYearsValue || 0)).toFixed(2)} 年</strong>
                </div>
                <div class="result-item">
                    <span>月平均工资：</span>
                    <strong>${formatCurrency(avgSalary)}</strong>
                </div>
                <div class="result-item">
                    <span>基础补偿：</span>
                    <strong>${formatCurrency(data.baseAmount ?? (avgSalary * workYearsValue))}</strong>
                </div>
                <div class="result-item">
                    <span>赔偿倍数：</span>
                    <strong>${data.multiplier ?? 1} 倍</strong>
                </div>
                <div class="result-total">
                    <span>应得补偿金：</span>
                    <strong>${formatCurrency(data.compensation)}</strong>
                </div>
                <p class="result-note">
                    <i class="fas fa-info-circle"></i>
                    结果由后端劳动补偿规则计算，仅供参考，具体金额以仲裁/司法裁决为准。
                </p>
            </div>
        `;
        markCalcSummary(resultDiv);
        window.utils?.showToast?.('补偿金计算完成', 'success');
    } catch (error) {
        console.error('计算补偿金失败', error);
        showCalcError(resultDiv, error.message || '计算失败，请稍后重试');
    }
}

async function calculateLawsuitFee() {
    const amount = parseFloat(document.getElementById('lawsuitAmount').value);
    const extra = parseFloat(document.getElementById('lawsuitExtra').value) || 0;
    const resultDiv = document.getElementById('calcResultLawsuit');
    
    if (!Number.isFinite(amount) || amount <= 0) {
        showCalcError(resultDiv, '请输入有效的诉讼请求金额');
        return;
    }
    if (!window.API?.legalTools?.calculateLitigationFee) {
        showCalcError(resultDiv, '诉讼费计算服务暂不可用');
        return;
    }
    
    setCalcLoading(resultDiv, '正在查询诉讼费标准...');
    
    try {
        const resp = await API.legalTools.calculateLitigationFee({
            caseType: 'civil',
            disputeAmount: amount
        });
        const data = resp.data || {};
        const baseFee = data.litigationFee ?? 0;
        const totalFee = baseFee + (extra || 0);
        resultDiv.innerHTML = `
            <div class="result-card">
                <h4>费用估算</h4>
                <div class="result-item">
                    <span>案件类型：</span>
                    <strong>${data.caseType || '民事案件'}</strong>
                </div>
                <div class="result-item">
                    <span>诉讼请求金额：</span>
                    <strong>${formatCurrency(data.disputeAmount ?? amount)}</strong>
                </div>
                <div class="result-item">
                    <span>应缴受理费：</span>
                    <strong>${formatCurrency(baseFee)}</strong>
                </div>
                ${extra ? `
                <div class="result-item">
                    <span>其他固定费用：</span>
                    <strong>${formatCurrency(extra)}</strong>
                </div>` : ''}
                <div class="result-total">
                    <span>预估诉讼总费用：</span>
                    <strong>${formatCurrency(totalFee)}</strong>
                </div>
                <p class="result-note">
                    <i class="fas fa-info-circle"></i>
                    费用依据最高法诉讼费标准计算，最终金额以法院实际收取为准。
                </p>
            </div>
        `;
        markCalcSummary(resultDiv);
        window.utils?.showToast?.('诉讼费用计算完成', 'success');
    } catch (error) {
        console.error('诉讼费计算失败', error);
        showCalcError(resultDiv, error.message || '计算失败，请稍后重试');
    }
}

function calculateInterest() {
    const principal = parseFloat(document.getElementById('interestPrincipal').value);
    const rate = parseFloat(document.getElementById('interestRate').value);
    const days = parseFloat(document.getElementById('interestDays').value);
    
    const pOk = Number.isFinite(principal) && principal > 0;
    const rOk = Number.isFinite(rate) && rate > 0;
    const dOk = Number.isFinite(days) && days > 0;
    const interest = pOk && rOk && dOk ? Number((principal * (rate / 100) / 365 * days).toFixed(2)) : null;
    
    const resultDiv = document.getElementById('calcResultInterest');
    resultDiv.innerHTML = `
        <div class="result-card">
            <h4>逾期利息</h4>
            <div class="result-item">
                <span>本金：</span>
                <strong>${pOk ? `¥${principal.toLocaleString()}` : '-'}</strong>
            </div>
            <div class="result-item">
                <span>年利率：</span>
                <strong>${rOk ? `${rate}%` : '-'}</strong>
            </div>
            <div class="result-item">
                <span>逾期天数：</span>
                <strong>${dOk ? `${days} 天` : '-'}</strong>
            </div>
            <div class="result-total">
                <span>应计逾期利息：</span>
                <strong>${interest !== null ? `¥${interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</strong>
            </div>
            <p class="result-note">
                <i class="fas fa-info-circle"></i>
                逾期利息按单利计算，若合同有复利约定或需采用司法裁判利率，请以实际协议或裁判标准为准。
            </p>
        </div>
    `;
    const summary = resultDiv.closest('.calc-summary');
    if (summary) {
        summary.classList.add('has-result');
    }
}

async function calculatePenalty() {
    const amount = parseFloat(document.getElementById('penaltyAmount').value);
    const rate = parseFloat(document.getElementById('penaltyRate').value);
    const days = parseFloat(document.getElementById('penaltyDays').value) || 0;
    const dailyRate = parseFloat(document.getElementById('penaltyDailyRate').value) || 0;
    const resultDiv = document.getElementById('calcResultPenalty');
    
    if (!Number.isFinite(amount) || amount <= 0) {
        showCalcError(resultDiv, '请输入有效的合同金额');
        return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
        showCalcError(resultDiv, '请输入有效的违约金比例');
        return;
    }
    if (!window.API?.legalTools?.calculatePenalty) {
        showCalcError(resultDiv, '违约金计算服务暂不可用');
        return;
    }
    
    setCalcLoading(resultDiv, '正在根据合同金额估算违约金...');
    
    const penaltyRateDecimal = rate / 100;
    const dailyPenalty = amount > 0 && days > 0 && dailyRate > 0
        ? Number((amount * (dailyRate / 1000) * days).toFixed(2))
        : 0;
    
    try {
        const resp = await API.legalTools.calculatePenalty({
            contractAmount: amount,
            breachType: 'general',
            penaltyRate: penaltyRateDecimal,
            actualLoss: amount
        });
        const data = resp.data || {};
        const backendPenalty = data.penaltyAmount ?? (amount * penaltyRateDecimal);
        const totalPenalty = backendPenalty + (dailyPenalty || 0);
        resultDiv.innerHTML = `
            <div class="result-card">
                <h4>违约金估算</h4>
                <div class="result-item">
                    <span>合同金额：</span>
                    <strong>${formatCurrency(data.contractAmount ?? amount)}</strong>
                </div>
                <div class="result-item">
                    <span>约定比例：</span>
                    <strong>${((data.penaltyRate ?? penaltyRateDecimal) * 100).toFixed(2)}%</strong>
                </div>
                <div class="result-item">
                    <span>实际损失（上限参考）：</span>
                    <strong>${formatCurrency(data.actualLoss ?? amount)}</strong>
                </div>
                <div class="result-item">
                    <span>基础违约金：</span>
                    <strong>${formatCurrency(backendPenalty)}</strong>
                </div>
                ${dailyPenalty ? `
                <div class="result-item">
                    <span>按日累积违约金：</span>
                    <strong>${formatCurrency(dailyPenalty)}</strong>
                </div>` : ''}
                <div class="result-total">
                    <span>预估违约金总额：</span>
                    <strong>${formatCurrency(totalPenalty)}</strong>
                </div>
                <p class="result-note">
                    <i class="fas fa-info-circle"></i>
                    计算结果由后台审核规则得出，如明显高于实际损失，法院可能予以调减。
                </p>
            </div>
        `;
        markCalcSummary(resultDiv);
        window.utils?.showToast?.('违约金估算完成', 'success');
    } catch (error) {
        console.error('违约金计算失败', error);
        showCalcError(resultDiv, error.message || '计算失败，请稍后重试');
    }
}

function setCalcLoading(container, message = '正在计算...') {
    if (!container) return;
    container.innerHTML = `
        <div class="result-card is-loading">
            <div class="loading-inline">
                <span class="loading-spinner small"></span>
                <p>${message}</p>
            </div>
        </div>
    `;
    const summary = container.closest('.calc-summary');
    if (summary) {
        summary.classList.remove('has-result');
    }
}

function showCalcError(container, message) {
    if (!container) return;
    container.innerHTML = `
        <div class="result-card error">
            <div class="result-error">
                <i class="fas fa-triangle-exclamation"></i>
                <p>${message}</p>
            </div>
        </div>
    `;
    const summary = container.closest('.calc-summary');
    if (summary) {
        summary.classList.add('has-result');
    }
    window.utils?.showToast?.(message, 'error');
}

function markCalcSummary(container) {
    const summary = container?.closest('.calc-summary');
    if (summary) {
        summary.classList.add('has-result');
    }
}

function formatCurrency(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '-';
    }
    const numberValue = Number(value);
    return `¥${numberValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}
// 获取所有案例数据
function getAllCasesData() {
    return [
        {
            id: 'case1',
            title: '张某诉某公司劳动合同纠纷案',
            type: '人民调解工作',
            court: '北京市朝阳区人民法院',
            year: '2023年',
            similarity: '92%',
            summary: '原告张某在某科技公司工作期间，因公司未按规定支付加班费及解除劳动合同时未支付经济补偿金，遂提起劳动争议仲裁。仲裁委员会裁决支持原告部分请求后，公司不服提起诉讼。法院经审理认为，公司确实存在未足额支付加班费的情形，判决公司支付张某加班费差额及经济补偿金共计8.5万元。',
            region: '北京'
        },
        {
            id: 'case2',
            title: '李某与某房地产公司房屋买卖合同纠纷案',
            type: '法律援助工作',
            court: '上海市浦东新区人民法院',
            year: '2023年',
            similarity: '88%',
            summary: '原告李某于2022年与被告某房地产开发公司签订商品房买卖合同，约定2023年6月交房。但开发商延期至2023年10月才交付，李某要求按合同约定支付延期交付违约金。法院审理后认定开发商构成违约，判决其支付违约金12万元及相应利息。',
            region: '上海'
        },
        {
            id: 'case3',
            title: '王某与某保险公司保险合同纠纷案',
            type: '公证工作',
            court: '广州市天河区人民法院',
            year: '2024年',
            similarity: '85%',
            summary: '原告王某投保人身意外伤害保险后发生交通事故，保险公司以事故原因不明为由拒绝理赔。法院经审理认为，保险公司未能提供充分证据证明免责事由，判决保险公司支付保险金30万元。此案对类似保险理赔纠纷具有重要参考价值。',
            region: '广东'
        },
        {
            id: 'case4',
            title: '陈某诉某银行金融借款合同纠纷案',
            type: '司法鉴定工作',
            court: '深圳市福田区人民法院',
            year: '2024年',
            similarity: '82%',
            summary: '原告陈某因经营需要向被告银行申请贷款，双方签订借款合同。后因市场变化，陈某无法按期还款，银行要求立即清偿全部债务。法院认定银行提前收贷缺乏合同依据，判决陈某按原约定分期还款。',
            region: '广东'
        },
        {
            id: 'case5',
            title: '刘某交通肇事罪案',
            type: '仲裁案例',
            court: '杭州市西湖区人民法院',
            year: '2023年',
            similarity: '79%',
            summary: '被告人刘某酒后驾驶机动车，在市区道路上撞死行人后逃逸。公安机关接报后迅速将其抓获。法院认定刘某构成交通肇事罪，判处有期徒刑三年，并赔偿被害人家属经济损失。',
            region: '浙江'
        }
    ];
}

// 渲染案例列表
function renderCases(cases) {
    const resultsDiv = document.getElementById('searchResults');
    if (!cases || cases.length === 0) {
        resultsDiv.innerHTML = '<p class="empty-state">未找到相关案例</p>';
        return;
    }
    
    resultsDiv.innerHTML = cases.map(caseItem => `
        <div class="case-item">
            <div class="case-content">
                <h4>${caseItem.title}</h4>
                <div class="case-meta">
                    <span class="case-tag-type"><i class="fas fa-tag"></i>${caseItem.type}</span>
                    <span class="case-tag-year"><i class="fas fa-calendar-alt"></i>${caseItem.year}</span>
                </div>
                <div class="case-summary">
                    ${caseItem.summary}
                </div>
            </div>
            <div class="case-actions">
                <button class="btn btn-primary" onclick="viewCaseDetail('${caseItem.id}')">
                    查看详情
                </button>
            </div>
        </div>
    `).join('');
}

// 加载所有案例
function loadAllCases() {
    const allCases = getAllCasesData();
    renderCases(allCases);
}

// 搜索案例
function searchCases() {
    const searchInput = document.getElementById('caseSearch');
    const query = searchInput.value.trim();
    
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = `
        <div class="search-loading">
            <div class="search-loading-spinner"></div>
            <div class="search-loading-text">正在搜索相关案例...</div>
        </div>
    `;
    
    // 模拟搜索
    setTimeout(() => {
        const allCases = getAllCasesData();
        let filteredCases = allCases;
        
        if (query) {
            // 根据关键词筛选案例
            filteredCases = allCases.filter(caseItem => 
                caseItem.title.toLowerCase().includes(query.toLowerCase()) ||
                caseItem.summary.toLowerCase().includes(query.toLowerCase()) ||
                caseItem.court.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        renderCases(filteredCases);
    }, 800);
}

// 筛选案例
function filterCases() {
    const allCases = getAllCasesData();
    const typeFilter = getCustomSelectValue('caseType');
    const regionFilter = getCustomSelectValue('region');
    const yearFilter = getCustomSelectValue('year');
    
    let filteredCases = allCases.filter(caseItem => {
        // 类型匹配逻辑
        let typeMatch = typeFilter === '全部案件类型' || caseItem.type === typeFilter;
        if (!typeMatch) {
            // 支持更多案件类型匹配
            if (typeFilter === '劳动纠纷' && caseItem.title.includes('劳动')) typeMatch = true;
            if (typeFilter === '合同纠纷' && (caseItem.title.includes('合同') || caseItem.title.includes('买卖'))) typeMatch = true;
            if (typeFilter === '经济纠纷' && (caseItem.title.includes('金融') || caseItem.title.includes('借款'))) typeMatch = true;
        }
        
        // 地区匹配逻辑 - 支持所有省级行政区
        let regionMatch = regionFilter === '全部审理地区';
        if (!regionMatch) {
            // 简化匹配逻辑：提取地区名称的主要部分进行匹配
            const regionName = regionFilter.replace(/[市省区]/g, '').replace(/壮族|回族|维吾尔|特别行政/g, '');
            regionMatch = caseItem.region.includes(regionName) || regionName.includes(caseItem.region);
        }
        
        const yearMatch = yearFilter === '全部判决年份' || caseItem.year === yearFilter;
        
        return typeMatch && regionMatch && yearMatch;
    });
    
    renderCases(filteredCases);
}


// 查看案例详情
async function viewCaseDetail(caseId) {
    // 显示加载状态
    const loadingOverlay = createLoadingModal('正在加载案例详情...');
    document.body.appendChild(loadingOverlay);
    
    try {
        // 从后端API获取案例数据
        const response = await API.legalTools.getCaseDetail(caseId);
        
        if (!response || !response.data) {
            throw new Error('案例数据获取失败');
        }
        
        const data = response.data;
        
        // 解析content字段（JSON格式）
        let parsedContent;
        if (typeof data.content === 'string') {
            parsedContent = JSON.parse(data.content);
        } else {
            parsedContent = data.content;
        }
        
        // 构建案例数据对象
        const caseData = {
            title: data.title,
            caseNumber: data.case_number || '暂无',
            date: data.publish_date || data.created_at,
            type: data.case_type || '其他',
            sections: parsedContent.sections || parsedContent // 支持两种格式
        };
        
        // 移除加载状态
        loadingOverlay.remove();
        
        // 显示案例详情
        displayCaseDetail(caseData);
        
    } catch (error) {
        console.error('获取案例详情失败:', error);
        loadingOverlay.remove();
        
        if (window.utils && window.utils.showToast) {
            window.utils.showToast('案例加载失败：' + error.message, 'error');
        }
        
        // 回退到硬编码数据（开发测试用）
        useFallbackCaseData(caseId);
    }
}

// 辅助函数：创建加载模态框
function createLoadingModal(message) {
    const overlay = document.createElement('div');
    overlay.className = 'tool-modal-overlay show';
    overlay.innerHTML = `
        <div class="tool-modal" style="text-align: center; padding: 40px;">
            <div class="spinner"></div>
            <p style="margin-top: 20px; color: #666;">${message}</p>
        </div>
    `;
    return overlay;
}

// 辅助函数：显示案例详情
function displayCaseDetail(data) {
    // 创建案例详情模态框
    const overlay = document.createElement('div');
    overlay.className = 'tool-modal-overlay';
    
    // 根据数据结构生成内容
    let sectionsHtml = '';
    if (Array.isArray(data.sections)) {
        // sections是数组格式
        sectionsHtml = data.sections.map(section => `
            <div class="case-detail-section">
                <h4><i class="fas fa-bookmark"></i>${section.section_title || section.title}</h4>
                <p>${(section.section_content || section.content).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>
            </div>
        `).join('');
    } else {
        sectionsHtml = '<div class="case-detail-section"><p>案例内容格式错误</p></div>';
    }
    
    overlay.innerHTML = `
        <div class="tool-modal case-detail-modal">
            <div class="tool-modal-header">
                <h3 class="tool-modal-title">案例详情</h3>
                <button class="tool-modal-close" onclick="closeCaseDetail()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="tool-modal-body">
                <div class="case-detail-content">
                    <div class="case-detail-header">
                        <h2 class="case-detail-title">${data.title}</h2>
                        <div class="case-detail-meta">
                            <div class="case-detail-meta-item">
                                <span class="meta-label">案例编号</span>
                                <span class="meta-value">${data.caseNumber}</span>
                            </div>
                            <div class="case-detail-meta-item">
                                <span class="meta-label">案例发表时间</span>
                                <span class="meta-value">${data.date}</span>
                            </div>
                            <div class="case-detail-meta-item">
                                <span class="meta-label">案例类型</span>
                                <span class="meta-value">${data.type}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${sectionsHtml}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 显示模态框
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    // 点击背景关闭
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeCaseDetail();
        }
    });
}

// 回退函数：使用硬编码数据（仅用于开发测试）
function useFallbackCaseData(caseId) {
    const caseData = {
        case1: {
            title: '上海市闵行区某太阳能电力公司与陈某劳动争议纠纷调解案',
            caseNumber: 'FJGGGY169943179O',
            date: '2024-12-29',
            type: '公证业务案例',
            sections: [
                {
                    title: '案情简介',
                    content: '2011年7月某日，陈某进入某太阳能电力公司工作，双方签订劳动合同。2021年7月以来，公司由于经营发生变故，实施经济性裁员，陈某于2022年3月底被通知被裁员。陈某向公司提出要求：1.支付违法解除劳动合同赔偿金262409.38元；2.支付2021年8月至2022年3月的工资差额43280元。公司拒绝了陈某的要求，经多次协商无果后，公司于2022年9月向闵行区劳动争议人民调解委员会（以下简称调委会）申请调解解决该纠纷。'
                },
                {
                    title: '调解过程',
                    content: '调委会受理该案后，立即派出调解员开展调解工作。调解员首先电话联系陈某询问具体情况，陈某了解调解员的来意后当场拒绝调解，理由是他与公司已多次协商，但因双方金额差距太大无法达成一致意见。面对陈某的态度，调解员并没有放弃，而是电话联系到另一方当事人某公司的人事经理王某进一步了解情况。据了解，某公司因经营严重困难，于2021年7月便开始停工停产。在此之前，公司员工均已被告知情况，公司也制定了相应的裁员方案，并将该方案上报了有关劳动行政部门。公司自2021年8月起，逐步和员工协商解除劳动关系。公司共有620名员工，到2022年8月底，大部分的员工已与公司签订补偿协议，公司也按协议要求支付给了员工相应金额。但仍有几个员工以各种理由拒绝和公司签订补偿协议，陈某就是其中之一。另外，王某表示如果能够通过调解的方式与陈某协商解决此事，公司方会全力配合。得知公司方的态度后，调解员向王某提出查看公司的裁员方案和报备方面的相关材料，为双方之后的调解打下更坚实的基础。王某表示同意。\n\n调解员仔细翻阅公司方提供的相关资料后，再次与陈某取得联系，确认陈某不同意公司方提出的协商方案的原因。一开始陈某态度比较强硬，仍旧拒绝调解，但在调解员耐心的劝说下，态度逐渐发生转变同意调解并与调解员积极沟通，最终说出了原因是不同意公司方提出的经济补偿金的计算方式。公司方提出经济补偿金的基数是从其离职时往前推12个月的平均工资。陈某是2022年3月某日离职的，往前12个月中有8个月，即2021年8月至2022年3月，公司每个月支付的都是上海市最低工资，公司按照这个标准计算出的补偿金会少很多，因此陈某不认可公司的补偿方案。\n\n对此，调解员向其进行了解释说明，《中华人民共和国劳动合同法》第四十七条第三款规定："本条所称月工资是指劳动者在劳动合同解除或者终止前十二个月的平均工资。"因此公司的做法并不违反法律。此外，调解员也将公司愿意调解的态度转告陈某，希望陈某认真考虑。经调解员的劝说引导后，双方最终约定于2022年9月某日在调解中心进行面对面调解。调解当天，双方当事人依约到达现场。调解开始后，调解员首先指出双方的矛盾焦点集中在两个方面：一是公司是否应当补足2021年8月至2022年3月的工资差额；二是公司提出的经济补偿金是否合法。双方均确认无误。随后，调解员从法律角度出发解释，《上海市企业工资支付办法》第十二条规定："企业停工、停产在一个工资支付周期内的，应当按约定支付劳动者工资。超过一个工资支付周期的，企业可根据劳动者提供的劳动，按双方新的约定支付工资，但不得低于本市规定的最低工资标准。"公司方在停工第1个月支付给陈某足额的工资，在之后的8个月按照上海市最低工资标准支付，符合上述法律规定。陈某听了调解员的分析后，也意识到自己这部分诉求有点不合理，但还不能承认这个事实，于是调解员建议陈某自己去咨询相关律师。在律师处得到与调解员相同的答案后，陈某同意放弃第二项补足工资差额的要求，但仍旧对公司计算的经济补偿金额不认可。\n\n对此，调解员向其进行相关法律条文的解释，《中华人民共和国劳动合同法》第四十一条第一款关于经济性裁员的规定："有下列情形之一，需要裁减人员二十人以上或者裁减不足二十人但占企业职工总数百分之十以上的，用人单位提前三十日向工会或者全体职工说明情况，听取工会或者职工的意见后，裁减人员方案经向劳动行政部门报告，可以裁减人员……（二）生产经营发生严重困难的……"第四十七条关于经济补偿计算的规定："经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿……本条所称月工资是指劳动者在劳动合同解除或者终止前十二个月的平均工资。"根据以上法律规定，公司的裁员是合法的，补偿金的方案也是合法的。\n\n听了调解员的解释说明，陈某表示认可，但情理上希望公司能够再提高一点补偿金额。调解员对公司补偿方案进行了分析，虽然公司方的行为符合法律规定，但公司经营发生严重困难可以追溯到2021年7月，裁员方案也是当时就有了，并且陈某在此期间没有为公司提供劳动，为何公司要将与陈某解除劳动关系一事拖延至2022年3月底，公司的这一行为直接影响了陈某经济补偿的数额。对此，调解员与公司方代表人事经理王某做进一步沟通。王某告知调解员，由于公司员工人数较多，需要分批签订协议，期间又有些员工不认可公司提出的方案，公司需要做大量工作，因此才发生了一些拖延。调解员听后指出，这是公司办事效率的问题，不该影响到陈某的利益，陈某也不应为此承担损失。王某听了调解员的说理释法后，表示认可，也充分认识到了公司的做法存在不当之处，愿意提高补偿金额。至此，经过调解员的耐心引导与劝解，纠纷双方最终就赔偿金额达成了一致意见。'
                },
                {
                    title: '调解结果',
                    content: '在调解员的劝说疏导下，陈某与某太阳能电力公司达成共识并签订了调解协议：\n\n1.公司于2022年10月某日一次性支付陈某经济补偿金50567元；\n\n2.本协议约定，公司支付义务内容履行完毕后，双方不存在任何其他纠纷。\n\n1周后，调解员对纠纷双方进行了电话回访，得知公司已如约履行了协议，双方对于调解结果均表示满意。'
                },
                {
                    title: '案例点评',
                    content: '本案是一起因公司发生严重经营困难后在裁员过程中发生的纠纷。调解员受理该案后，及时介入，通过调查研究了解案件的详情，分析申请人的实际情况，随后根据相关法条分别向双方解析各自做的不规范的地方。最终安排双方坐下来面对面沟通协商。在调解过程中，调解员耐心倾听、细心观察，运用恰当的法律法规劝说引导，适时提出建议，并最终让双方当事人握手言和。通过本案也让我们认识到，虽然调解员在调解中本着公平公正，合理合法的原则，但当调解员的分析结果对调解一方不利时，就有可能使其误会调解员会偏向另一方。面对这种情况，解释相关的法律文件和借助有资质的第三方介入调解能有效地解决这一问题。'
                }
            ]
        },
        case2: {
            title: '李某与某房地产公司房屋买卖合同纠纷案',
            caseNumber: '(2023)沪0115民初67890号',
            date: '2023年11月20日',
            type: '民事案件',
            sections: [
                {
                    title: '案件事实',
                    content: '2022年5月，原告李某与被告某房地产开发公司签订商品房买卖合同，购买一套120平方米的住宅，总价款350万元。合同约定交房时间为2023年6月30日，如延期交付，开发商应按日支付万分之三的违约金。实际交付时间为2023年10月15日，延期107天。'
                },
                {
                    title: '法院判决',
                    content: '法院认定被告构成违约，应承担违约责任。按照合同约定的违约金标准，判决被告支付原告违约金12万元（350万×0.03%×107天），并支付相应利息。'
                },
                {
                    title: '案例意义',
                    content: '本案强调了房地产开发商应严格按照合同约定履行交付义务，延期交付应承担相应违约责任。对于购房者维权具有重要指导意义。'
                }
            ]
        },
        case3: {
            title: '王某与某保险公司保险合同纠纷案',
            caseNumber: '(2024)粤0106民初11111号',
            date: '2024年3月10日',
            type: '民事案件',
            sections: [
                {
                    title: '案件事实',
                    content: '原告王某于2023年投保被告公司的人身意外伤害保险，保险金额30万元。2023年12月，王某在上班途中发生交通事故受伤。向保险公司申请理赔时，保险公司以事故原因不明、不符合理赔条件为由拒绝赔付。'
                },
                {
                    title: '法院判决',
                    content: '法院经审理认为，原告提供的交通事故认定书、医疗记录等证据能够证明事故的发生及损害后果。被告保险公司未能提供充分证据证明存在免责事由，应当承担保险责任。判决被告支付保险金30万元。'
                },
                {
                    title: '案例意义',
                    content: '本案明确了保险公司在理赔过程中的举证责任，强调了保险合同的最大诚信原则。对于保险理赔纠纷的处理具有重要参考价值。'
                }
            ]
        },
        case4: {
            title: '陈某诉某银行金融借款合同纠纷案',
            caseNumber: '(2024)粤0304民初22222号',
            date: '2024年5月15日',
            type: '民事案件',
            sections: [
                {
                    title: '案件事实',
                    content: '原告陈某因经营需要向被告银行申请贷款200万元，双方签订借款合同，约定分3年还清。后因市场变化，陈某经营困难，第18个月时出现逾期。银行以此为由要求立即清偿全部债务并支付违约金。'
                },
                {
                    title: '法院判决',
                    content: '法院认定银行提前收贷缺乏合同依据，合同约定的违约情形不包括单次逾期即可要求提前还款。判决陈某按原约定继续分期还款，并支付逾期利息。'
                },
                {
                    title: '案例意义',
                    content: '本案强调了金融借款合同中违约条款的合理性，保护了借款人的合法权益，对类似金融纠纷具有指导意义。'
                }
            ]
        },
        case5: {
            title: '刘某交通肇事罪案',
            caseNumber: '(2023)浙0106刑初33333号',
            date: '2023年9月20日',
            type: '刑事案件',
            sections: [
                {
                    title: '案件事实',
                    content: '被告人刘某酒后驾驶机动车，血液酒精含量达到醉驾标准。在市区道路上高速行驶时撞死行人李某后逃逸。公安机关接报后通过监控追踪，于12小时后将其抓获。'
                },
                {
                    title: '法院判决',
                    content: '法院认定刘某构成交通肇事罪，且有酒后驾驶、逃逸等从重情节。判处有期徒刑三年，并赔偿被害人家属经济损失50万元。'
                },
                {
                    title: '案例意义',
                    content: '本案体现了对酒驾肇事逃逸行为的严厉打击，警示驾驶员要遵守交通法规，珍爱生命。'
                }
            ]
        }
    };
    
    const data = caseData[caseId];
    if (!data) {
        if (window.utils && window.utils.showToast) {
            window.utils.showToast('案例不存在', 'error');
        }
        return;
    }
    
    // 使用displayCaseDetail函数显示案例
    displayCaseDetail(data);
}

// 关闭案例详情
function closeCaseDetail() {
    const overlay = document.querySelector('.tool-modal-overlay:last-child');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// 模板预览功能相关的全局变量和函数
let templatePreviewInitialized = false;
let templatePreviewController = null;

// PDF模板映射 - 统一管理
const getPdfTemplates = () => {
    const defaultPdf = '../起诉状.pdf';
    const templateTitles = [
        // 合同类
        '劳动合同（标准版）',
        '服务合同（委托类）',
        '采购合同（货物买卖）',
        '战略合作框架协议',
        '项目外包合同',
        '租赁合同（房屋）',
        '销售代理协议',
        '技术开发合同',
        '供应商框架协议',
        '股权转让协议',
        // 纠纷类
        '民事起诉状',
        '仲裁申请书',
        '民事调解协议书',
        '执行申请书',
        '律师函模板',
        '民事答辩状',
        '财产保全申请书',
        '证据保全申请书',
        '上诉状模板',
        '劳动仲裁申请书',
        // 权益类
        '隐私权告知与授权书',
        '员工入职告知承诺书',
        '产品风险提示书',
        '个人信息撤回授权申请',
        '未成年人监护声明书',
        '免责声明书',
        '知识产权声明',
        '数据处理告知书',
        '竞业限制告知书',
        '安全责任告知书',
        // 常用类
        '授权委托书',
        '保密协议（双向）',
        '会议纪要模板',
        '对外投资决议',
        '固定资产借用单',
        '股东会决议',
        '董事会决议',
        '离职证明书',
        '收据/收条模板',
        '借条/欠条模板',
        '公司章程模板'
    ];
    return templateTitles.reduce((map, title) => {
        map[title] = defaultPdf;
        return map;
    }, { __default: defaultPdf });
};

// 创建模板预览弹窗
const createPreviewModal = () => {
    console.log('🔧 开始创建预览弹窗');
    
    try {
        const modal = document.createElement('div');
        console.log('✅ 创建div元素成功');
        
        modal.className = 'template-preview-modal';
        modal.id = 'templatePreviewModal';
        console.log('✅ 设置类名和ID成功');
        
        modal.innerHTML = `
            <div class="template-preview-container">
                <div class="template-preview-header">
                    <h3 class="template-preview-title" id="previewTitle">模板预览</h3>
                    <div class="template-preview-actions">
                        <button class="tool-modal-close" id="previewClose">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="template-preview-content">
                    <div class="template-document" id="templateDocument">
                        <!-- 文档内容将在这里动态加载 -->
                    </div>
                </div>
            </div>
        `;
        console.log('✅ 设置innerHTML成功');
        
        document.body.appendChild(modal);
        console.log('✅ 添加到body成功');
        
        // 验证元素是否真的被添加了
        const checkModal = document.getElementById('templatePreviewModal');
        console.log('✅ 验证弹窗是否存在:', checkModal ? '存在' : '不存在');
        
        return modal;
    } catch (error) {
        console.error('❌ 创建预览弹窗时出错:', error);
        return null;
    }
};

// 模板内容数据
const templateContents = {
        '劳动合同（标准版）': `
            <h1>劳动合同</h1>
            <p>甲方（用人单位）：_________________</p>
            <p>乙方（劳动者）：_________________</p>
            <p>身份证号码：_________________</p>
            
            <h2>第一条 合同期限</h2>
            <p>本合同为固定期限劳动合同，合同期限自____年____月____日起至____年____月____日止。</p>
            
            <h2>第二条 工作内容和工作地点</h2>
            <p>乙方同意根据甲方工作需要，担任_______岗位工作。</p>
            <p>工作地点：_________________</p>
            
            <h2>第三条 工作时间和休息休假</h2>
            <p>甲方安排乙方执行标准工时制度，每日工作时间不超过8小时，每周工作时间不超过40小时。</p>
            
            <h2>第四条 劳动报酬</h2>
            <p>乙方月工资为人民币_______元（税前），甲方按月支付乙方工资。</p>
            
            <h2>第五条 社会保险</h2>
            <p>甲方依法为乙方缴纳社会保险费，乙方应缴纳的社会保险费由甲方从其工资中代扣代缴。</p>
            
            <h2>第六条 劳动纪律</h2>
            <p>乙方应遵守甲方依法制定的规章制度，严格遵守劳动纪律和职业道德。</p>
            
            <h2>第七条 合同的变更、解除和终止</h2>
            <p>本合同的变更、解除和终止按《劳动合同法》等相关法律法规执行。</p>
            
            <div class="signature-area">
                <div class="signature-item">
                    <div class="signature-line"></div>
                    <p>甲方（盖章）</p>
                    <p>____年____月____日</p>
                </div>
                <div class="signature-item">
                    <div class="signature-line"></div>
                    <p>乙方（签字）</p>
                    <p>____年____月____日</p>
                </div>
            </div>
        `,
        '服务合同（委托类）': `
            <h1>服务委托合同</h1>
            <p>委托方（甲方）：_________________</p>
            <p>受托方（乙方）：_________________</p>
            
            <h2>第一条 委托事项</h2>
            <p>甲方委托乙方提供_______服务，具体内容如下：</p>
            <p>_________________________________</p>
            
            <h2>第二条 服务期限</h2>
            <p>服务期限自____年____月____日起至____年____月____日止。</p>
            
            <h2>第三条 服务费用</h2>
            <p>服务费用总计人民币_______元，支付方式：_______</p>
            
            <h2>第四条 双方权利义务</h2>
            <p>甲方应当：</p>
            <p>1. 按约定支付服务费用；</p>
            <p>2. 提供必要的配合和支持。</p>
            <p>乙方应当：</p>
            <p>1. 按约定提供专业服务；</p>
            <p>2. 保守甲方商业秘密。</p>
            
            <div class="signature-area">
                <div class="signature-item">
                    <div class="signature-line"></div>
                    <p>甲方（盖章）</p>
                    <p>____年____月____日</p>
                </div>
                <div class="signature-item">
                    <div class="signature-line"></div>
                    <p>乙方（盖章）</p>
                    <p>____年____月____日</p>
                </div>
            </div>
        `,
        '民事起诉状': `
            <h1>民事起诉状</h1>
            <p><strong>原告：</strong>_________________</p>
            <p><strong>住址：</strong>_________________</p>
            <p><strong>联系电话：</strong>_________________</p>
            
            <p><strong>被告：</strong>_________________</p>
            <p><strong>住址：</strong>_________________</p>
            <p><strong>联系电话：</strong>_________________</p>
            
            <h2>诉讼请求</h2>
            <p>1. 请求法院判令被告_________________；</p>
            <p>2. 请求法院判令被告承担本案诉讼费用。</p>
            
            <h2>事实和理由</h2>
            <p>_________________________________</p>
            <p>_________________________________</p>
            <p>综上所述，被告的行为已构成违约，应当承担相应的法律责任。为维护原告的合法权益，特向贵院提起诉讼，请求依法判决。</p>
            
            <h2>证据和证据来源</h2>
            <p>1. _________________</p>
            <p>2. _________________</p>
            
            <p>此致</p>
            <p>_______人民法院</p>
            
            <div class="signature-area">
                <div class="signature-item">
                    <div class="signature-line"></div>
                    <p>起诉人（签字）</p>
                    <p>____年____月____日</p>
                </div>
            </div>
        `
    };

// 全局模板处理函数
window.handleTemplateView = async function(templateId, fallbackName) {
    const controller = initTemplatePreview();
    const templateName = fallbackName || '模板详情';
    const openLocalPreview = () => {
        const pdfTemplates = getPdfTemplates();
        const pdfUrl = (templateName && pdfTemplates[templateName]) || pdfTemplates.__default;
        controller?.open({
            title: templateName,
            fileType: pdfUrl ? 'pdf' : undefined,
            fileUrl: pdfUrl || undefined,
            hideMeta: true
        });
    };
    
    controller?.showLoading(templateName);
    if (!templateId || !window.API?.legalTools) {
        openLocalPreview();
        return;
    }
    try {
        const [detailResp, previewResp] = await Promise.all([
            API.legalTools.getTemplateDetail(templateId),
            API.legalTools.previewTemplate(templateId)
        ]);
        const detail = detailResp?.data || {};
        const preview = previewResp?.data || {};
        controller?.open({
            id: templateId,
            title: detail.title || templateName,
            description: detail.description,
            fileType: detail.fileType,
            fileSize: detail.fileSize,
            previewUrl: preview.previewUrl || detail.previewUrl,
            fileUrl: preview.fileUrl || detail.fileUrl,
            downloadCount: detail.downloadCount
        });
    } catch (error) {
        console.error('模板预览失败', error);
        const message = error.message || '模板预览失败，请稍后重试';
        window.utils?.showToast?.(message, 'error');
        openLocalPreview();
    }
};

window.handleTemplateDownload = async function(templateId, templateName) {
    if (templateId && window.API?.legalTools?.downloadTemplate) {
        try {
            await API.legalTools.downloadTemplate(templateId, templateName || '法律模板');
            window.utils?.showToast?.('模板下载任务已开始', 'success');
            return;
        } catch (error) {
            console.error('模板下载失败', error);
            window.utils?.showToast?.('下载失败：' + (error.message || '请稍后重试') + '，将尝试示例文件。', 'error');
        }
    }
    
    const pdfTemplates = getPdfTemplates();
    if (templateName && pdfTemplates[templateName]) {
        const pdfPath = pdfTemplates[templateName];
        const a = document.createElement('a');
        a.href = pdfPath;
        a.download = `${templateName}.pdf`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
    }
    
    const content = templateContents[templateName] || `<h1>${escapeHtml(templateName || '模板')}</h1><p>示例模板内容</p>`;
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName || '法律模板'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// 初始化模板预览功能
const initTemplatePreview = () => {
    if (templatePreviewInitialized && templatePreviewController) {
        return templatePreviewController;
    }
    if (!templatePreviewInitialized) {
        templatePreviewInitialized = true;
    }
    
    let modal = document.getElementById('templatePreviewModal');
    if (!modal) {
        modal = createPreviewModal();
    }
    const titleEl = modal.querySelector('#previewTitle');
    const contentEl = modal.querySelector('#templateDocument');
    const closeBtn = modal.querySelector('#previewClose');
    
    const closePreview = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    const showLoading = (message = '正在加载模板...') => {
        if (!contentEl) return;
        contentEl.innerHTML = `
            <div class="template-loading is-inline">
                <span class="loading-spinner small"></span>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    const showError = (message = '模板预览失败') => {
        if (!contentEl) return;
        contentEl.innerHTML = `
            <div class="template-error">
                <i class="fas fa-triangle-exclamation"></i>
                <p>${escapeHtml(message)}</p>
                <button class="btn btn-primary" id="templatePreviewRetry">重新加载</button>
            </div>
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        contentEl.querySelector('#templatePreviewRetry')?.addEventListener('click', closePreview, { once: true });
    };
    
    const renderPreviewBody = (data) => {
        const shouldShowMeta = !data.hideMeta;
        const meta = shouldShowMeta ? `
            <div class="template-preview-meta">
                <span><i class="fas fa-file"></i>${(data.fileType || 'PDF').toUpperCase()}</span>
                <span><i class="fas fa-database"></i>${formatFileSize(data.fileSize)}</span>
                ${Number.isFinite(data.downloadCount) ? `<span><i class="fas fa-download"></i>${data.downloadCount} 次下载</span>` : ''}
            </div>
            ${data.description ? `<p class="template-preview-desc">${escapeHtml(data.description)}</p>` : ''}
        ` : '';
        if (data.fileUrl && ((data.fileType || '').toLowerCase() === 'pdf' || data.fileUrl.endsWith('.pdf'))) {
            return `
                ${meta}
                <div class="pdf-container">
                    <iframe src="${data.fileUrl}#toolbar=1&navpanes=1&scrollbar=1" width="100%" height="100%" style="border: none;" type="application/pdf"></iframe>
                </div>
            `;
        }
        if (data.fileUrl) {
            return `
                ${meta}
                <div class="template-preview-fallback">
                    <i class="fas fa-file-arrow-down"></i>
                    <p>该模板为 ${escapeHtml((data.fileType || '').toUpperCase())} 格式，暂不支持在线预览。</p>
                    <a class="btn btn-primary" href="${data.fileUrl}" target="_blank">下载并在本地查看</a>
                </div>
            `;
        }
        if (data.title && templateContents[data.title]) {
            return `${meta}${templateContents[data.title]}`;
        }
        return `
            ${meta}
            <div class="template-preview-fallback">
                <p>暂未提供该模板的在线预览内容，请尝试下载查看。</p>
            </div>
        `;
    };
    
    const open = (data) => {
        if (!contentEl || !titleEl) return;
        titleEl.textContent = data.title || '模板详情';
        contentEl.innerHTML = renderPreviewBody(data);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    modal.addEventListener('click', (event) => {
        if (event.target.id === 'templatePreviewModal') {
            closePreview();
        }
    });
    closeBtn?.addEventListener('click', closePreview);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closePreview();
        }
    });
    
    templatePreviewController = {
        open,
        close: closePreview,
        showLoading,
        showError
    };
    window.showTemplatePreview = open;
    return templatePreviewController;
};

// 全局测试函数
window.testTemplatePreview = function() {
    console.log('=== 测试模板预览功能 ===');
    
    // 检查模板按钮
    const templateButtons = document.querySelectorAll('.template-btn');
    console.log('找到的所有模板按钮:', templateButtons.length);
    
    const viewButtons = document.querySelectorAll('.template-btn[data-action="view"]');
    console.log('找到的查看按钮:', viewButtons.length);
    
    if (viewButtons.length > 0) {
        console.log('第一个查看按钮:', viewButtons[0]);
        console.log('按钮数据:', viewButtons[0].dataset);
        console.log('按钮onclick:', viewButtons[0].onclick);
        
        // 模拟点击第一个查看按钮
        console.log('模拟点击第一个查看按钮');
        viewButtons[0].click();
    }
    
    // 检查预览弹窗
    const modal = document.getElementById('templatePreviewModal');
    console.log('预览弹窗元素:', modal);
    
    // 直接调用函数测试
    console.log('直接调用handleTemplateView函数');
    window.handleTemplateView('template_001', '民事起诉状');
    
    console.log('=== 测试完成 ===');
};

// 简单测试函数
window.quickTest = function() {
    console.log('快速测试 - 直接调用查看函数');
    window.handleTemplateView('template_001', '民事起诉状');
};

// 检查按钮状态
window.checkButtons = function() {
    console.log('=== 检查按钮状态 ===');
    const viewButtons = document.querySelectorAll('.template-btn[data-action="view"]');
    console.log('查看按钮数量:', viewButtons.length);
    
    if (viewButtons.length > 0) {
        const firstBtn = viewButtons[0];
        console.log('第一个按钮HTML:', firstBtn.outerHTML);
        console.log('按钮onclick属性:', firstBtn.getAttribute('onclick'));
        console.log('按钮事件监听器数量:', firstBtn.onclick ? '有onclick' : '无onclick');
        
        // 尝试手动触发onclick
        if (firstBtn.onclick) {
            console.log('手动触发onclick');
            firstBtn.onclick();
        } else {
            console.log('没有onclick属性，尝试click()');
            firstBtn.click();
        }
    }
};

// 检查弹窗状态
window.checkModal = function() {
    console.log('=== 检查弹窗状态 ===');
    const modal = document.getElementById('templatePreviewModal');
    console.log('弹窗元素:', modal);
    
    if (modal) {
        console.log('弹窗类名:', modal.className);
        console.log('弹窗样式display:', getComputedStyle(modal).display);
        console.log('弹窗样式z-index:', getComputedStyle(modal).zIndex);
        console.log('弹窗样式position:', getComputedStyle(modal).position);
        console.log('弹窗是否有active类:', modal.classList.contains('active'));
        
        // 强制显示弹窗
        console.log('强制显示弹窗');
        modal.style.display = 'flex';
        modal.style.zIndex = '99999';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0, 0, 0, 0.9)';
    } else {
        console.log('弹窗元素不存在');
    }
};

// 检查按钮事件绑定状态
window.checkButtonEvents = function() {
    console.log('=== 检查按钮事件绑定状态 ===');
    const viewButtons = document.querySelectorAll('.template-btn[data-action="view"]');
    console.log('查看按钮数量:', viewButtons.length);
    
    viewButtons.forEach((btn, index) => {
        console.log(`按钮 ${index + 1}:`);
        console.log('  - 模板名称:', btn.dataset.template);
        console.log('  - 是否有事件处理器:', btn._templateViewHandler ? '有' : '无');
        console.log('  - 按钮元素:', btn);
        
        if (index === 0) {
            console.log('🧪 测试第一个按钮的点击事件');
            btn.click();
        }
    });
};

// 测试鼠标点击模拟
window.testMouseClick = function() {
    console.log('=== 测试鼠标点击模拟 ===');
    const viewButtons = document.querySelectorAll('.template-btn[data-action="view"]');
    
    if (viewButtons.length > 0) {
        const firstBtn = viewButtons[0];
        console.log('模拟鼠标点击第一个按钮:', firstBtn.dataset.template);
        
        // 创建鼠标点击事件
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        console.log('派发鼠标点击事件');
        firstBtn.dispatchEvent(clickEvent);
    }
};

// 检查按钮可点击性
window.checkClickability = function() {
    console.log('=== 检查按钮可点击性 ===');
    const viewButtons = document.querySelectorAll('.template-btn[data-action="view"]');
    
    if (viewButtons.length > 0) {
        const firstBtn = viewButtons[0];
        const computedStyle = getComputedStyle(firstBtn);
        
        console.log('第一个按钮样式检查:');
        console.log('  - pointer-events:', computedStyle.pointerEvents);
        console.log('  - z-index:', computedStyle.zIndex);
        console.log('  - position:', computedStyle.position);
        console.log('  - cursor:', computedStyle.cursor);
        console.log('  - display:', computedStyle.display);
        
        // 检查父容器
        const parentItem = firstBtn.closest('.template-item');
        if (parentItem) {
            const parentStyle = getComputedStyle(parentItem);
            const beforeStyle = getComputedStyle(parentItem, '::before');
            
            console.log('父容器样式:');
            console.log('  - position:', parentStyle.position);
            console.log('  - z-index:', parentStyle.zIndex);
            console.log('伪元素样式:');
            console.log('  - pointer-events:', beforeStyle.pointerEvents);
        }
    }
};

// 测试所有模板PDF映射
window.testAllTemplates = function() {
    console.log('=== 测试所有模板PDF映射 ===');
    const pdfTemplates = getPdfTemplates();
    const templateNames = Object.keys(pdfTemplates);
    
    console.log('PDF模板总数:', templateNames.length);
    console.log('所有PDF模板映射:');
    
    templateNames.forEach((name, index) => {
        console.log(`${index + 1}. ${name} → ${pdfTemplates[name]}`);
    });
    
    // 测试第一个模板的预览
    if (templateNames.length > 0) {
        const firstTemplate = templateNames[0];
        console.log(`\n🧪 测试预览第一个模板: ${firstTemplate}`);
        window.handleTemplateView('template_001', firstTemplate);
    }
};

// 修复PDF显示问题的测试函数
window.fixPdfDisplay = function() {
    console.log('=== 修复PDF显示问题 ===');
    
    // 1. 检查PDF文件是否存在
    const pdfPath = '起诉状.pdf';
    console.log('检查PDF文件:', pdfPath);
    
    // 2. 创建一个测试弹窗
    const testModal = document.createElement('div');
    testModal.className = 'template-preview-modal active';
    testModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    testModal.innerHTML = `
        <div class="template-preview-container" style="
            position: relative;
            width: 90%;
            max-width: 900px;
            height: 85vh;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
            border-radius: 16px;
            border: 1px solid rgba(203, 213, 225, 0.6);
            box-shadow: 0 32px 64px -24px rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(16px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        ">
            <div class="template-preview-header" style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px;
                border-bottom: 1px solid rgba(203, 213, 225, 0.4);
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8));
            ">
                <h3 class="template-preview-title" style="
                    font-size: 18px;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                ">PDF测试预览 - 起诉状.pdf</h3>
                <div class="template-preview-actions" style="display: flex; gap: 8px;">
                    <button class="template-preview-btn close" onclick="this.closest('.template-preview-modal').remove()" style="
                        appearance: none;
                        border: none;
                        border-radius: 8px;
                        padding: 8px 16px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        background: rgba(239, 68, 68, 0.1);
                        color: #dc2626;
                        border: 1px solid rgba(239, 68, 68, 0.2);
                    ">关闭</button>
                </div>
            </div>
            <div class="template-preview-content" style="
                flex: 1;
                overflow-y: auto;
                padding: 0;
                background: #ffffff;
            ">
                <div class="template-document" style="
                    width: 100%;
                    min-height: 100%;
                    background: #ffffff;
                    padding: 20px;
                    font-family: 'Microsoft YaHei', 'SimSun', serif;
                    font-size: 14px;
                    line-height: 1.8;
                    color: #1f2937;
                ">
                    <div class="pdf-container" style="width: 100%; height: 100%; padding: 0; margin: 0;">
                        <iframe 
                            src="${pdfPath}#toolbar=1&navpanes=1&scrollbar=1" 
                            width="100%" 
                            height="600px" 
                            style="border: none; border-radius: 8px; box-shadow: 0 4px 12px -4px rgba(15, 23, 42, 0.1);"
                            type="application/pdf">
                        </iframe>
                        <div style="text-align: center; padding: 20px; display: none;" id="pdfFallback">
                            <h2>PDF预览不可用</h2>
                            <p>您的浏览器不支持PDF预览。</p>
                            <a href="${pdfPath}" target="_blank" style="color: #4b5563; text-decoration: underline;">点击这里下载PDF文件</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(testModal);
    console.log('✅ 测试弹窗已创建并显示');
    
    // 检查PDF加载状态
    const iframe = testModal.querySelector('iframe');
    const fallback = testModal.getElementById('pdfFallback');
    
    iframe.onload = function() {
        console.log('✅ PDF加载成功');
    };
    
    iframe.onerror = function() {
        console.log('❌ PDF加载失败，显示备用内容');
        iframe.style.display = 'none';
        if (fallback) fallback.style.display = 'block';
    };
    
    // 设置超时检查
    setTimeout(() => {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!iframeDoc || !iframeDoc.body) {
                console.log('⚠️ PDF加载超时，显示备用内容');
                iframe.style.display = 'none';
                if (fallback) fallback.style.display = 'block';
            }
        } catch (e) {
            console.log('📄 PDF正在加载中（跨域限制是正常的）');
        }
    }, 3000);
};

// 自定义下拉框功能
function initCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(select => {
        if (select.dataset.enhanced === 'true') return;
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelector('.select-options');
        const valueSpan = select.querySelector('.select-value');
        select.dataset.currentValue = select.dataset.currentValue || '';
        
        trigger?.addEventListener('click', (event) => {
            event.stopPropagation();
            document.querySelectorAll('.custom-select').forEach(other => {
                if (other !== select) {
                    other.classList.remove('active');
                }
            });
            select.classList.toggle('active');
        });
        
        options?.addEventListener('click', (event) => {
            const option = event.target.closest('.select-option');
            if (!option) return;
            event.stopPropagation();
            const value = option.getAttribute('data-value') || '';
            valueSpan.textContent = option.textContent;
            select.dataset.currentValue = value;
            select.classList.remove('active');
            filterCases();
        });
        
        select.dataset.enhanced = 'true';
    });
    
    if (!document.body.dataset.customSelectBound) {
        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-select').forEach(select => {
                select.classList.remove('active');
            });
        });
        document.body.dataset.customSelectBound = 'true';
    }
}

// 获取自定义下拉框的值（显示文本）
function getCustomSelectValue(name) {
    const select = document.querySelector(`.custom-select[data-name="${name}"]`);
    if (select) {
        return select.querySelector('.select-value')?.textContent || '';
    }
    return '';
}

