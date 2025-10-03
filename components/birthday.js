// 生成彩色气泡
function createBubbles() {
    const container = document.getElementById('countdown');
    if (!container) return;
    
    const colors = ['#ff9aa2', '#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea'];
    
    // 清除现有气泡
    const existingBubbles = document.querySelectorAll('.bubble');
    existingBubbles.forEach(bubble => bubble.remove());
    
    for (let i = 0; i < 8; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        const size = Math.random() * 40 + 20;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${posX}%`;
        bubble.style.top = `${posY}%`;
        bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
        bubble.style.opacity = Math.random() * 0.4 + 0.1;
        bubble.style.animationDuration = `${Math.random() * 10 + 5}s`;
        bubble.style.animationDelay = `${Math.random() * 5}s`;
        bubble.style.zIndex = 1;
        bubble.style.position = 'absolute';
        
        container.appendChild(bubble);
    }
}

// 计算生日倒计时
function calculateCountdown() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentYear = today.getFullYear();
    let solarBirthday = new Date(currentYear, 7, 23); // 8月23日
    solarBirthday.setHours(0, 0, 0, 0);
    
    // 如果今年的生日已经过了，计算到明年生日的时间
    if (today > solarBirthday) {
        solarBirthday.setFullYear(currentYear + 1);
    }
    
    const timeDiff = solarBirthday.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

// 更新倒计时显示
function updateCountdown() {
    const days = calculateCountdown();
    const countdown = document.getElementById('countdown');
    
    if (!countdown) return;
    
    // 获取当前语言的翻译文本
    const translations = window.i18nManager && window.i18nManager.getTranslations() || {
        birthday_today: '今天、就是生日哦！(＊´∀｀*)ﾉ',
        birthday_days_before_1: '离生日还有',
        birthday_days_before_2: '天～♡'
    };
    
    if (days === 0) {
        countdown.innerHTML = `<span class="cake-icon">🎂</span><span class="birthday-today">${translations.birthday_today}</span>`;
        countdown.style.display = 'flex';
        countdown.classList.add('birthday-today');
    } else if (days > 90) {
        countdown.style.display = 'none';
        // 修复bubble未定义的问题
        const bubbles = document.querySelectorAll('.bubble');
        bubbles.forEach(bubble => bubble.style.visibility = 'hidden');
    } else {
        countdown.innerHTML = `<span class="cake-icon">🎂</span><span>${translations.birthday_days_before_1}</span><span class="days-count" id="days">${days}</span><span>${translations.birthday_days_before_2}</span>`;
        countdown.style.display = 'flex';
        countdown.classList.remove('birthday-today');
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    updateCountdown();
    setInterval(updateCountdown, 1000 * 60 * 60); // 每小时更新一次
    createBubbles();
    
    // 监听语言变化事件
    document.addEventListener('languageChanged', updateCountdown);
});

// 导出函数供i18n.js调用
window.updateBirthdayCountdown = updateCountdown;