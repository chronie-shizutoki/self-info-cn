class I18nManager {
    constructor() {
        this.languages = {};
        this.currentLanguage = 'zh-CN';
        this.supportedLanguages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'];
        this.defaultLanguage = 'zh-CN';
        this.init();
    }

    async init() {
        try {
            await this.loadTranslations();
            this.detectUserLanguage();
            this.createLanguageSelector();
            this.updateAllTexts();
        } catch (error) {
            console.error('Failed to initialize i18n:', error);
        }
    }

    async loadTranslations() {
        try {
            const response = await fetch('components/i18n.json');
            const data = await response.json();
            this.languages = data;
        } catch (error) {
            console.error('Failed to load translations:', error);
        }
    }

    detectUserLanguage() {
        const userLang = navigator.language || navigator.userLanguage;
        const langCode = userLang.split('-')[0];
        
        // 检查是否支持用户的语言，如果不支持则使用默认语言
        let matchedLang = this.defaultLanguage;
        for (const lang of this.supportedLanguages) {
            if (lang.startsWith(langCode)) {
                matchedLang = lang;
                break;
            }
        }
        
        this.currentLanguage = matchedLang;
    }

    createLanguageSelector() {
        // 创建语言选择器容器
        const selectorContainer = document.createElement('div');
        selectorContainer.id = 'language-selector';
        selectorContainer.style.position = 'fixed';
        selectorContainer.style.top = '10px';
        selectorContainer.style.right = '10px';
        selectorContainer.style.zIndex = '1000';
        selectorContainer.style.display = 'flex';
        selectorContainer.style.flexDirection = 'column';
        selectorContainer.style.gap = '5px';

        // 创建语言按钮
        this.supportedLanguages.forEach(langCode => {
            const button = document.createElement('button');
            button.dataset.lang = langCode;
            button.textContent = this.languages[langCode]?.language_name || langCode;
            button.style.padding = '5px 10px';
            button.style.borderRadius = '15px';
            button.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            button.style.background = langCode === this.currentLanguage 
                ? 'rgba(219, 166, 255, 0.7)' 
                : 'rgba(255, 255, 255, 0.2)';
            button.style.color = 'white';
            button.style.fontSize = '12px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            button.style.backdropFilter = 'blur(5px)';
            button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';

            button.addEventListener('mouseenter', () => {
                button.style.background = langCode === this.currentLanguage 
                    ? 'rgba(219, 166, 255, 0.9)' 
                    : 'rgba(255, 255, 255, 0.3)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.background = langCode === this.currentLanguage 
                    ? 'rgba(219, 166, 255, 0.7)' 
                    : 'rgba(255, 255, 255, 0.2)';
            });

            button.addEventListener('click', () => {
                this.changeLanguage(langCode);
            });

            selectorContainer.appendChild(button);
        });

        document.body.appendChild(selectorContainer);
    }

    changeLanguage(langCode) {
        if (!this.supportedLanguages.includes(langCode)) {
            console.warn(`Language ${langCode} is not supported`);
            return;
        }

        this.currentLanguage = langCode;
        this.updateAllTexts();
        this.updateLanguageSelector();
    }

    updateLanguageSelector() {
        const buttons = document.querySelectorAll('#language-selector button');
        buttons.forEach(button => {
            const langCode = button.dataset.lang;
            button.style.background = langCode === this.currentLanguage 
                ? 'rgba(219, 166, 255, 0.7)' 
                : 'rgba(255, 255, 255, 0.2)';
        });
    }

    translate(key) {
        const translations = this.languages[this.currentLanguage];
        if (translations && translations[key]) {
            return translations[key];
        }
        // 如果当前语言没有该翻译，尝试使用默认语言
        if (this.currentLanguage !== this.defaultLanguage && 
            this.languages[this.defaultLanguage] && 
            this.languages[this.defaultLanguage][key]) {
            return this.languages[this.defaultLanguage][key];
        }
        return key; // 如果都没有，返回键名
    }

    updateAllTexts() {
        // 更新页面标题
        document.title = this.translate('page_title');
        
        // 更新问候语部分
        const headerContent = document.getElementById('header-content');
        if (headerContent) {
            headerContent.innerHTML = `
                <p class="info-text">${this.translate('greeting')}</p>
                <p><span class="info-text">${this.translate('name1')}</span><strong class="highlight">${this.translate('name2')}</strong></p>
                <p><span class="info-text">${this.translate('name3')}</span><strong class="highlight">${this.translate('name4')}</strong><span class="info-text">${this.translate('name5')}</span></p>
            `;
        }

        // 更新诞生小秘密部分
        const section1Title = document.getElementById('section1-title');
        if (section1Title) {
            section1Title.textContent = this.translate('section1_title');
        }
        
        const section1List = document.getElementById('section1-list');
        if (section1List) {
            section1List.innerHTML = `
                <li><span class="info-text">${this.translate('birth1')}</span><strong class="highlight">${this.translate('birth2')}</strong><strong class="highlight ql-size-5">${this.translate('birth3')}</strong><span class="info-text">${this.translate('birth4')}</span></li>
                <li><span class="info-text">${this.translate('birth5')}</span><strong class="highlight">${this.translate('birth6')}</strong><span class="info-text">${this.translate('birth7')}</span></li>
            `;
        }

        // 更新语言小口袋部分
        const section2Title = document.getElementById('section2-title');
        if (section2Title) {
            section2Title.textContent = this.translate('section2_title');
        }
        
        const section2List = document.getElementById('section2-list');
        if (section2List) {
            section2List.innerHTML = `
                <li><strong style="color: #d5ffbf;">${this.translate('language1')}</strong><span class="info-text">${this.translate('language2')}</span></li>
                <li><span class="info-text">${this.translate('language3')}</span></li>
            `;
        }

        // 更新ACGN能量体部分
        const section3Title = document.getElementById('section3-title');
        if (section3Title) {
            section3Title.textContent = this.translate('section3_title');
        }
        
        const section3List = document.getElementById('section3-list');
        if (section3List) {
            section3List.innerHTML = `
                <li><span class="info-text">${this.translate('acgn1')}</span></li>
                <li><span class="info-text">${this.translate('acgn2')}</span></li>
            `;
        }

        // 更新心灵小拼图部分
        const section4Title = document.getElementById('section4-title');
        if (section4Title) {
            section4Title.textContent = this.translate('section4_title');
        }
        
        const section4List = document.getElementById('section4-list');
        if (section4List) {
            section4List.innerHTML = `
                <li><span class="info-text">  </span><span class="highlight">${this.translate('personality1_label')}</span><span class="info-text">${this.translate('personality1_value')}</span><strong style="color: #ffeebf;">${this.translate('personality1_note')}</strong></li>
                <li><span class="info-text">  </span><span class="highlight">${this.translate('personality2_label')}</span><span class="info-text">${this.translate('personality2_value')}</span><strong style="color: #ffeebf;">${this.translate('personality2_note')}</strong></li>
                <li><span class="info-text">  </span><span class="highlight">${this.translate('personality3_label')}</span><span class="info-text">${this.translate('personality3_value')}</span><strong style="color: #ffeebf;">${this.translate('personality3_note')}</strong></li>
                <li><span class="info-text">  </span><span class="highlight">${this.translate('personality4_label')}</span><span class="info-text">${this.translate('personality4_value')}</span><strong style="color: #ffeebf;">${this.translate('personality4_note')}</strong></li>
                <li><span class="info-text">  </span><span class="highlight">${this.translate('personality5_label')}</span><span class="info-text">${this.translate('personality5_value')}</span><strong style="color: #ffeebf;">${this.translate('personality5_note')}</strong></li>
            `;
        }

        // 更新幸运小雷达部分
        const section5Title = document.getElementById('section5-title');
        if (section5Title) {
            section5Title.textContent = this.translate('section5_title');
        }
        
        const section5Content = document.getElementById('section5-content');
        if (section5Content) {
            section5Content.innerHTML = `
                <span class="info-text">${this.translate('lucky1')}</span><strong class="highlight">${this.translate('lucky2')}</strong><span class="info-text">${this.translate('lucky3')}</span>
            `;
        }

        // 更新游戏小星球部分
        const section6Title = document.getElementById('section6-title');
        if (section6Title) {
            section6Title.textContent = this.translate('section6_title');
        }
        
        const section6Content = document.getElementById('section6-content');
        if (section6Content) {
            section6Content.innerHTML = `
                <span class="info-text">${this.translate('game1')}</span><strong class="highlight">${this.translate('game2')}</strong><span class="info-text">${this.translate('game3')}</span><strong class="highlight">${this.translate('game4')}</strong><span class="info-text">${this.translate('game5')}</span>
            `;
        }

        // 更新结束语部分
        const farewellSection = document.getElementById('farewell-section');
        if (farewellSection) {
            const paragraphs = farewellSection.querySelectorAll('p');
            if (paragraphs.length >= 3) {
                paragraphs[0].innerHTML = `<span class="info-text">${this.translate('farewell1')}</span>`;
                paragraphs[1].innerHTML = `<span class="info-text">${this.translate('farewell2')}</span>`;
                paragraphs[2].innerHTML = `<span class="info-text">${this.translate('farewell3')}</span>`;
            }
        }

        // 更新底部信息
        const footerInfo = document.getElementById('footer-info');
        if (footerInfo) {
            footerInfo.innerHTML = `${this.translate('footer1')}<br>${this.translate('footer2')}`;
        }

        // 更新反馈按钮
        const feedbackLink = document.getElementById('feedback-link');
        if (feedbackLink) {
            feedbackLink.textContent = this.translate('feedback');
        }

        // 更新更新信息
        const updateInfo = document.getElementById('update-info');
        if (updateInfo) {
            updateInfo.textContent = this.translate('update_info');
        }

        // 更新加载屏幕文本
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = this.translate('loading_text');
        }

        // 更新生日倒计时文本
        if (window.updateBirthdayCountdown) {
            window.updateBirthdayCountdown();
        }
}
}

// 创建全局的i18n实例
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18nManager();
    
    // 派发语言变化事件，以便其他组件可以响应
    setTimeout(() => {
        const languageChangedEvent = new CustomEvent('languageChanged');
        document.dispatchEvent(languageChangedEvent);
    }, 100);
});