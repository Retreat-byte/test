// ========================================
// 情绪岛 - 主 JavaScript 文件
// ========================================

// ========================================
// 全局变量
// ========================================
let currentPage = 'home';
let moodData = JSON.parse(localStorage.getItem('moodData')) || [];
let breathingTimer = null;
let breathingState = 'idle';

// ========================================
// 页面导航 - 已改为多页面应用，不需要JS切换
// ========================================
function initNavigation() {
    // 多页面应用，直接使用浏览器原生导航
    // 不需要阻止默认行为
    console.log('导航已启用（多页面模式）');
}

// ========================================
// 心情打卡功能
// ========================================
let selectedMoodData = null; // 临时存储选中的心情数据

function initMoodCheckin() {
    // 支持旧的和新的心情卡片
    const moodItems = document.querySelectorAll('.mood-item, .mood-item-new');
    const moodModal = document.getElementById('moodConfirmModal');
    
    // 如果心情打卡元素不存在，直接返回
    if (moodItems.length === 0 || !moodModal) {
        console.log('心情打卡元素未找到，跳过初始化');
        return;
    }
    
    const closeMoodModal = document.getElementById('closeMoodModal');
    const cancelMoodBtn = document.getElementById('cancelMoodBtn');
    const confirmMoodBtn = document.getElementById('confirmMoodBtn');
    const confirmMoodImg = document.getElementById('confirmMoodImg');
    const confirmMoodName = document.getElementById('confirmMoodName');
    
    moodItems.forEach(item => {
        item.addEventListener('click', () => {
            // 检查登录状态，未登录时不显示心情确认框
            if (!checkAuth()) {
                showAuthModal();
                return;
            }
            
            // 获取心情数据
            const mood = item.dataset.mood;
            const value = parseInt(item.dataset.value);
            const imgSrc = item.querySelector('.mood-svg')?.src || '';
            
            // 临时选中状态（视觉反馈）
            moodItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            
            // 存储选中的心情数据
            selectedMoodData = { mood, value, element: item };
            
            // 显示确认模态框
            if (moodModal && confirmMoodImg && confirmMoodName) {
                confirmMoodImg.src = imgSrc;
                confirmMoodImg.alt = mood;
                confirmMoodName.textContent = mood;
                moodModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // 关闭模态框
    function closeMoodConfirmModal() {
        if (moodModal) {
            moodModal.classList.remove('active');
            document.body.style.overflow = '';
            // 移除临时选中状态
            if (selectedMoodData) {
                moodItems.forEach(i => i.classList.remove('selected'));
                // 恢复今日已打卡的状态
                loadTodayMood();
            }
            selectedMoodData = null;
        }
    }
    
    // 点击关闭按钮
    if (closeMoodModal) {
        closeMoodModal.addEventListener('click', closeMoodConfirmModal);
    }
    
    // 点击取消按钮
    if (cancelMoodBtn) {
        cancelMoodBtn.addEventListener('click', closeMoodConfirmModal);
    }
    
    // 点击背景关闭
    if (moodModal) {
        moodModal.addEventListener('click', (e) => {
            if (e.target === moodModal) {
                closeMoodConfirmModal();
            }
        });
    }
    
    // 确认打卡
    if (confirmMoodBtn) {
        confirmMoodBtn.addEventListener('click', async () => {
            if (!selectedMoodData) return;
            
            const { mood, value } = selectedMoodData;
            
            // 禁用按钮防止重复提交
            confirmMoodBtn.disabled = true;
            confirmMoodBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
            
            try {
                // 调用心情打卡API
                const result = await MoodAPI.checkinMood({
                    mood: mood,
                    value: value,
                    note: '' // 可以后续添加备注功能
                });
                
                if (result.success) {
                    // 关闭模态框
                    closeMoodConfirmModal();
                    
                    // 显示成功提示（包括连续打卡天数）
                    const streakText = result.data?.streak ? `已连续打卡 ${result.data.streak} 天！` : '';
                    showNotification(`✅ 打卡成功！今天的心情是：${mood} ${streakText}`, 'success');
                    
                    // 更新本地moodData数组（保持兼容性）
                    const today = new Date().toISOString().split('T')[0];
                    const existingIndex = moodData.findIndex(entry => entry.date === today);
                    if (existingIndex >= 0) {
                        moodData[existingIndex] = { date: today, mood, value };
                    } else {
                        moodData.push({ date: today, mood, value });
                    }
                    
                    // 更新图表（如果在个人中心页面）
                    if (currentPage === 'profile') {
                        updateEmotionChart();
                    }
                    
                    // 保持选中状态
                    loadTodayMood();
                } else {
                    // 显示错误提示
                    showNotification('❌ ' + (result.message || '打卡失败，请重试'), 'error');
                }
            } catch (error) {
                console.error('打卡异常:', error);
                showNotification('❌ 打卡失败，请检查网络连接', 'error');
            } finally {
                // 恢复按钮状态
                confirmMoodBtn.disabled = false;
                confirmMoodBtn.innerHTML = '<i class="fas fa-check-circle"></i> 确认打卡';
            }
        });
    }
    
    // 加载今天的打卡状态
    loadTodayMood();
}

// 加载今天的心情打卡状态
async function loadTodayMood() {
    try {
        // 尝试从API获取今日打卡状态
        const result = await MoodAPI.getTodayCheckin();
        let todayMood = null;
        
        if (result.success && result.data?.hasCheckedIn) {
            todayMood = result.data.moodData;
        }
        
        // 如果API失败，回退到localStorage
        if (!todayMood) {
            const today = new Date().toISOString().split('T')[0];
            todayMood = moodData.find(entry => entry.date === today);
        }
        
        const moodItems = document.querySelectorAll('.mood-item, .mood-item-new');
    
        moodItems.forEach(item => {
            item.classList.remove('selected');
            if (todayMood && item.dataset.mood === todayMood.mood) {
                item.classList.add('selected');
            }
        });
    } catch (error) {
        console.error('加载今日打卡状态错误:', error);
        // 发生错误时仍然显示本地数据
        const today = new Date().toISOString().split('T')[0];
        const todayMood = moodData.find(entry => entry.date === today);
        const moodItems = document.querySelectorAll('.mood-item, .mood-item-new');
        
        moodItems.forEach(item => {
            item.classList.remove('selected');
            if (todayMood && item.dataset.mood === todayMood.mood) {
                item.classList.add('selected');
            }
        });
    }
}

// ========================================
// AI 对话功能
// ========================================
function initAIChat() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');
    
    // 如果聊天元素不存在，直接返回（比如在 profile.html 页面）
    if (!chatInput || !sendButton || !chatMessages) {
        console.log('聊天功能元素未找到，跳过初始化');
        return;
    }
    
    // 发送消息函数
    function sendMessage(message) {
        if (!message.trim()) return;
        
        // 显示用户消息
        addMessage(message, 'user');
        
        // 清空输入框
        chatInput.value = '';
        
        // 模拟 AI 回复
        setTimeout(() => {
            const aiResponse = generateAIResponse(message);
            addMessage(aiResponse, 'ai');
        }, 1000);
    }
    
    // 添加消息到聊天框
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'ai' ? '<img src="img/ai.png" alt="AI助手">' : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>${text}</p>`;
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messageDiv.appendChild(time);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 生成 AI 回复（模拟）
    function generateAIResponse(userMessage) {
        const responses = {
            '压力': '我理解你现在感到压力很大。压力是生活中常见的情绪反应。要不要试试我们的正念呼吸练习？它能帮助你快速放松下来。',
            '焦虑': '感到焦虑是很正常的。让我陪你聊聊，是什么让你感到焦虑呢？同时，我建议你可以尝试冥想练习，这对缓解焦虑很有帮助。',
            '放松': '好的，让我们一起放松一下。我推荐你试试"森林冥想"音频，或者做几分钟深呼吸练习。你更喜欢哪一种呢？',
            '测评': '我们有专业的心理测评工具，包括抑郁症筛查量表(PHQ-9)、焦虑症筛查量表(GAD-7)和压力感知量表。你想做哪一个呢？'
        };
        
        for (let key in responses) {
            if (userMessage.includes(key)) {
                return responses[key];
            }
        }
        
        return '我在认真倾听你说的话。能详细说说你的感受吗？我会一直陪伴在你身边。';
    }
    
    // 发送按钮事件
    sendButton.addEventListener('click', () => {
        sendMessage(chatInput.value);
    });
    
    // 回车发送
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(chatInput.value);
        }
    });
    
    // 快捷回复按钮
    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sendMessage(btn.textContent);
        });
    });
    
    // 表情选择器功能
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiItems = document.querySelectorAll('.emoji-item');
    
    if (emojiBtn && emojiPicker) {
        // 切换表情选择器显示/隐藏
        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
        });
        
        // 点击表情插入到输入框
        emojiItems.forEach(item => {
            item.addEventListener('click', () => {
                const emoji = item.textContent;
                chatInput.value += emoji;
                chatInput.focus();
                emojiPicker.style.display = 'none';
            });
        });
        
        // 点击其他地方关闭表情选择器
        document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
                emojiPicker.style.display = 'none';
            }
        });
    }
    
    // 语音输入功能
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (voiceBtn) {
        let isRecording = false;
        let recognition = null;
        
        // 检查浏览器是否支持语音识别
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = 'zh-CN';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                chatInput.value += transcript;
                isRecording = false;
                voiceBtn.classList.remove('recording');
            };
            
            recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                isRecording = false;
                voiceBtn.classList.remove('recording');
                if (event.error === 'no-speech') {
                    showNotification('未检测到语音，请重试', 'info');
                } else {
                    showNotification('语音识别失败，请重试', 'error');
                }
            };
            
            recognition.onend = () => {
                isRecording = false;
                voiceBtn.classList.remove('recording');
            };
            
            voiceBtn.addEventListener('click', () => {
                if (isRecording) {
                    recognition.stop();
                    isRecording = false;
                    voiceBtn.classList.remove('recording');
                } else {
                    recognition.start();
                    isRecording = true;
                    voiceBtn.classList.add('recording');
                    showNotification('开始录音...', 'info');
                }
            });
        } else {
            // 浏览器不支持语音识别
            voiceBtn.addEventListener('click', () => {
                showNotification('您的浏览器不支持语音输入功能', 'error');
            });
        }
    }
}

// ========================================
// 快捷练习卡片点击
// ========================================
function initPracticeCards() {
    // 多页面应用，使用onclick跳转，已在HTML中定义
    // 不需要JS处理
    console.log('快捷练习卡片已启用');
}

// ========================================
// 正念呼吸练习
// ========================================
function initBreathingExercise() {
    const startBtn = document.getElementById('startBreathing');
    const stopBtn = document.getElementById('stopBreathing');
    const breathingCircle = document.getElementById('breathingCircle');
    
    // 如果呼吸练习元素不存在，直接返回
    if (!startBtn || !stopBtn || !breathingCircle) {
        console.log('呼吸练习元素未找到，跳过初始化');
        return;
    }
    
    const breathingText = breathingCircle.querySelector('.breathing-text');
    const breathingInstruction = document.getElementById('breathingInstruction');
    const inhaleSlider = document.getElementById('inhaleSlider');
    const exhaleSlider = document.getElementById('exhaleSlider');
    const inhaleTimeSpan = document.getElementById('inhaleTime');
    const exhaleTimeSpan = document.getElementById('exhaleTime');
    
    let inhaleTime = 4;
    let exhaleTime = 6;
    let cycleCount = 0;
    
    // 滑块事件
    inhaleSlider.addEventListener('input', (e) => {
        inhaleTime = parseInt(e.target.value);
        inhaleTimeSpan.textContent = inhaleTime;
    });
    
    exhaleSlider.addEventListener('input', (e) => {
        exhaleTime = parseInt(e.target.value);
        exhaleTimeSpan.textContent = exhaleTime;
    });
    
    // 开始练习
    startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
        breathingState = 'running';
        cycleCount = 0;
        
        breathingCycle();
    });
    
    // 停止练习
    stopBtn.addEventListener('click', () => {
        stopBreathing();
    });
    
    function breathingCycle() {
        if (breathingState !== 'running') return;
        
        // 吸气阶段
        breathingText.textContent = '吸气';
        breathingInstruction.textContent = `慢慢吸气 ${inhaleTime} 秒...`;
        breathingCircle.classList.remove('exhale');
        breathingCircle.classList.add('inhale');
        breathingCircle.style.transition = `transform ${inhaleTime}s ease-in-out`;
        
        setTimeout(() => {
            if (breathingState !== 'running') return;
            
            // 屏息
            breathingText.textContent = '保持';
            breathingInstruction.textContent = '保持 2 秒...';
            
            setTimeout(() => {
                if (breathingState !== 'running') return;
                
                // 呼气阶段
                breathingText.textContent = '呼气';
                breathingInstruction.textContent = `慢慢呼气 ${exhaleTime} 秒...`;
                breathingCircle.classList.remove('inhale');
                breathingCircle.classList.add('exhale');
                breathingCircle.style.transition = `transform ${exhaleTime}s ease-in-out`;
                
                setTimeout(() => {
                    if (breathingState !== 'running') return;
                    
                    cycleCount++;
                    
                    // 继续下一个循环
                    setTimeout(() => breathingCycle(), 1000);
                }, exhaleTime * 1000);
            }, 2000);
        }, inhaleTime * 1000);
    }
    
    function stopBreathing() {
        breathingState = 'idle';
        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
        breathingCircle.classList.remove('inhale', 'exhale');
        breathingText.textContent = '准备开始';
        breathingInstruction.textContent = '点击开始按钮进行呼吸练习';
        
        showNotification(`✅ 完成 ${cycleCount} 个呼吸循环！`, 'success');
        
        // 保存练习记录
        savePracticeRecord('正念呼吸', cycleCount * (inhaleTime + exhaleTime + 2));
    }
}

// ========================================
// 冥想音频播放
// ========================================
function initMeditation() {
    const playBtns = document.querySelectorAll('.btn-play-small');
    const meditationModal = document.getElementById('meditationModal');
    const closeMeditationModal = document.getElementById('closeMeditationModal');
    const meditationPlayerTitle = document.getElementById('meditationPlayerTitle');
    const meditationPlayerIcon = document.getElementById('meditationPlayerIcon');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const progressSlider = document.getElementById('progressSlider');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    
    // 如果冥想播放按钮不存在，直接返回
    if (playBtns.length === 0) {
        console.log('冥想练习元素未找到，跳过初始化');
        return;
    }
    
    // 创建音频对象
    let audio = new Audio();
    let isPlaying = false;
    
    // 冥想卡片数据
    const meditationData = {
        '晨间冥想': { icon: 'fa-cloud', duration: 300, subtitle: '让心灵在宁静中苏醒' },
        '森林冥想': { icon: 'fa-tree', duration: 600, subtitle: '聆听自然的呼吸' },
        '海浪冥想': { icon: 'fa-water', duration: 900, subtitle: '与海浪共舞，释放压力' },
        '睡前冥想': { icon: 'fa-moon', duration: 1200, subtitle: '在宁静中进入梦乡' },
        '山野冥想': { icon: 'fa-mountain', duration: 720, subtitle: '感受山野的静谧' },
        '放松冥想': { icon: 'fa-spa', duration: 480, subtitle: '深度放松身心' },
        '星空冥想': { icon: 'fa-star', duration: 1080, subtitle: '仰望星空，放空思绪' },
        '自然冥想': { icon: 'fa-leaf', duration: 900, subtitle: '回归自然本源' }
    };
    
    // 格式化时间
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 更新进度
    function updateProgress() {
        if (!audio.duration) return;
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = progress + '%';
        progressSlider.value = progress;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
    
    // 播放/暂停
    function togglePlay() {
        const icon = btnPlayPause.querySelector('i');
        
        if (audio.paused) {
            audio.play();
            isPlaying = true;
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            audio.pause();
            isPlaying = false;
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    }
    
    // 重置播放器
    function resetPlayer() {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        const icon = btnPlayPause.querySelector('i');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        progressFill.style.width = '0%';
        progressSlider.value = 0;
        currentTimeEl.textContent = '00:00';
    }
    
    // 音频事件监听
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });
    
    audio.addEventListener('timeupdate', updateProgress);
    
    audio.addEventListener('ended', () => {
        isPlaying = false;
        const icon = btnPlayPause.querySelector('i');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        audio.currentTime = 0;
        updateProgress();
    });
    
    // 点击冥想卡片
    playBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.meditation-card-small');
            const title = card.querySelector('h3').textContent;
            const audioSrc = card.dataset.audio;
            const data = meditationData[title];
            
            if (data && audioSrc) {
                // 设置标题和图标
                meditationPlayerTitle.textContent = title;
                meditationPlayerIcon.innerHTML = `<i class="fas ${data.icon}"></i>`;
                document.querySelector('.meditation-player-subtitle').textContent = data.subtitle;
                
                // 重置播放器
                resetPlayer();
                
                // 加载音频
                audio.src = audioSrc;
                audio.load();
                
                // 显示模态框
                meditationModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // 关闭模态框
    if (closeMeditationModal && meditationModal) {
        closeMeditationModal.addEventListener('click', (e) => {
            e.stopPropagation();
            meditationModal.classList.remove('active');
            document.body.style.overflow = '';
            resetPlayer();
        });
        
        // 点击背景关闭
        meditationModal.addEventListener('click', (e) => {
            if (e.target === meditationModal) {
                meditationModal.classList.remove('active');
                document.body.style.overflow = '';
                resetPlayer();
            }
        });
    }
    
    // 播放/暂停按钮
    btnPlayPause?.addEventListener('click', togglePlay);
    
    // 进度条拖动
    progressSlider?.addEventListener('input', (e) => {
        const value = e.target.value;
        if (audio.duration) {
            audio.currentTime = (value / 100) * audio.duration;
        }
    });
    
    // 快退10秒
    document.getElementById('btnBackward')?.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
    
    // 快进10秒
    document.getElementById('btnForward')?.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });
    
    console.log('✅ 冥想音频已初始化（支持真实音频播放）');
}

// ========================================
// 心理测评
// ========================================
function initAssessment() {
    const testBtns = document.querySelectorAll('.btn-test, .btn-start');
    const testItems = document.querySelectorAll('.assessment-item-compact');
    
    // 如果测评按钮不存在，直接返回
    if (testBtns.length === 0 && testItems.length === 0) {
        console.log('心理测评元素未找到，跳过初始化');
        return;
    }
    
    testBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.assessment-card, .test-item');
            const title = card.querySelector('h3').textContent;
            
            showNotification(`📋 即将开始：${title}`, 'info');
            
            // 这里可以跳转到实际的测评页面
            // 暂时只显示提示
        });
    });
    
    // 紧凑型测评项点击已通过onclick跳转
}

// ========================================
// 情绪图表
// ========================================
function updateEmotionChart() {
    const canvas = document.getElementById('emotionChart');
    if (!canvas) return;
    
    // 检查是否已加载 Chart.js
    if (typeof Chart === 'undefined') {
        console.error('Chart.js 未加载');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 获取最近7天或30天的数据
    const period = document.querySelector('.tab-btn.active')?.dataset.period || 'week';
    const days = period === 'week' ? 7 : 30;
    
    // 生成日期标签和数据
    const labels = [];
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (period === 'week') {
            labels.push((date.getMonth() + 1) + '/' + date.getDate());
        } else {
            // 月视图只显示日期
            labels.push(date.getDate() + '日');
        }
        
        const moodEntry = moodData.find(entry => entry.date === dateStr);
        data.push(moodEntry ? moodEntry.value : null);
    }
    
    // 销毁旧图表
    if (window.emotionChart) {
        window.emotionChart.destroy();
    }
    
    // 创建新图表
    window.emotionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '心情指数',
                data: data,
                borderColor: '#4A90E2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: period === 'week' ? 6 : 4,
                pointHoverRadius: period === 'week' ? 8 : 6,
                pointBackgroundColor: '#4A90E2',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            if (context.parsed.y === null) {
                                return '心情: 未打卡';
                            }
                            const moodLabels = ['', '悲伤', '难过', '平静', '微笑', '开心'];
                            return '心情: ' + (moodLabels[context.parsed.y] || '未打卡');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    min: 0,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            const labels = ['', '😢', '😟', '😌', '😊', '😄'];
                            return labels[value] || '';
                        },
                        font: {
                            size: 16
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: period === 'month' ? 45 : 0,
                        minRotation: period === 'month' ? 45 : 0
                    }
                }
            }
        }
    });
}

// ========================================
// 图表标签切换
// ========================================
function initChartTabs() {
    const tabBtns = document.querySelectorAll('.chart-tabs .tab-btn');
    
    if (tabBtns.length === 0) return;
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateEmotionChart();
        });
    });
}

// ========================================
// 历史记录标签切换
// ========================================
function initHistoryTabs() {
    const historyTabs = document.querySelectorAll('.history-tab');
    const practiceHistory = document.getElementById('practiceHistory');
    const assessmentHistory = document.getElementById('assessmentHistory');
    
    console.log('🔍 初始化历史标签:');
    console.log('- 找到的标签数量:', historyTabs.length);
    console.log('- 练习历史元素:', practiceHistory ? '✅' : '❌');
    console.log('- 测评报告元素:', assessmentHistory ? '✅' : '❌');
    
    if (!historyTabs.length || !practiceHistory || !assessmentHistory) {
        console.log('❌ 历史标签元素未找到');
        return;
    }
    
    historyTabs.forEach((tab, index) => {
        console.log(`标签 ${index + 1}:`, tab.textContent, 'data-type:', tab.dataset.type);
        
        tab.addEventListener('click', (e) => {
            console.log('🖱️ 点击了标签:', tab.dataset.type, '按钮文本:', tab.textContent);
            e.preventDefault();
            e.stopPropagation();
            
            historyTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.type === 'practice') {
                practiceHistory.style.display = 'flex';
                assessmentHistory.style.display = 'none';
                console.log('✅ 显示练习历史，隐藏测评报告');
            } else {
                practiceHistory.style.display = 'none';
                assessmentHistory.style.display = 'flex';
                console.log('✅ 显示测评报告，隐藏练习历史');
            }
        });
    });
    
    // 设置初始状态：显示练习历史，隐藏测评报告
    practiceHistory.style.display = 'flex';
    assessmentHistory.style.display = 'none';
    console.log('✅ 初始状态设置完成：练习历史显示，测评报告隐藏');
    
    // 初始化查看报告按钮事件（已移到 profile.html 中处理）
    const initViewButtons = () => {
        // 不再拦截 .btn-view 按钮，报告功能已在 profile.html 中实现
        console.log('✅ 查看报告按钮功能已在 profile.html 中实现');
    };
    
    // 初始化按钮
    setTimeout(initViewButtons, 100);
    
    console.log('✅ 历史标签切换已初始化，初始状态：显示练习历史');
}

// ========================================
// 浮动 AI 按钮（可拖动）
// ========================================
function initFloatingAI() {
    const floatingBtn = document.getElementById('floatingAIBtn');
    const startAIChatBtn = document.getElementById('startAIChat');
    
    // 如果浮动按钮不存在，直接返回
    if (!floatingBtn) {
        console.log('浮动AI按钮未找到，跳过初始化');
        return;
    }
    
    let isDragging = false;
    let startX, startY, initialX, initialY;
    let hasMoved = false;
    
    function openAIChat() {
        if (!hasMoved) {  // 只有在没有拖动时才打开对话
            // 多页面应用，直接跳转
            window.location.href = 'ai-chat.html';
        }
    }
    
    // 拖动开始
    function dragStart(e) {
        isDragging = true;
        hasMoved = false;
        floatingBtn.classList.add('dragging');
        
        // 获取当前位置
        const rect = floatingBtn.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        // 获取鼠标/触摸点位置
        if (e.type === 'mousedown') {
            startX = e.clientX - initialX;
            startY = e.clientY - initialY;
        } else {
            startX = e.touches[0].clientX - initialX;
            startY = e.touches[0].clientY - initialY;
        }
        
        // 改为绝对定位
        floatingBtn.style.position = 'fixed';
        floatingBtn.style.left = initialX + 'px';
        floatingBtn.style.top = initialY + 'px';
        floatingBtn.style.right = 'auto';
        floatingBtn.style.bottom = 'auto';
        
        e.preventDefault();
    }
    
    // 拖动中
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        hasMoved = true;
        
        let currentX, currentY;
        if (e.type === 'mousemove') {
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
        } else {
            currentX = e.touches[0].clientX - startX;
            currentY = e.touches[0].clientY - startY;
        }
        
        // 限制在窗口范围内
        const maxX = window.innerWidth - floatingBtn.offsetWidth;
        const maxY = window.innerHeight - floatingBtn.offsetHeight;
        
        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));
        
        floatingBtn.style.left = currentX + 'px';
        floatingBtn.style.top = currentY + 'px';
    }
    
    // 拖动结束
    function dragEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        floatingBtn.classList.remove('dragging');
        
        // 吸附到最近的边缘
        const rect = floatingBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const windowWidth = window.innerWidth;
        
        setTimeout(() => {
            if (centerX < windowWidth / 2) {
                // 吸附到左边
                floatingBtn.style.left = '32px';
            } else {
                // 吸附到右边
                floatingBtn.style.left = (windowWidth - rect.width - 32) + 'px';
            }
        }, 100);
        
        // 如果没有移动，则打开对话
        setTimeout(() => {
            if (!hasMoved) {
                openAIChat();
            }
            hasMoved = false;
        }, 150);
    }
    
    // 绑定鼠标事件
    floatingBtn.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    // 绑定触摸事件（移动端）
    floatingBtn.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
    
    // 横幅上的AI对话按钮已通过onclick跳转
}

// ========================================
// 通知提示
// ========================================
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        background: type === 'success' ? '#5FD3A6' : type === 'error' ? '#FF6B6B' : '#4A90E2',
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        zIndex: 10000,
        animation: 'slideInRight 0.3s ease-out',
        fontWeight: '600',
        maxWidth: '400px'
    });
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// 保存练习记录
// ========================================
function savePracticeRecord(type, duration) {
    const practices = JSON.parse(localStorage.getItem('practices')) || [];
    practices.unshift({
        type,
        duration,
        date: new Date().toISOString()
    });
    
    // 只保留最近50条记录
    if (practices.length > 50) {
        practices.pop();
    }
    
    localStorage.setItem('practices', JSON.stringify(practices));
}

// ========================================
// 初始化模拟数据（首次访问）
// ========================================
function initMockData() {
    if (moodData.length === 0) {
        // 生成最近30天的模拟数据，10分制，8种心情
        const moods = [
            { name: '悲伤', value: 1 },
            { name: '生气', value: 2 },
            { name: '难过', value: 3 },
            { name: '尴尬', value: 4 },
            { name: '紧张', value: 5 },
            { name: '平静', value: 6 },
            { name: '微笑', value: 8 },
            { name: '开心', value: 10 }
        ];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // 随机生成心情值，偏向中高分段
            const randomIndex = Math.floor(Math.random() * 5) + 3; // 索引3-7，对应紧张到开心
            const randomMood = moods[randomIndex];
            
            moodData.push({
                date: dateStr,
                mood: randomMood.name,
                value: randomMood.value
            });
        }
        
        localStorage.setItem('moodData', JSON.stringify(moodData));
    }
}

// ========================================
// 设置模态框
// ========================================
function initSettings() {
    const settingsBtn = document.querySelector('.btn-settings');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const saveSettings = document.getElementById('saveSettings');
    const backdrop = settingsModal?.querySelector('.settings-backdrop');
    const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    
    if (!settingsBtn || !settingsModal) {
        console.log('设置功能元素未找到，跳过初始化');
        return;
    }
    
    // 打开设置
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('打开设置面板');
    });
    
    // 关闭设置
    const closeModal = () => {
        settingsModal.classList.remove('active');
        document.body.style.overflow = '';
        console.log('关闭设置面板');
    };
    
    closeSettings.addEventListener('click', closeModal);
    
    // 点击背景关闭
    backdrop.addEventListener('click', closeModal);
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // 头像上传
    uploadAvatarBtn.addEventListener('click', () => {
        avatarInput.click();
    });
    
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // 检查文件大小（2MB = 2097152 bytes）
            if (file.size > 2097152) {
                alert('❌ 图片大小不能超过2MB');
                return;
            }
            
            // 检查文件类型
            if (!file.type.match('image.*')) {
                alert('❌ 请上传图片文件');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgUrl = e.target.result;
                avatarPreview.innerHTML = `<img src="${imgUrl}" alt="头像">`;
                
                // 保存到localStorage
                localStorage.setItem('userAvatar', imgUrl);
                console.log('头像已更新');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 保存设置
    saveSettings.addEventListener('click', () => {
        const nickname = document.getElementById('userNickname').value;
        const phone = document.getElementById('userPhone').value;
        const birthday = document.getElementById('userBirthday').value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        
        // 保存到localStorage
        const userSettings = {
            nickname,
            phone,
            birthday,
            gender
        };
        
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        
        // 显示保存成功提示
        alert('✅ 设置保存成功！');
        closeModal();
        
        console.log('保存设置:', userSettings);
    });
    
    // 加载保存的设置
    loadUserSettings();
}

// 加载用户设置
function loadUserSettings() {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        
        const nicknameInput = document.getElementById('userNickname');
        const phoneInput = document.getElementById('userPhone');
        const birthdayInput = document.getElementById('userBirthday');
        
        if (nicknameInput) nicknameInput.value = settings.nickname || '';
        if (phoneInput) phoneInput.value = settings.phone || '';
        if (birthdayInput) birthdayInput.value = settings.birthday || '';
        
        if (settings.gender) {
            const genderRadio = document.querySelector(`input[name="gender"][value="${settings.gender}"]`);
            if (genderRadio) genderRadio.checked = true;
        }
        
        console.log('已加载用户设置');
    }
    
    // 加载头像
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        const avatarPreview = document.getElementById('avatarPreview');
        if (avatarPreview) {
            avatarPreview.innerHTML = `<img src="${savedAvatar}" alt="头像">`;
            console.log('已加载用户头像');
        }
    }
}

// ========================================
// 登录认证系统
// ========================================

// 更新顶部用户状态显示
function updateHeaderUserStatus() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const headerNickname = document.getElementById('headerNickname');
    const headerAvatar = document.getElementById('headerAvatar');
    
    if (!loginBtn || !userProfile) return;
    
    if (checkAuth()) {
        // 已登录，显示用户信息
        const userInfo = UserAPI.getUserInfo();
        const userSettings = localStorage.getItem('userSettings');
        const userAvatar = localStorage.getItem('userAvatar');
        
        // 显示昵称
        if (userSettings) {
            const settings = JSON.parse(userSettings);
            headerNickname.textContent = settings.nickname || userInfo?.nickname || '情绪岛用户';
        } else {
            headerNickname.textContent = userInfo?.nickname || '情绪岛用户';
        }
        
        // 显示头像
        if (userAvatar) {
            headerAvatar.innerHTML = `<img src="${userAvatar}" alt="头像">`;
        } else {
            headerAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
        }
        
        // 切换显示
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        
        console.log('✅ 已更新为登录状态显示');
    } else {
        // 未登录，显示登录按钮
        loginBtn.style.display = 'block';
        userProfile.style.display = 'none';
        
        console.log('✅ 已更新为未登录状态显示');
    }
}

// 检查登录状态
function checkAuth() {
    if (typeof UserAPI !== 'undefined') {
        const isLoggedIn = UserAPI.isLoggedIn();
        console.log('检查登录状态:', isLoggedIn, 'Token:', UserAPI.getToken() ? '存在' : '不存在');
        return isLoggedIn;
    }
    console.log('UserAPI未定义，返回未登录状态');
    return false;
}

// 显示登录模态框
function showAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        // 确保每次打开都显示登录表单而不是注册表单
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        if (loginForm && registerForm) {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        }
        
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('显示登录模态框');
    }
}

// 隐藏登录模态框
function hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
        console.log('隐藏登录模态框');
    }
}

// 需要登录验证的操作
function requireAuth(action) {
    if (checkAuth()) {
        // 已登录，执行操作
        if (typeof action === 'function') {
            action();
        }
    } else {
        // 未登录，显示登录框
        showAuthModal();
    }
}

// 初始化登录/注册功能
function initAuth() {
    const authModal = document.getElementById('authModal');
    if (!authModal) {
        console.log('登录模态框元素未找到，跳过初始化');
        return;
    }
    
    const closeAuthModal = document.getElementById('closeAuthModal');
    const backdrop = authModal.querySelector('.auth-backdrop');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');
    
    // 关闭模态框
    closeAuthModal?.addEventListener('click', hideAuthModal);
    backdrop?.addEventListener('click', hideAuthModal);
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('active')) {
            hideAuthModal();
        }
    });
    
    // 切换到注册表单
    switchToRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    
    // 切换到登录表单
    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
    
    // 密码显示/隐藏切换
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // 登录提交
    loginSubmitBtn?.addEventListener('click', async () => {
        const phone = document.getElementById('loginPhone').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // 验证输入
        if (!phone) {
            alert('请输入手机号');
            return;
        }
        
        if (!password) {
            alert('请输入密码');
            return;
        }
        
        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            alert('请输入正确的手机号');
            return;
        }
        
        // 禁用按钮，显示加载状态
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
        
        try {
            // 调用登录API
            const result = await UserAPI.login(phone, password);
            
            if (result.success) {
                alert('✅ ' + result.message);
                hideAuthModal();
                
                // 更新顶部状态显示
                updateHeaderUserStatus();
            } else {
                alert('❌ ' + result.message);
            }
        } catch (error) {
            alert('❌ 登录失败：' + error.message);
        } finally {
            // 恢复按钮状态
            loginSubmitBtn.disabled = false;
            loginSubmitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 登录';
        }
    });
    
    // 注册提交
    registerSubmitBtn?.addEventListener('click', async () => {
        const phone = document.getElementById('registerPhone').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // 验证输入
        if (!phone) {
            alert('请输入手机号');
            return;
        }
        
        if (!password) {
            alert('请输入密码');
            return;
        }
        
        if (!confirmPassword) {
            alert('请确认密码');
            return;
        }
        
        if (!agreeTerms) {
            alert('请阅读并同意用户协议和隐私政策');
            return;
        }
        
        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            alert('请输入正确的手机号');
            return;
        }
        
        // 禁用按钮，显示加载状态
        registerSubmitBtn.disabled = true;
        registerSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 注册中...';
        
        try {
            // 调用注册API
            const result = await UserAPI.register(phone, password, confirmPassword);
            
            if (result.success) {
                alert('✅ ' + result.message);
                
                // 切换到登录表单
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
                
                // 预填手机号
                document.getElementById('loginPhone').value = phone;
            } else {
                alert('❌ ' + result.message);
            }
        } catch (error) {
            alert('❌ 注册失败：' + error.message);
        } finally {
            // 恢复按钮状态
            registerSubmitBtn.disabled = false;
            registerSubmitBtn.innerHTML = '<i class="fas fa-user-plus"></i> 注册';
        }
    });
    
    // 回车键提交
    document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginSubmitBtn.click();
        }
    });
    
    document.getElementById('registerConfirmPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            registerSubmitBtn.click();
        }
    });
    
    console.log('✅ 登录认证系统已初始化');
}

// 初始化顶部登录按钮和退出登录
function initHeaderAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    
    // 登录按钮点击
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            showAuthModal();
        });
    }
    
    // 顶部退出登录按钮
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (confirm('确定要退出登录吗？')) {
                // 调用UserAPI退出登录
                if (typeof UserAPI !== 'undefined') {
                    UserAPI.logout();
                }
                
                alert('👋 已退出登录');
                
                // 更新顶部状态
                updateHeaderUserStatus();
                
                // 跳转到首页
                window.location.href = 'home.html';
            }
        });
    }
    
    console.log('✅ 顶部登录/退出功能已初始化');
}

// 为需要登录的元素添加拦截
function setupAuthGuards() {
    // 顶部导航拦截
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const originalHref = link.getAttribute('href');
        
        link.addEventListener('click', (e) => {
            // home.html 不需要登录，或者当前已激活的链接
            if (originalHref === 'home.html' || link.classList.contains('active')) {
                return;
            }
            
            // 检查登录状态
            if (!checkAuth()) {
                e.preventDefault();
                showAuthModal();
                console.log('未登录，阻止跳转到:', originalHref);
            } else {
                // 已登录，允许跳转
                console.log('已登录，允许跳转到:', originalHref);
                // 不需要preventDefault，浏览器会自动跳转
            }
        });
    });
    
    // 首页功能按钮拦截
    const aiChatBtn = document.getElementById('startAIChat');
    const psychHelpBtn = document.querySelector('.btn-secondary');
    const floatingAIBtn = document.getElementById('floatingAIBtn');
    
    [aiChatBtn, psychHelpBtn, floatingAIBtn].forEach(btn => {
        if (btn) {
            const originalOnclick = btn.onclick;
            btn.onclick = null;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                requireAuth(() => {
                    if (originalOnclick) {
                        originalOnclick.call(btn, e);
                    } else if (btn.getAttribute('onclick')) {
                        eval(btn.getAttribute('onclick'));
                    }
                });
            });
        }
    });
    
    // 心情打卡拦截已在 initMoodCheckin() 中处理，不需要重复拦截
    
    // 快捷练习卡片拦截
    const practiceCards = document.querySelectorAll('.practice-card-enhanced');
    practiceCards.forEach(card => {
        const originalOnclick = card.onclick;
        card.onclick = null;
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            
            requireAuth(() => {
                if (originalOnclick) {
                    originalOnclick.call(card, e);
                } else {
                    location.href = 'tools.html';
                }
            });
        });
    });
    
    // 心理测评拦截
    const testButtons = document.querySelectorAll('.btn-start-small');
    testButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 跳过已实现功能的测评按钮（包括 Home 页面和 Tools 页面）
            const implementedButtons = [
                'startSdsFromHome', 'startSasFromHome', 'startApeskFromHome', 
                'startPsqiFromHome', 'startScl90FromHome',
                'startSds', 'startSas', 'startApeskPstr', 
                'startBai', 'startPsqi', 'startScl90', 'startDass21'
            ];
            
            if (implementedButtons.includes(btn.id)) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            requireAuth(() => {
                const testType = btn.closest('.assessment-item-compact')?.dataset.test || '该测评';
                alert(`📋 开始测评：${testType}\n\n测评功能开发中...`);
            });
        });
    });
    
    // 查看全部按钮拦截
    const viewAllLink = document.querySelector('a[href="tools.html#assessment-section"]');
    if (viewAllLink) {
        viewAllLink.addEventListener('click', (e) => {
            if (!checkAuth()) {
                e.preventDefault();
                showAuthModal();
            }
        });
    }
    
    console.log('✅ 登录拦截已设置');
}

// ========================================
// 页面加载完成后初始化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // 初始化模拟数据
    initMockData();
    
    // 初始化各个功能模块
    initNavigation();
    initMoodCheckin();
    initAIChat();
    initPracticeCards();
    initBreathingExercise();
    initMeditation();
    initAssessment();
    initChartTabs();
    initHistoryTabs();
    initFloatingAI();
    initSettings();
    
    // 初始化登录认证系统
    initAuth();
    
    // 初始化顶部用户状态
    initHeaderAuth();
    
    // 更新顶部登录状态显示
    updateHeaderUserStatus();
    
    // 设置登录拦截
    setupAuthGuards();
    
    console.log('🏝️ 情绪岛已成功加载！');
    
    // 初始化心理工具页的新功能
    initBreathingModal();
    initHelp();
    initApeskPstrAssessment();
    initSasAssessment();
    initSdsAssessment();
    initBaiAssessment();
    initPsqiAssessment();
    initDass21Assessment();
    initScl90Assessment();
    
    // 处理URL哈希，高亮显示目标区域
    handleHashHighlight();
    
    // 初始化个人中心图表 - 延迟确保Chart.js已加载
    if (document.getElementById('emotionChart')) {
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
        updateEmotionChart();
                console.log('📊 情绪趋势图已加载');
            } else {
                console.error('Chart.js未加载，请检查网络连接');
            }
        }, 100);
    }
});

// ========================================
// 呼吸练习模态框
// ========================================
function initBreathingModal() {
    const openBtn = document.getElementById('openBreathingModal');
    const closeBtn = document.getElementById('closeBreathingModal');
    const modal = document.getElementById('breathingModal');
    
    if (!openBtn || !modal) return;
    
    // 打开模态框
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // 关闭模态框
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // 停止呼吸练习
            const stopBtn = document.getElementById('stopBreathing');
            if (stopBtn && stopBtn.style.display !== 'none') {
                stopBtn.click();
            }
        });
    }
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
}

// ========================================
// 心理援助模态框
// ========================================
function initHelp() {
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    
    if (!helpBtn || !helpModal) return;
    
    // 打开心理援助模态框
    helpBtn.addEventListener('click', () => {
        // 检查登录状态，未登录时不显示心理援助框
        if (!checkAuth()) {
            showAuthModal();
            return;
        }
        
        helpModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // 关闭模态框
    if (closeHelpModal) {
        closeHelpModal.addEventListener('click', () => {
            helpModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // 点击背景关闭
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && helpModal.classList.contains('active')) {
            helpModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    console.log('✅ 心理援助模态框已初始化');
}

// ========================================
// 处理URL哈希高亮（强烈突出效果）
// ========================================
function handleHashHighlight() {
    const hash = window.location.hash;
    let targetElement = null;
    
    // 根据哈希值获取目标元素
    if (hash === '#assessment-section') {
        targetElement = document.getElementById('assessment-section');
    } else if (hash === '#breathing-section') {
        targetElement = document.getElementById('breathing-section');
    } else if (hash === '#meditation-section') {
        targetElement = document.getElementById('meditation-section');
    }
    
    // 如果找到目标元素，执行高亮
    if (targetElement) {
        // 滚动到目标位置
        setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        // 添加高亮效果（不创建全屏黑色遮罩）
        setTimeout(() => {
            // 添加高亮效果
            targetElement.classList.add('highlight-flash');
            
            // 3秒后移除高亮效果
            setTimeout(() => {
                targetElement.classList.remove('highlight-flash');
            }, 3000);
        }, 500);
    }
}

// ========================================
// APESK-PSTR 心理压力量表
// ========================================
function initApeskPstrAssessment() {
    // 题目数据
    const questions = [
        "受背痛之苦",
        "睡眠无规律且不安稳",
        "头痛",
        "颚部痛",
        "如果需要等候，会感到不安",
        "脖子痛",
        "比多数人更容易紧张",
        "很难入睡",
        "感到头部发紧或痛",
        "胃不好",
        "对自己没有信心",
        "对自己说话",
        "担心财务问题",
        "与人见面时感到窘迫",
        "担心发生可怕的事",
        "白天觉得累",
        "下午感到喉咙痛，但并非感冒所致",
        "心里不安，无法静坐",
        "感到非常口干",
        "心脏有毛病",
        "觉得自己非常无用",
        "吸烟",
        "肚子不舒服",
        "觉得不快乐",
        "流汗",
        "喝酒",
        "很自觉",
        "觉得自己像四分五裂了",
        "眼睛又酸又累",
        "腿或脚抽筋",
        "心跳加速",
        "怕结识人",
        "手脚冰冷",
        "便秘",
        "未经医生处方乱吃药",
        "发现自己很容易哭",
        "消化不良",
        "咬手指",
        "耳朵有嗡嗡声",
        "小便次数多",
        "有胃溃疡的毛病",
        "有皮肤方面的毛病",
        "担心工作",
        "有口腔溃疡",
        "为小事所烦厌",
        "呼吸急促",
        "觉得胸部紧迫",
        "很难作出决定",
        "想呕吐",
        "觉得受困扰"
    ];
    
    // 测试状态
    let currentQuestion = 0;
    let answers = [];
    
    // DOM元素
    const modal = document.getElementById('apeskPstrModal');
    const startBtn = document.getElementById('startApeskPstr');
    const closeBtn = document.getElementById('closeApeskPstrModal');
    const startTestBtn = document.getElementById('startApeskTest');
    const restartBtn = document.getElementById('restartApeskTest');
    
    const welcomeSection = document.getElementById('apeskWelcome');
    const questionSection = document.getElementById('apeskQuestion');
    const resultSection = document.getElementById('apeskResult');
    
    const questionTitle = document.getElementById('questionTitle');
    const currentQuestionNum = document.getElementById('currentQuestionNum');
    const progressPercent = document.getElementById('progressPercent');
    const progressFill = document.getElementById('apeskProgress');
    
    const optionBtns = document.querySelectorAll('#apeskQuestion .option-btn');
    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');
    
    const resultScore = document.getElementById('resultScore');
    const resultLevel = document.getElementById('resultLevel');
    const resultText = document.getElementById('resultText');
    const resultIcon = document.getElementById('resultIcon');
    
    // 只检查 modal 是否存在，startBtn 可能在某些页面不存在（如 home.html）
    if (!modal) return;
    
    // 如果 startBtn 存在才绑定（tools.html 页面）
    if (startBtn) {
        // 打开模态框
        startBtn.addEventListener('click', () => {
            // 检查登录状态
            if (!checkAuth()) {
                showAuthModal();
                return;
            }
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetTest();
        });
    }
    
    // 关闭模态框
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    // 开始测试
    startTestBtn.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        questionSection.style.display = 'flex';
        showQuestion(0);
    });
    
    // 重新测试
    restartBtn.addEventListener('click', () => {
        resetTest();
    });
    
    // 选项点击
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除其他选项的选中状态
            optionBtns.forEach(b => b.classList.remove('selected'));
            // 添加当前选项的选中状态
            btn.classList.add('selected');
            
            // 保存答案
            answers[currentQuestion] = parseInt(btn.dataset.score);
            
            // 启用下一题按钮
            nextBtn.disabled = false;
        });
    });
    
    // 上一题
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });
    
    // 下一题
    nextBtn.addEventListener('click', () => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            // 完成测试，显示结果
            showResult();
        }
    });
    
    // 显示题目
    function showQuestion(index) {
        questionTitle.textContent = `${index + 1}. ${questions[index]}`;
        currentQuestionNum.textContent = index + 1;
        
        const percent = Math.round(((index + 1) / questions.length) * 100);
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
        
        // 更新按钮状态
        prevBtn.disabled = index === 0;
        
        // 恢复之前的答案
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        if (answers[index] !== undefined) {
            const selectedBtn = Array.from(optionBtns).find(btn => 
                parseInt(btn.dataset.score) === answers[index]
            );
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
                nextBtn.disabled = false;
            } else {
                nextBtn.disabled = true;
            }
        } else {
            nextBtn.disabled = true;
        }
        
        // 更新下一题按钮文本
        if (index === questions.length - 1) {
            nextBtn.innerHTML = '<span>查看结果</span> <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = '<span>下一题</span> <i class="fas fa-chevron-right"></i>';
        }
    }
    
    // 显示结果
    function showResult() {
        const totalScore = answers.reduce((sum, score) => sum + score, 0);
        
        questionSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        resultScore.textContent = totalScore;
        
        // 根据分数显示不同的结果
        let level = '';
        let analysis = '';
        let iconClass = 'fas fa-chart-bar';
        let cardColor = 'linear-gradient(135deg, #4A90E2, #6BA3E8)';
        
        if (totalScore >= 93) {
            level = '高度压力';
            iconClass = 'fas fa-exclamation-triangle';
            cardColor = 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
            analysis = '您目前处于高度应激反应中，身心正遭受压力伤害。建议您尽快寻求专业心理咨询师的帮助，他们可以帮助您减轻压力知觉，改善生活质量。请不要独自承受，专业的支持会让您的康复之路更加顺利。';
        } else if (totalScore >= 82) {
            level = '较高压力';
            iconClass = 'fas fa-exclamation-circle';
            cardColor = 'linear-gradient(135deg, #FFA94D, #FFB870)';
            analysis = '您正在经历较大的压力，身心健康正受到损害，可能也影响了您的人际关系。学习如何减除压力反应对您来说非常必要。建议您花时间做放松练习，学习控制压力的方法，也可以寻求专业帮助。';
        } else if (totalScore >= 71) {
            level = '中等压力';
            iconClass = 'fas fa-info-circle';
            cardColor = 'linear-gradient(135deg, #FFC107, #FFD54F)';
            analysis = '您的压力程度中等，可能正开始对健康产生不利影响。建议您反思自己对压力的反应方式，学习在压力出现时控制肌肉紧张，以消除生理激活反应。适当的放松练习会对您有所帮助。';
        } else if (totalScore >= 60) {
            level = '适度压力';
            iconClass = 'fas fa-smile';
            cardColor = 'linear-gradient(135deg, #5FD3A6, #7EE0B8)';
            analysis = '您生活中的兴奋与压力较为适中。虽然偶尔会有压力较大的时候，但您有能力享受压力并快速恢复平衡状态，因此对健康不会造成威胁。请继续保持这种良好的状态。';
        } else if (totalScore >= 49) {
            level = '低压力';
            iconClass = 'fas fa-check-circle';
            cardColor = 'linear-gradient(135deg, #4AC99D, #5FD3A6)';
            analysis = '您能够很好地控制自己的压力反应，是一个相当放松的人。您没有将遇到的压力解释为威胁，因此能够轻松与人相处，充满信心地工作。请继续保持这种积极的心态。';
        } else if (totalScore >= 38) {
            level = '极低压力';
            iconClass = 'fas fa-leaf';
            cardColor = 'linear-gradient(135deg, #6BA3E8, #87B4EC)';
            analysis = '您对压力反应很小，几乎不为所动。虽然这对健康无负面影响，但您的生活可能缺乏适度的兴奋和趣味。适当增加一些挑战性活动可能会让生活更加丰富多彩。';
        } else if (totalScore >= 27) {
            level = '压力不足';
            iconClass = 'fas fa-feather';
            cardColor = 'linear-gradient(135deg, #9B7EDE, #B195E5)';
            analysis = '您的生活可能相当沉闷，即使有刺激或有趣的事情发生，您也很少作出反应。建议您参加更多的社会活动或娱乐活动，以增加生活的激情和活力。';
        } else {
            level = '压力经验不足';
            iconClass = 'fas fa-question-circle';
            cardColor = 'linear-gradient(135deg, #7B68EE, #9381F0)';
            analysis = '您在生活中经历的压力可能不够，或是没有正确地认识自己。建议您更主动一些，在工作、社交、娱乐等活动上增加些刺激，让生活更加充实。';
        }
        
        resultLevel.textContent = level;
        resultText.textContent = analysis;
        resultIcon.innerHTML = `<i class="${iconClass}"></i>`;
        
        // 更新结果卡片颜色
        const resultCard = document.querySelector('.result-score-card');
        resultCard.style.background = cardColor;
    }
    
    // 重置测试
    function resetTest() {
        currentQuestion = 0;
        answers = [];
        
        welcomeSection.style.display = 'block';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        nextBtn.disabled = true;
        prevBtn.disabled = true;
    }
    
    console.log('✅ APESK-PSTR 心理压力量表已初始化');
}

// ========================================
// SAS 焦虑自评量表
// ========================================
function initSasAssessment() {
    // 题目数据（带*号的是反向计分题：5、9、13、17、19）
    const questions = [
        { text: "我感到比往常更加神经过敏和焦虑", reverse: false },
        { text: "我无缘无故感到担心", reverse: false },
        { text: "我容易心烦意乱或感到恐慌", reverse: false },
        { text: "我感到我的身体好像被分成几块，支离破碎", reverse: false },
        { text: "我感到事事都很顺利，不会有倒霉的事情发生", reverse: true },
        { text: "我的四肢抖动和震颤", reverse: false },
        { text: "我因头痛、颈痛、背痛而烦恼", reverse: false },
        { text: "我感到无力且容易疲劳", reverse: false },
        { text: "我感到很平静，能安静坐下来", reverse: true },
        { text: "我感到我的心跳较快", reverse: false },
        { text: "我因阵阵的眩晕而不舒服", reverse: false },
        { text: "我有阵阵要昏倒的感觉", reverse: false },
        { text: "我呼吸时进气和出气都不费力", reverse: true },
        { text: "我的手指和脚趾感到麻木和刺痛", reverse: false },
        { text: "我因胃痛和消化不良而苦恼", reverse: false },
        { text: "我必须时常排尿", reverse: false },
        { text: "我的手总是很温暖而干燥", reverse: true },
        { text: "我觉得脸发烧发红", reverse: false },
        { text: "我容易入睡，晚上休息很好", reverse: true },
        { text: "我做恶梦", reverse: false }
    ];
    
    let currentQuestion = 0;
    let answers = [];
    
    const modal = document.getElementById('sasModal');
    const startBtn = document.getElementById('startSas');
    const closeBtn = document.getElementById('closeSasModal');
    const startTestBtn = document.getElementById('startSasTest');
    const restartBtn = document.getElementById('restartSasTest');
    
    const welcomeSection = document.getElementById('sasWelcome');
    const questionSection = document.getElementById('sasQuestion');
    const resultSection = document.getElementById('sasResult');
    
    const questionTitle = document.getElementById('sasQuestionTitle');
    const currentQuestionNum = document.getElementById('sasCurrentQuestionNum');
    const progressPercent = document.getElementById('sasProgressPercent');
    const progressFill = document.getElementById('sasProgress');
    
    const optionBtns = document.querySelectorAll('.sas-option');
    const prevBtn = document.getElementById('sasPrevQuestion');
    const nextBtn = document.getElementById('sasNextQuestion');
    
    const resultScore = document.getElementById('sasResultScore');
    const resultLevel = document.getElementById('sasResultLevel');
    const resultText = document.getElementById('sasResultText');
    const resultIcon = document.getElementById('sasResultIcon');
    
    // 只检查 modal 是否存在，startBtn 可能在某些页面不存在（如 home.html）
    if (!modal) return;
    
    // 如果 startBtn 存在才绑定（tools.html 页面）
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!checkAuth()) {
                showAuthModal();
                return;
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetTest();
        });
    }
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    startTestBtn.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        questionSection.style.display = 'flex';
        showQuestion(0);
    });
    
    restartBtn.addEventListener('click', () => {
        resetTest();
    });
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            optionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            let score = parseInt(btn.dataset.score);
            if (questions[currentQuestion].reverse) {
                score = 5 - score;
            }
            answers[currentQuestion] = score;
            nextBtn.disabled = false;
        });
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            showResult();
        }
    });
    
    function showQuestion(index) {
        questionTitle.textContent = `${index + 1}. ${questions[index].text}`;
        currentQuestionNum.textContent = index + 1;
        
        const percent = Math.round(((index + 1) / questions.length) * 100);
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
        
        prevBtn.disabled = index === 0;
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        if (answers[index] !== undefined) {
            let displayScore = answers[index];
            if (questions[index].reverse) {
                displayScore = 5 - displayScore;
            }
            const selectedBtn = Array.from(optionBtns).find(btn => 
                parseInt(btn.dataset.score) === displayScore
            );
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
                nextBtn.disabled = false;
            } else {
                nextBtn.disabled = true;
            }
        } else {
            nextBtn.disabled = true;
        }
        
        if (index === questions.length - 1) {
            nextBtn.innerHTML = '<span>查看结果</span> <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = '<span>下一题</span> <i class="fas fa-chevron-right"></i>';
        }
    }
    
    function showResult() {
        const rawScore = answers.reduce((sum, score) => sum + score, 0);
        const standardScore = Math.round(rawScore * 1.25);
        
        questionSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        resultScore.textContent = standardScore;
        
        let level = '';
        let analysis = '';
        let iconClass = 'fas fa-check-circle';
        let cardColor = 'linear-gradient(135deg, #5FD3A6, #7EE0B8)';
        
        if (standardScore >= 70) {
            level = '重度焦虑';
            iconClass = 'fas fa-exclamation-triangle';
            cardColor = 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
            analysis = '您目前的焦虑程度较为严重，已经对日常生活造成了明显影响。建议您尽快寻求专业心理咨询师或精神科医生的帮助，进行系统的心理治疗或必要的药物治疗。请不要独自承受，专业的支持会帮助您走出困境。';
        } else if (standardScore >= 60) {
            level = '中度焦虑';
            iconClass = 'fas fa-exclamation-circle';
            cardColor = 'linear-gradient(135deg, #FFA94D, #FFB870)';
            analysis = '您目前存在中度焦虑症状，这可能已经影响到您的工作和生活质量。建议您寻求心理咨询，学习焦虑管理技巧，如放松训练、认知重构等。同时，保持规律作息，适度运动也会有所帮助。';
        } else if (standardScore >= 50) {
            level = '轻度焦虑';
            iconClass = 'fas fa-info-circle';
            cardColor = 'linear-gradient(135deg, #FFC107, #FFD54F)';
            analysis = '您目前存在轻度焦虑情绪，这在生活中是比较常见的。建议您多关注自己的情绪变化，尝试进行深呼吸、冥想等放松练习。如果焦虑持续或加重，建议及时寻求专业帮助。';
        } else {
            level = '正常范围';
            iconClass = 'fas fa-smile';
            cardColor = 'linear-gradient(135deg, #4AC99D, #5FD3A6)';
            analysis = '您的焦虑水平在正常范围内，情绪状态良好。请继续保持健康的生活方式，适当运动，保持社交，维持良好的心理状态。';
        }
        
        resultLevel.textContent = level;
        resultText.textContent = analysis;
        resultIcon.innerHTML = `<i class="${iconClass}"></i>`;
        document.querySelector('#sasResult .result-score-card').style.background = cardColor;
    }
    
    function resetTest() {
        currentQuestion = 0;
        answers = [];
        
        welcomeSection.style.display = 'block';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        nextBtn.disabled = true;
        prevBtn.disabled = true;
    }
    
    console.log('✅ SAS 焦虑自评量表已初始化');
}

// ========================================
// SDS 抑郁自评量表
// ========================================
function initSdsAssessment() {
    const questions = [
        { text: "我感到情绪沮丧，郁闷", reverse: false },
        { text: "我感到早晨心情最好", reverse: true },
        { text: "我要哭或想哭", reverse: false },
        { text: "我夜间睡眠不好", reverse: false },
        { text: "我吃饭像平常一样多", reverse: true },
        { text: "我的性功能正常", reverse: true },
        { text: "我感到体重减轻", reverse: false },
        { text: "我为便秘烦恼", reverse: false },
        { text: "我的心跳比平时快", reverse: false },
        { text: "我无故感到疲乏", reverse: false },
        { text: "我的头脑像平常一样清楚", reverse: true },
        { text: "我做事情像平常一样不感到困难", reverse: true },
        { text: "我坐卧难安，难以保持平静", reverse: false },
        { text: "我对未来感到有希望", reverse: true },
        { text: "我比平时更容易激怒", reverse: false },
        { text: "我觉得决定什么事很容易", reverse: true },
        { text: "我感到自己是有用的和不可缺少的人", reverse: true },
        { text: "我的生活很有意思", reverse: true },
        { text: "假若我死了，别人会过得更好", reverse: false },
        { text: "我仍旧喜欢自己平时喜欢的东西", reverse: true }
    ];
    
    let currentQuestion = 0;
    let answers = [];
    
    const modal = document.getElementById('sdsModal');
    const startBtn = document.getElementById('startSds');
    const closeBtn = document.getElementById('closeSdsModal');
    const startTestBtn = document.getElementById('startSdsTest');
    const restartBtn = document.getElementById('restartSdsTest');
    
    const welcomeSection = document.getElementById('sdsWelcome');
    const questionSection = document.getElementById('sdsQuestion');
    const resultSection = document.getElementById('sdsResult');
    
    const questionTitle = document.getElementById('sdsQuestionTitle');
    const currentQuestionNum = document.getElementById('sdsCurrentQuestionNum');
    const progressPercent = document.getElementById('sdsProgressPercent');
    const progressFill = document.getElementById('sdsProgress');
    
    const optionBtns = document.querySelectorAll('.sds-option');
    const prevBtn = document.getElementById('sdsPrevQuestion');
    const nextBtn = document.getElementById('sdsNextQuestion');
    
    const resultScore = document.getElementById('sdsResultScore');
    const resultLevel = document.getElementById('sdsResultLevel');
    const resultText = document.getElementById('sdsResultText');
    const resultIcon = document.getElementById('sdsResultIcon');
    
    // 只检查 modal 是否存在，startBtn 可能在某些页面不存在（如 home.html）
    if (!modal) return;
    
    // 如果 startBtn 存在才绑定（tools.html 页面）
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!checkAuth()) {
                showAuthModal();
                return;
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetTest();
        });
    }
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    startTestBtn.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        questionSection.style.display = 'flex';
        showQuestion(0);
    });
    
    restartBtn.addEventListener('click', () => {
        resetTest();
    });
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            optionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            let score = parseInt(btn.dataset.score);
            if (questions[currentQuestion].reverse) {
                score = 5 - score;
            }
            answers[currentQuestion] = score;
            nextBtn.disabled = false;
        });
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            showResult();
        }
    });
    
    function showQuestion(index) {
        questionTitle.textContent = `${index + 1}. ${questions[index].text}`;
        currentQuestionNum.textContent = index + 1;
        
        const percent = Math.round(((index + 1) / questions.length) * 100);
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
        
        prevBtn.disabled = index === 0;
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        if (answers[index] !== undefined) {
            let displayScore = answers[index];
            if (questions[index].reverse) {
                displayScore = 5 - displayScore;
            }
            const selectedBtn = Array.from(optionBtns).find(btn => 
                parseInt(btn.dataset.score) === displayScore
            );
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
                nextBtn.disabled = false;
            } else {
                nextBtn.disabled = true;
            }
        } else {
            nextBtn.disabled = true;
        }
        
        if (index === questions.length - 1) {
            nextBtn.innerHTML = '<span>查看结果</span> <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = '<span>下一题</span> <i class="fas fa-chevron-right"></i>';
        }
    }
    
    function showResult() {
        const rawScore = answers.reduce((sum, score) => sum + score, 0);
        const standardScore = Math.round(rawScore * 1.25);
        
        questionSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        resultScore.textContent = standardScore;
        
        let level = '';
        let analysis = '';
        let iconClass = 'fas fa-smile';
        let cardColor = 'linear-gradient(135deg, #5FD3A6, #7EE0B8)';
        
        if (standardScore >= 70) {
            level = '重度抑郁';
            iconClass = 'fas fa-cloud-rain';
            cardColor = 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
            analysis = '您目前处于重度抑郁状态，情况较为严重。建议您尽快找心理专家或精神科医生咨询，接受专业的心理治疗或药物治疗。主要问题可能包括：感到情绪沮丧郁闷、早晨心情沉重、要哭或想哭、夜间睡眠不好、饭量下降、性功能不正常、体重减轻、便秘、感到心跳加快、感到疲劳、头脑不清楚、感到做事困难、坐卧不安、觉得未来没有希望、容易激怒、觉得难以下决定、感到自己无用、生活没有意义、想到死、不喜爱自己平时喜爱的东西。';
        } else if (standardScore >= 61) {
            level = '中度抑郁';
            iconClass = 'fas fa-cloud-showers-heavy';
            cardColor = 'linear-gradient(135deg, #FFA94D, #FFB870)';
            analysis = '您目前处于中度抑郁状态，建议找心理专家咨询。主要问题可能包括：经常感到情绪沮丧郁闷、要哭或想哭、夜间睡眠不好、体重减轻、便秘、感到心跳加快、感到疲劳、坐卧不安、容易激怒、想到死。建议您积极寻求心理咨询，学习情绪管理技巧，同时保持规律作息，适当运动。';
        } else if (standardScore >= 50) {
            level = '轻度抑郁';
            iconClass = 'fas fa-cloud';
            cardColor = 'linear-gradient(135deg, #FFC107, #FFD54F)';
            analysis = '您目前处于轻度抑郁状态，建议进行自我调节，或寻求他人的支持、帮助。主要问题可能包括：经常早晨心情沉重、体重减轻、头脑不清楚、感到自己无用；有时饭量下降、感到做事困难、觉得未来没有希望、觉得难以下决定、生活没有意义、不喜爱自己平时喜爱的东西；偶尔感到情绪沮丧郁闷、要哭或想哭、便秘、感到疲劳。请多关注自己的情绪，必要时寻求专业帮助。';
        } else {
            level = '正常范围';
            iconClass = 'fas fa-sun';
            cardColor = 'linear-gradient(135deg, #4AC99D, #5FD3A6)';
            analysis = '您最近没有抑郁情绪，心理状态良好。请继续保持积极乐观的心态，保持健康的生活方式，多参与有意义的活动，维护良好的社交关系。';
        }
        
        resultLevel.textContent = level;
        resultText.textContent = analysis;
        resultIcon.innerHTML = `<i class="${iconClass}"></i>`;
        document.querySelector('#sdsResult .result-score-card').style.background = cardColor;
    }
    
    function resetTest() {
        currentQuestion = 0;
        answers = [];
        
        welcomeSection.style.display = 'block';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        nextBtn.disabled = true;
        prevBtn.disabled = true;
    }
    
    console.log('✅ SDS 抑郁自评量表已初始化');
}

// ========================================
// BAI 贝克焦虑测试
// ========================================
function initBaiAssessment() {
    const questions = [
        "麻木或刺痛", "感到灼热", "腿部不稳", "无法放松", "害怕发生最坏的事情",
        "头晕或眩晕", "心跳加速", "不稳定", "恐惧", "紧张",
        "有窒息感", "手发抖", "浑身发抖", "害怕失去控制", "呼吸困难",
        "害怕死亡", "害怕", "消化不良或不适", "晕厥", "脸红",
        "出汗（非因热）"
    ];
    
    let currentQuestion = 0;
    let answers = [];
    
    const modal = document.getElementById('baiModal');
    const startBtn = document.getElementById('startBai');
    const closeBtn = document.getElementById('closeBaiModal');
    const startTestBtn = document.getElementById('startBaiTest');
    const restartBtn = document.getElementById('restartBaiTest');
    
    const welcomeSection = document.getElementById('baiWelcome');
    const questionSection = document.getElementById('baiQuestion');
    const resultSection = document.getElementById('baiResult');
    
    const questionTitle = document.getElementById('baiQuestionTitle');
    const currentQuestionNum = document.getElementById('baiCurrentQuestionNum');
    const progressPercent = document.getElementById('baiProgressPercent');
    const progressFill = document.getElementById('baiProgress');
    
    const optionBtns = document.querySelectorAll('.bai-option');
    const prevBtn = document.getElementById('baiPrevQuestion');
    const nextBtn = document.getElementById('baiNextQuestion');
    
    const resultScore = document.getElementById('baiResultScore');
    const resultLevel = document.getElementById('baiResultLevel');
    const resultText = document.getElementById('baiResultText');
    const resultIcon = document.getElementById('baiResultIcon');
    
    if (!modal || !startBtn) return;
    
    startBtn.addEventListener('click', () => {
        if (!checkAuth()) {
            showAuthModal();
            return;
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetTest();
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    startTestBtn.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        questionSection.style.display = 'flex';
        showQuestion(0);
    });
    
    restartBtn.addEventListener('click', () => {
        resetTest();
    });
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            optionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            answers[currentQuestion] = parseInt(btn.dataset.score);
            nextBtn.disabled = false;
        });
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            showResult();
        }
    });
    
    function showQuestion(index) {
        questionTitle.textContent = `${index + 1}. ${questions[index]}`;
        currentQuestionNum.textContent = index + 1;
        
        const percent = Math.round(((index + 1) / questions.length) * 100);
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
        
        prevBtn.disabled = index === 0;
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        if (answers[index] !== undefined) {
            const selectedBtn = Array.from(optionBtns).find(btn => 
                parseInt(btn.dataset.score) === answers[index]
            );
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
                nextBtn.disabled = false;
            } else {
                nextBtn.disabled = true;
            }
        } else {
            nextBtn.disabled = true;
        }
        
        if (index === questions.length - 1) {
            nextBtn.innerHTML = '<span>查看结果</span> <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = '<span>下一题</span> <i class="fas fa-chevron-right"></i>';
        }
    }
    
    function showResult() {
        const totalScore = answers.reduce((sum, score) => sum + score, 0);
        
        questionSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        resultScore.textContent = totalScore;
        
        let level = '';
        let analysis = '';
        let iconClass = 'fas fa-smile';
        let cardColor = 'linear-gradient(135deg, #5FD3A6, #7EE0B8)';
        
        if (totalScore >= 26) {
            level = '重度焦虑';
            iconClass = 'fas fa-heartbeat';
            cardColor = 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
            analysis = '您目前存在重度焦虑症状，焦虑程度严重，已经显著影响到您的日常生活和工作。建议您尽快寻求专业心理咨询师或精神科医生的帮助。专业的治疗可能包括认知行为疗法(CBT)、药物治疗或两者结合。请记住，焦虑是可以治疗的，专业人士会帮助您找到适合的应对策略。';
        } else if (totalScore >= 16) {
            level = '中度焦虑';
            iconClass = 'fas fa-exclamation-circle';
            cardColor = 'linear-gradient(135deg, #FFA94D, #FFB870)';
            analysis = '您目前存在中度焦虑症状，焦虑水平较高，可能会影响您的生活质量。建议您考虑寻求心理咨询，学习有效的焦虑管理技巧，如深呼吸、正念练习、渐进性肌肉放松等。同时，保持规律的作息、适当的运动和健康的饮食也会有所帮助。如果症状持续或加重，请及时就医。';
        } else if (totalScore >= 8) {
            level = '轻度焦虑';
            iconClass = 'fas fa-info-circle';
            cardColor = 'linear-gradient(135deg, #FFC107, #FFD54F)';
            analysis = '您目前存在轻度焦虑症状，这是生活中常见的情绪反应。建议您尝试一些自我调节方法，如深呼吸练习、冥想、规律运动等，这些都有助于缓解焦虑。同时，与信任的朋友或家人倾诉也会有帮助。如果焦虑持续存在或影响到您的日常生活，建议考虑寻求专业帮助。';
        } else {
            level = '极轻微焦虑';
            iconClass = 'fas fa-check-circle';
            cardColor = 'linear-gradient(135deg, #4AC99D, #5FD3A6)';
            analysis = '您目前的焦虑水平非常低，情绪状态良好。请继续保持健康的生活方式，适当运动，保持良好的社交关系，这些都有助于维持良好的心理健康状态。如果将来感到压力或焦虑，记得及时采取放松措施或寻求支持。';
        }
        
        resultLevel.textContent = level;
        resultText.textContent = analysis;
        resultIcon.innerHTML = `<i class="${iconClass}"></i>`;
        document.querySelector('#baiResult .result-score-card').style.background = cardColor;
    }
    
    function resetTest() {
        currentQuestion = 0;
        answers = [];
        
        welcomeSection.style.display = 'block';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        nextBtn.disabled = true;
        prevBtn.disabled = true;
    }
    
    console.log('✅ BAI 贝克焦虑测试已初始化');
}

// ========================================
// PSQI 匹兹堡睡眠质量指数
// ========================================
function initPsqiAssessment() {
    // 7个成分的题目数据
    const components = [
        {
            title: "1. 睡眠质量",
            subtitle: "您认为自己上个月的睡眠质量如何？",
            options: [
                { label: "很好", score: 0 },
                { label: "较好", score: 1 },
                { label: "较差", score: 2 },
                { label: "很差", score: 3 }
            ]
        },
        {
            title: "2. 入睡时间",
            subtitle: "您通常躺下后多久能睡着？",
            options: [
                { label: "≤15分钟", score: 0 },
                { label: "16-30分钟", score: 1 },
                { label: "31-60分钟", score: 2 },
                { label: "≥60分钟", score: 3 }
            ]
        },
        {
            title: "3. 睡眠时间",
            subtitle: "您每晚实际能睡几个小时？",
            options: [
                { label: ">7小时", score: 0 },
                { label: "6-7小时", score: 1 },
                { label: "5-6小时", score: 2 },
                { label: "<5小时", score: 3 }
            ]
        },
        {
            title: "4. 睡眠效率",
            subtitle: "请根据您的实际睡眠时间和在床上的时间计算睡眠效率（实际睡眠时间÷在床时间×100%）",
            options: [
                { label: ">85%", score: 0 },
                { label: "75-84%", score: 1 },
                { label: "65-74%", score: 2 },
                { label: "<65%", score: 3 }
            ]
        },
        {
            title: "5. 睡眠障碍",
            subtitle: "过去一个月，您是否因以下问题影响睡眠：夜间易醒、早醒、起床上厕所、呼吸不畅、咳嗽或鼾声高、感觉冷或热、做噩梦、疼痛等",
            options: [
                { label: "没有", score: 0 },
                { label: "<1次/周", score: 1 },
                { label: "1-2次/周", score: 2 },
                { label: "≥3次/周", score: 3 }
            ]
        },
        {
            title: "6. 催眠药物",
            subtitle: "过去一个月，您是否使用药物来帮助睡眠？",
            options: [
                { label: "没有", score: 0 },
                { label: "<1次/周", score: 1 },
                { label: "1-2次/周", score: 2 },
                { label: "≥3次/周", score: 3 }
            ]
        },
        {
            title: "7. 日间功能障碍",
            subtitle: "过去一个月，您是否感到困倦、精力不足，或在白天难以保持清醒？",
            options: [
                { label: "没有", score: 0 },
                { label: "<1次/周", score: 1 },
                { label: "1-2次/周", score: 2 },
                { label: "≥3次/周", score: 3 }
            ]
        }
    ];
    
    let currentComponent = 0;
    let answers = [];
    
    const modal = document.getElementById('psqiModal');
    const startBtn = document.getElementById('startPsqi');
    const closeBtn = document.getElementById('closePsqiModal');
    const startTestBtn = document.getElementById('startPsqiTest');
    const restartBtn = document.getElementById('restartPsqiTest');
    
    const welcomeSection = document.getElementById('psqiWelcome');
    const questionSection = document.getElementById('psqiQuestion');
    const resultSection = document.getElementById('psqiResult');
    
    const questionTitle = document.getElementById('psqiQuestionTitle');
    const questionSubtitle = document.getElementById('psqiQuestionSubtitle');
    const currentQuestionNum = document.getElementById('psqiCurrentQuestionNum');
    const progressPercent = document.getElementById('psqiProgressPercent');
    const progressFill = document.getElementById('psqiProgress');
    const questionOptions = document.getElementById('psqiQuestionOptions');
    
    const prevBtn = document.getElementById('psqiPrevQuestion');
    const nextBtn = document.getElementById('psqiNextQuestion');
    
    const resultScore = document.getElementById('psqiResultScore');
    const resultLevel = document.getElementById('psqiResultLevel');
    const resultText = document.getElementById('psqiResultText');
    const resultIcon = document.getElementById('psqiResultIcon');
    
    if (!modal) return;
    
    // 如果 startBtn 存在才绑定（tools.html 页面）
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!checkAuth()) {
                showAuthModal();
                return;
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetTest();
        });
    }
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    startTestBtn.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        questionSection.style.display = 'flex';
        showComponent(0);
    });
    
    restartBtn.addEventListener('click', () => {
        resetTest();
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentComponent > 0) {
            currentComponent--;
            showComponent(currentComponent);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentComponent < components.length - 1) {
            currentComponent++;
            showComponent(currentComponent);
        } else {
            showResult();
        }
    });
    
    function showComponent(index) {
        const component = components[index];
        
        questionTitle.textContent = component.title;
        questionSubtitle.textContent = component.subtitle;
        currentQuestionNum.textContent = index + 1;
        
        const percent = Math.round(((index + 1) / components.length) * 100);
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
        
        prevBtn.disabled = index === 0;
        
        // 更新现有选项按钮的文本和分数
        const optionButtons = questionOptions.querySelectorAll('.psqi-option');
        component.options.forEach((option, i) => {
            if (optionButtons[i]) {
                const btn = optionButtons[i];
                btn.dataset.score = option.score;
                const optionText = btn.querySelector('.option-text');
                if (optionText) {
                    optionText.textContent = option.label;
                }
                
                // 移除所有选中状态
                btn.classList.remove('selected');
                
                // 如果之前选过，恢复选中状态
                if (answers[index] !== undefined && answers[index] === option.score) {
                    btn.classList.add('selected');
                    nextBtn.disabled = false;
                }
            }
        });
        
        // 如果没有选过答案，禁用下一步按钮
        if (answers[index] === undefined) {
            nextBtn.disabled = true;
        }
        
        // 更新下一步按钮文本
        if (index === components.length - 1) {
            nextBtn.innerHTML = '<span>查看结果</span> <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = '<span>下一项</span> <i class="fas fa-chevron-right"></i>';
        }
    }
    
    // 为选项按钮绑定事件（初始化时执行一次）
    const psqiOptionBtns = questionOptions.querySelectorAll('.psqi-option');
    psqiOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有选中状态
            psqiOptionBtns.forEach(b => b.classList.remove('selected'));
            // 添加当前选中状态
            btn.classList.add('selected');
            // 保存答案
            answers[currentComponent] = parseInt(btn.dataset.score);
            // 启用下一步按钮
            nextBtn.disabled = false;
        });
    });
    
    function showResult() {
        const totalScore = answers.reduce((sum, score) => sum + score, 0);
        
        questionSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        resultScore.textContent = totalScore;
        
        let level = '';
        let analysis = '';
        let iconClass = 'fas fa-smile';
        let cardColor = 'linear-gradient(135deg, #5FD3A6, #7EE0B8)';
        
        if (totalScore >= 16) {
            level = '睡眠质量很差';
            iconClass = 'fas fa-exclamation-triangle';
            cardColor = 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
            analysis = '您的睡眠质量很差，严重影响了日常生活和身心健康。建议您尽快咨询医生或睡眠专家，查找睡眠问题的根源。可能需要进行系统的睡眠障碍评估和治疗。同时，建议建立规律的作息时间，改善睡眠环境，避免睡前使用电子设备，限制咖啡因和酒精摄入。';
        } else if (totalScore >= 11) {
            level = '睡眠质量不太好';
            iconClass = 'fas fa-bed';
            cardColor = 'linear-gradient(135deg, #FFA94D, #FFB870)';
            analysis = '您的睡眠质量不太好，已经对生活质量造成了一定影响。建议您注意改善睡眠习惯：保持规律的睡眠时间、创造舒适的睡眠环境、睡前避免剧烈运动和使用电子设备、避免过多的咖啡因摄入。如果情况持续或加重，建议咨询医生。';
        } else if (totalScore >= 6) {
            level = '睡眠质量还行';
            iconClass = 'fas fa-moon';
            cardColor = 'linear-gradient(135deg, #FFC107, #FFD54F)';
            analysis = '您的睡眠质量还可以，但仍有改善的空间。建议您继续保持良好的睡眠习惯，注意睡眠卫生：固定的就寝和起床时间、舒适的睡眠环境、睡前放松活动（如阅读、冥想）、避免睡前使用电子设备。适当的运动也有助于改善睡眠质量。';
        } else {
            level = '睡眠质量很好';
            iconClass = 'fas fa-check-circle';
            cardColor = 'linear-gradient(135deg, #4AC99D, #5FD3A6)';
            analysis = '恭喜您！您的睡眠质量很好，这对身心健康非常重要。请继续保持良好的睡眠习惯：规律的作息时间、舒适的睡眠环境、健康的生活方式。良好的睡眠是维持身心健康的基础，继续保持！';
        }
        
        resultLevel.textContent = level;
        resultText.textContent = analysis;
        resultIcon.innerHTML = `<i class="${iconClass}"></i>`;
        document.querySelector('#psqiResult .result-score-card').style.background = cardColor;
    }
    
    function resetTest() {
        currentComponent = 0;
        answers = [];
        
        welcomeSection.style.display = 'block';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
        
        nextBtn.disabled = true;
        prevBtn.disabled = true;
    }
    
    console.log('✅ PSQI 匹兹堡睡眠质量指数已初始化');
}

// ========================================
// DASS-21 抑郁焦虑压力量表
// ========================================
function initDass21Assessment() {
    // 题目数据（s=压力, a=焦虑, d=抑郁）
    const questions = [
        { text: "我发现很难放松下来", type: "s" },
        { text: "我意识到我的口干", type: "a" },
        { text: "我似乎根本体会不到任何积极的感觉", type: "d" },
        { text: "我感到呼吸困难（例如，呼吸过快、没有体力活动时呼吸困难）", type: "a" },
        { text: "我发现很难主动去做事", type: "d" },
        { text: "我倾向于对情况反应过度", type: "s" },
        { text: "我感到颤抖（如双手颤抖）", type: "a" },
        { text: "我觉得我用了很多紧张的精力", type: "s" },
        { text: "我担心会出现恐慌和出丑的情况", type: "a" },
        { text: "我觉得我没有什么可期待的", type: "d" },
        { text: "我发现自己变得焦虑不安", type: "s" },
        { text: "我发现很难放松", type: "s" },
        { text: "我感到沮丧和忧郁", type: "d" },
        { text: "我不能容忍任何阻止我继续做我正在做的事情的事情", type: "s" },
        { text: "我觉得我快要恐慌了", type: "a" },
        { text: "我无法对任何事情产生热情", type: "d" },
        { text: "我觉得我作为一个人没什么价值", type: "d" },
        { text: "我觉得自己相当容易激动", type: "s" },
        { text: "我意识到自己的心脏在没有体力活动的情况下的活动（例如，感觉到心率加快、心脏漏跳）", type: "a" },
        { text: "我没有任何理由感到害怕", type: "a" },
        { text: "我觉得生活毫无意义", type: "d" }
    ];
    
    let currentQuestion = 0;
    let answers = [];
    
    const modal = document.getElementById('dass21Modal');
    const startBtn = document.getElementById('startDass21');
    const closeBtn = document.getElementById('closeDass21Modal');
    const startTestBtn = document.getElementById('startDass21Test');
    const restartBtn = document.getElementById('restartDass21Test');
    
    const welcomeSection = document.getElementById('dass21Welcome');
    const questionSection = document.getElementById('dass21Question');
    const resultSection = document.getElementById('dass21Result');
    
    const questionTitle = document.getElementById('dass21QuestionTitle');
    const currentQuestionNum = document.getElementById('dass21CurrentQuestionNum');
    const progressPercent = document.getElementById('dass21ProgressPercent');
    const progressFill = document.getElementById('dass21Progress');
    
    const optionBtns = document.querySelectorAll('.dass21-option');
    const prevBtn = document.getElementById('dass21PrevQuestion');
    const nextBtn = document.getElementById('dass21NextQuestion');
    
    const depressionScore = document.getElementById('dass21DepressionScore');
    const anxietyScore = document.getElementById('dass21AnxietyScore');
    const stressScore = document.getElementById('dass21StressScore');
    const resultText = document.getElementById('dass21ResultText');
    const resultIcon = document.getElementById('dass21ResultIcon');
    
    if (!modal) return;
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!checkAuth()) {
                showAuthModal();
                return;
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetTest();
        });
    }
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    startTestBtn.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        questionSection.style.display = 'flex';
        showQuestion(0);
    });
    
    restartBtn.addEventListener('click', () => {
        resetTest();
    });
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            optionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            answers[currentQuestion] = parseInt(btn.dataset.score);
            nextBtn.disabled = false;
        });
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            showResult();
        }
    });
    
    function showQuestion(index) {
        questionTitle.textContent = `${index + 1}. ${questions[index].text}`;
        currentQuestionNum.textContent = index + 1;
        
        const percent = Math.round(((index + 1) / questions.length) * 100);
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
        
        prevBtn.disabled = index === 0;
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        if (answers[index] !== undefined) {
            const selectedBtn = Array.from(optionBtns).find(btn => 
                parseInt(btn.dataset.score) === answers[index]
            );
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
                nextBtn.disabled = false;
            } else {
                nextBtn.disabled = true;
            }
        } else {
            nextBtn.disabled = true;
        }
        
        if (index === questions.length - 1) {
            nextBtn.innerHTML = '<span>查看结果</span> <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = '<span>下一题</span> <i class="fas fa-chevron-right"></i>';
        }
    }
    
    function showResult() {
        // 计算各维度得分（需要乘以2）
        let depression = 0, anxiety = 0, stress = 0;
        
        questions.forEach((q, index) => {
            const score = answers[index] || 0;
            if (q.type === 'd') depression += score;
            else if (q.type === 'a') anxiety += score;
            else if (q.type === 's') stress += score;
        });
        
        // DASS-21的分数需要乘以2
        depression *= 2;
        anxiety *= 2;
        stress *= 2;
        
        questionSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        depressionScore.textContent = depression;
        anxietyScore.textContent = anxiety;
        stressScore.textContent = stress;
        
        // 评估各维度
        const depressionLevel = getLevel(depression, 'depression');
        const anxietyLevel = getLevel(anxiety, 'anxiety');
        const stressLevel = getLevel(stress, 'stress');
        
        // 生成综合分析
        let analysis = `<div style="line-height: 1.8;">`;
        analysis += `<p><strong>抑郁：</strong>${depressionLevel.text}（${depression}分）</p>`;
        analysis += `<p>${depressionLevel.desc}</p>`;
        analysis += `<p><strong>焦虑：</strong>${anxietyLevel.text}（${anxiety}分）</p>`;
        analysis += `<p>${anxietyLevel.desc}</p>`;
        analysis += `<p><strong>压力：</strong>${stressLevel.text}（${stress}分）</p>`;
        analysis += `<p>${stressLevel.desc}</p>`;
        analysis += `</div>`;
        
        resultText.innerHTML = analysis;
        
        // 根据最严重的维度设置卡片颜色
        const maxSeverity = Math.max(depressionLevel.severity, anxietyLevel.severity, stressLevel.severity);
        let cardColor = 'linear-gradient(135deg, #4AC99D, #5FD3A6)';
        if (maxSeverity >= 4) cardColor = 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
        else if (maxSeverity >= 3) cardColor = 'linear-gradient(135deg, #FFA94D, #FFB870)';
        else if (maxSeverity >= 2) cardColor = 'linear-gradient(135deg, #FFC107, #FFD54F)';
        
        document.querySelector('#dass21Result .result-score-card').style.background = cardColor;
    }
    
    function getLevel(score, type) {
        if (type === 'depression') {
            if (score >= 28) return { text: '极其严重', desc: '您的抑郁症状非常严重，强烈建议立即寻求专业心理医生或精神科医生的帮助。', severity: 5 };
            if (score >= 21) return { text: '严重', desc: '您的抑郁症状较为严重，建议尽快寻求专业心理咨询或医疗帮助。', severity: 4 };
            if (score >= 14) return { text: '中度', desc: '您存在中度抑郁症状，建议寻求心理咨询，学习情绪管理技巧。', severity: 3 };
            if (score >= 10) return { text: '轻度', desc: '您存在轻度抑郁情绪，可以尝试自我调节，必要时寻求专业支持。', severity: 2 };
            return { text: '正常', desc: '您的抑郁水平在正常范围内，请继续保持良好的心理状态。', severity: 1 };
        } else if (type === 'anxiety') {
            if (score >= 20) return { text: '极其严重', desc: '您的焦虑症状非常严重，强烈建议立即寻求专业帮助。', severity: 5 };
            if (score >= 15) return { text: '严重', desc: '您的焦虑症状较为严重，建议尽快寻求专业心理咨询或医疗帮助。', severity: 4 };
            if (score >= 10) return { text: '中度', desc: '您存在中度焦虑症状，建议学习焦虑管理技巧和放松训练。', severity: 3 };
            if (score >= 8) return { text: '轻度', desc: '您存在轻度焦虑情绪，可以尝试深呼吸、冥想等放松方法。', severity: 2 };
            return { text: '正常', desc: '您的焦虑水平在正常范围内，请继续保持良好的心理状态。', severity: 1 };
        } else { // stress
            if (score >= 34) return { text: '极其严重', desc: '您的压力水平非常高，强烈建议立即寻求专业帮助。', severity: 5 };
            if (score >= 26) return { text: '严重', desc: '您的压力水平较高，建议尽快寻求专业心理咨询。', severity: 4 };
            if (score >= 19) return { text: '中度', desc: '您存在中度压力，建议学习压力管理技巧，适当放松。', severity: 3 };
            if (score >= 15) return { text: '轻度', desc: '您存在轻度压力，可以通过运动、休息等方式缓解。', severity: 2 };
            return { text: '正常', desc: '您的压力水平在正常范围内，请继续保持良好的心理状态。', severity: 1 };
        }
    }
    
    function resetTest() {
        currentQuestion = 0;
        answers = [];
        
        welcomeSection.style.display = 'block';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        nextBtn.disabled = true;
        prevBtn.disabled = true;
    }
    
    console.log('✅ DASS-21 抑郁焦虑压力量表已初始化');
}

// ========================================
// SCL-90 心理健康自评量表
// ========================================
function initScl90Assessment() {
    // 90道题目数据（简化版，包含因子类型）
    const questions = [
        { text: "头痛", factor: "躯体化" },
        { text: "神经过敏，心中不踏实", factor: "焦虑" },
        { text: "头脑中有不必要的想法或字句盘旋", factor: "强迫症状" },
        { text: "头晕或晕倒", factor: "躯体化" },
        { text: "对异性的兴趣减退", factor: "躯体化" },
        { text: "对旁人责备求全", factor: "敌对" },
        { text: "感到别人能控制您的思想", factor: "精神病性" },
        { text: "责怪别人制造麻烦", factor: "偏执" },
        { text: "忘性大", factor: "躯体化" },
        { text: "担心自己的衣饰整齐及仪态的端正", factor: "强迫症状" },
        { text: "容易烦恼和激动", factor: "焦虑" },
        { text: "胸痛", factor: "躯体化" },
        { text: "害怕空旷的场所或街道", factor: "恐怖" },
        { text: "感到自己的精力下降，活动减慢", factor: "抑郁" },
        { text: "想结束自己的生命", factor: "抑郁" },
        { text: "听到旁人听不到的声音", factor: "精神病性" },
        { text: "发抖", factor: "焦虑" },
        { text: "感到大多数人都不可信任", factor: "人际关系敏感" },
        { text: "胃口不好", factor: "躯体化" },
        { text: "容易哭泣", factor: "抑郁" },
        { text: "同异性相处时感到害羞不自在", factor: "人际关系敏感" },
        { text: "感到受骗，中了圈套或有人想抓住您", factor: "偏执" },
        { text: "无缘无故地突然感到害怕", factor: "恐怖" },
        { text: "自己不能控制地大发脾气", factor: "敌对" },
        { text: "怕单独出门", factor: "恐怖" },
        { text: "经常责怪自己", factor: "抑郁" },
        { text: "腰痛", factor: "躯体化" },
        { text: "感到难以完成任务", factor: "强迫症状" },
        { text: "感到孤独", factor: "人际关系敏感" },
        { text: "感到苦闷", factor: "抑郁" },
        { text: "过分担忧", factor: "焦虑" },
        { text: "对事物不感兴趣", factor: "抑郁" },
        { text: "感到害怕", factor: "焦虑" },
        { text: "您的感情容易受到伤害", factor: "人际关系敏感" },
        { text: "旁人能知道您的私下想法", factor: "精神病性" },
        { text: "感到别人不理解您、不同情您", factor: "人际关系敏感" },
        { text: "感到人们对您不友好，不喜欢您", factor: "人际关系敏感" },
        { text: "做事必须做得很慢以保证做得正确", factor: "强迫症状" },
        { text: "心跳得很厉害", factor: "焦虑" },
        { text: "恶心或胃部不舒服", factor: "躯体化" },
        { text: "感到比不上他人", factor: "人际关系敏感" },
        { text: "肌肉酸痛", factor: "躯体化" },
        { text: "感到有人在监视您、谈论您", factor: "偏执" },
        { text: "难以入睡", factor: "抑郁" },
        { text: "做事必须反复检查", factor: "强迫症状" },
        { text: "难以做出决定", factor: "强迫症状" },
        { text: "怕乘电车、公共汽车、地铁或火车", factor: "恐怖" },
        { text: "呼吸有困难", factor: "焦虑" },
        { text: "一阵阵发冷或发热", factor: "躯体化" },
        { text: "因为感到害怕而避开某些东西、场合或活动", factor: "恐怖" },
        { text: "脑子变空了", factor: "强迫症状" },
        { text: "身体发麻或刺痛", factor: "躯体化" },
        { text: "喉咙有梗塞感", factor: "躯体化" },
        { text: "感到前途没有希望", factor: "抑郁" },
        { text: "不能集中注意力", factor: "强迫症状" },
        { text: "感到身体的某一部分软弱无力", factor: "躯体化" },
        { text: "感到紧张或容易紧张", factor: "焦虑" },
        { text: "感到手或脚发重", factor: "躯体化" },
        { text: "想到死亡的事", factor: "抑郁" },
        { text: "吃得太多", factor: "躯体化" },
        { text: "当别人看着您或谈论您时感到不自在", factor: "人际关系敏感" },
        { text: "有一些不属于您自己的想法", factor: "精神病性" },
        { text: "有想打人或伤害他人的冲动", factor: "敌对" },
        { text: "醒得太早", factor: "抑郁" },
        { text: "必须反复洗手、点数或触摸某些东西", factor: "强迫症状" },
        { text: "睡得不稳不深", factor: "抑郁" },
        { text: "有想摔坏或破坏东西的想法", factor: "敌对" },
        { text: "有一些别人没有的想法", factor: "精神病性" },
        { text: "感到对别人神经过敏", factor: "人际关系敏感" },
        { text: "在商店或电影院等人多的地方感到不自在", factor: "恐怖" },
        { text: "感到任何事情都很困难", factor: "抑郁" },
        { text: "一阵阵恐惧或惊恐", factor: "焦虑" },
        { text: "感到公共场合吃东西很不舒服", factor: "恐怖" },
        { text: "经常与人争论", factor: "敌对" },
        { text: "单独一人时神经很紧张", factor: "恐怖" },
        { text: "别人对您的成绩没有做出恰当的评价", factor: "偏执" },
        { text: "即使和别人在一起也感到孤单", factor: "人际关系敏感" },
        { text: "感到坐立不安，心神不定", factor: "焦虑" },
        { text: "感到自己没有什么价值", factor: "抑郁" },
        { text: "感到熟悉的东西变成陌生或不像是真的", factor: "精神病性" },
        { text: "大叫或摔东西", factor: "敌对" },
        { text: "害怕会在公共场合晕倒", factor: "恐怖" },
        { text: "感到别人想占您的便宜", factor: "偏执" },
        { text: "为一些有关性的想法而很苦恼", factor: "精神病性" },
        { text: "您认为应该因为自己的过错而受到惩罚", factor: "偏执" },
        { text: "感到要很快把事情做完", factor: "强迫症状" },
        { text: "感到自己的身体有严重问题", factor: "躯体化" },
        { text: "从未感到和其他人很亲近", factor: "人际关系敏感" },
        { text: "感到自己有罪", factor: "偏执" },
        { text: "感到自己的脑子有毛病", factor: "精神病性" }
    ];
    
    let currentQuestion = 0;
    let answers = [];
    
    const modal = document.getElementById('scl90Modal');
    const startBtn = document.getElementById('startScl90');
    const closeBtn = document.getElementById('closeScl90Modal');
    const startTestBtn = document.getElementById('startScl90Test');
    const restartBtn = document.getElementById('restartScl90Test');
    
    const welcomeSection = document.getElementById('scl90Welcome');
    const questionSection = document.getElementById('scl90Question');
    const resultSection = document.getElementById('scl90Result');
    
    const questionTitle = document.getElementById('scl90QuestionTitle');
    const currentQuestionNum = document.getElementById('scl90CurrentQuestionNum');
    const progressPercent = document.getElementById('scl90ProgressPercent');
    const progressFill = document.getElementById('scl90Progress');
    
    const optionBtns = document.querySelectorAll('.scl90-option');
    const prevBtn = document.getElementById('scl90PrevQuestion');
    const nextBtn = document.getElementById('scl90NextQuestion');
    
    const resultScore = document.getElementById('scl90ResultScore');
    const resultLevel = document.getElementById('scl90ResultLevel');
    const resultText = document.getElementById('scl90ResultText');
    const resultIcon = document.getElementById('scl90ResultIcon');
    const factorAnalysis = document.getElementById('scl90FactorAnalysis');
    
    if (!modal) return;
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!checkAuth()) {
                showAuthModal();
                return;
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetTest();
        });
    }
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    startTestBtn.addEventListener('click', () => {
        welcomeSection.style.display = 'none';
        questionSection.style.display = 'flex';
        showQuestion(0);
    });
    
    restartBtn.addEventListener('click', () => {
        resetTest();
    });
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            optionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            answers[currentQuestion] = parseInt(btn.dataset.score);
            nextBtn.disabled = false;
        });
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            showResult();
        }
    });
    
    function showQuestion(index) {
        questionTitle.textContent = `${index + 1}. ${questions[index].text}`;
        currentQuestionNum.textContent = index + 1;
        
        const percent = Math.round(((index + 1) / questions.length) * 100);
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
        
        prevBtn.disabled = index === 0;
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        if (answers[index] !== undefined) {
            const selectedBtn = Array.from(optionBtns).find(btn => 
                parseInt(btn.dataset.score) === answers[index]
            );
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
                nextBtn.disabled = false;
            } else {
                nextBtn.disabled = true;
            }
        } else {
            nextBtn.disabled = true;
        }
        
        if (index === questions.length - 1) {
            nextBtn.innerHTML = '<span>查看结果</span> <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = '<span>下一题</span> <i class="fas fa-chevron-right"></i>';
        }
    }
    
    function showResult() {
        const totalScore = answers.reduce((sum, score) => sum + score, 0);
        
        // 计算各因子得分
        const factors = {
            '躯体化': [], '强迫症状': [], '人际关系敏感': [], '抑郁': [],
            '焦虑': [], '敌对': [], '恐怖': [], '偏执': [], '精神病性': []
        };
        
        questions.forEach((q, index) => {
            factors[q.factor].push(answers[index] || 1);
        });
        
        // 计算因子平均分
        const factorScores = {};
        for (let factor in factors) {
            const sum = factors[factor].reduce((a, b) => a + b, 0);
            factorScores[factor] = (sum / factors[factor].length).toFixed(2);
        }
        
        questionSection.style.display = 'none';
        resultSection.style.display = 'block';
        
        resultScore.textContent = totalScore;
        
        // 判断总体水平
        let level = '', analysis = '', iconClass = 'fas fa-smile', cardColor = 'linear-gradient(135deg, #5FD3A6, #7EE0B8)';
        
        if (totalScore >= 250) {
            level = '心理症状较严重';
            iconClass = 'fas fa-exclamation-triangle';
            cardColor = 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
            analysis = '您目前的心理症状较为严重，已经对日常生活造成明显影响。强烈建议您尽快寻求专业心理咨询师或精神科医生的帮助，进行系统评估和治疗。请不要独自承受，专业的支持会帮助您走出困境。';
        } else if (totalScore >= 200) {
            level = '存在中等程度心理症状';
            iconClass = 'fas fa-exclamation-circle';
            cardColor = 'linear-gradient(135deg, #FFA94D, #FFB870)';
            analysis = '您目前存在中等程度的心理症状，这已经对您的生活质量造成一定影响。建议您进行自我调节，如保持规律作息、适当运动、与亲友交流等。如果症状持续或加重，建议寻求专业心理咨询。';
        } else if (totalScore >= 160) {
            level = '存在轻微心理症状';
            iconClass = 'fas fa-info-circle';
            cardColor = 'linear-gradient(135deg, #FFC107, #FFD54F)';
            analysis = '您可能存在轻微的心理症状，需要关注自身状态。建议您多关注自己的情绪变化，保持健康的生活方式，适当放松。如果感到困扰，可以寻求心理咨询。';
        } else {
            level = '心理健康状况较好';
            iconClass = 'fas fa-check-circle';
            cardColor = 'linear-gradient(135deg, #4AC99D, #5FD3A6)';
            analysis = '您的整体心理健康状况较好，没有明显的心理症状困扰。请继续保持良好的生活习惯和积极的心态。';
        }
        
        resultLevel.textContent = level;
        resultText.textContent = analysis;
        resultIcon.innerHTML = `<i class="${iconClass}"></i>`;
        document.querySelector('#scl90Result .result-score-card').style.background = cardColor;
        
        // 显示因子分析
        factorAnalysis.innerHTML = '';
        for (let factor in factorScores) {
            const score = parseFloat(factorScores[factor]);
            let factorLevel = score >= 3 ? '较明显' : score >= 2 ? '轻微' : '正常';
            let factorColor = score >= 3 ? '#FF6B6B' : score >= 2 ? '#FFA94D' : '#5FD3A6';
            
            const factorCard = document.createElement('div');
            factorCard.style.cssText = `
                padding: 15px;
                background: white;
                border-radius: 12px;
                border-left: 4px solid ${factorColor};
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            factorCard.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 5px;">${factor}</div>
                <div style="font-size: 24px; color: ${factorColor}; font-weight: bold;">${score}</div>
                <div style="font-size: 12px; color: #666;">${factorLevel}</div>
            `;
            factorAnalysis.appendChild(factorCard);
        }
    }
    
    function resetTest() {
        currentQuestion = 0;
        answers = [];
        
        welcomeSection.style.display = 'block';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
        
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        nextBtn.disabled = true;
        prevBtn.disabled = true;
    }
    
    console.log('✅ SCL-90 心理健康自评量表已初始化');
}
