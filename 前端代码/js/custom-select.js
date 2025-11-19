// 自定义下拉框功能
function initCustomSelects() {
    const customSelects = document.querySelectorAll('.custom-select');
    
    customSelects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelector('.select-options');
        const optionItems = select.querySelectorAll('.select-option');
        const valueSpan = select.querySelector('.select-value');
        
        // 点击触发器
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // 关闭其他下拉框
            document.querySelectorAll('.custom-select').forEach(s => {
                if (s !== select) {
                    s.classList.remove('active');
                }
            });
            select.classList.toggle('active');
        });
        
        // 选择选项
        optionItems.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.getAttribute('data-value');
                valueSpan.textContent = value;
                select.classList.remove('active');
                
                // 触发筛选
                filterCases();
            });
        });
    });
    
    // 点击外部关闭
    document.addEventListener('click', () => {
        customSelects.forEach(select => {
            select.classList.remove('active');
        });
    });
}

// 获取自定义下拉框的值
function getCustomSelectValue(name) {
    const select = document.querySelector(`.custom-select[data-name="${name}"]`);
    if (select) {
        return select.querySelector('.select-value').textContent;
    }
    return '';
}
