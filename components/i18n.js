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

        // 创建主按钮（显示当前语言）
        const mainButton = document.createElement('button');
        mainButton.id = 'language-main-button';
        mainButton.textContent = this.languages[this.currentLanguage]?.language_name || this.currentLanguage;
        mainButton.style.padding = '8px 16px';
        mainButton.style.borderRadius = '15px';
        mainButton.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        mainButton.style.background = 'rgba(219, 166, 255, 0.7)';
        mainButton.style.color = 'white';
        mainButton.style.fontSize = '14px';
        mainButton.style.cursor = 'pointer';
        mainButton.style.transition = 'all 0.3s ease';
        mainButton.style.backdropFilter = 'blur(5px)';
        mainButton.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        mainButton.style.display = 'flex';
        mainButton.style.alignItems = 'center';
        mainButton.style.justifyContent = 'space-between';
        mainButton.style.minWidth = '100px';

        // 添加下拉箭头
        const arrow = document.createElement('span');
        arrow.textContent = ' ▼';
        arrow.style.marginLeft = '5px';
        mainButton.appendChild(arrow);

        // 创建下拉菜单
        const dropdownMenu = document.createElement('div');
        dropdownMenu.id = 'language-dropdown-menu';
        dropdownMenu.style.position = 'absolute';
        dropdownMenu.style.top = '100%';
        dropdownMenu.style.right = '0';
        dropdownMenu.style.marginTop = '5px';
        dropdownMenu.style.borderRadius = '15px';
        dropdownMenu.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        dropdownMenu.style.background = 'rgba(255, 255, 255, 0.1)';
        dropdownMenu.style.backdropFilter = 'blur(10px)';
        dropdownMenu.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
        dropdownMenu.style.display = 'none';
        dropdownMenu.style.flexDirection = 'column';
        dropdownMenu.style.minWidth = '100%';
        dropdownMenu.style.maxHeight = '300px';
        dropdownMenu.style.overflowY = 'auto';

        // 创建语言选项
        this.supportedLanguages.forEach(langCode => {
            if (langCode !== this.currentLanguage) { // 不显示当前选中的语言
                const option = document.createElement('button');
                option.dataset.lang = langCode;
                option.textContent = this.languages[langCode]?.language_name || langCode;
                option.style.padding = '8px 16px';
                option.style.border = 'none';
                option.style.background = 'transparent';
                option.style.color = 'white';
                option.style.fontSize = '14px';
                option.style.cursor = 'pointer';
                option.style.transition = 'all 0.3s ease';
                option.style.textAlign = 'left';
                option.style.width = '100%';
                option.style.boxSizing = 'border-box';

                // 为第一个和最后一个选项添加圆角
                if (langCode === this.supportedLanguages[0]) {
                    option.style.borderTopLeftRadius = '15px';
                    option.style.borderTopRightRadius = '15px';
                }
                if (langCode === this.supportedLanguages[this.supportedLanguages.length - 1]) {
                    option.style.borderBottomLeftRadius = '15px';
                    option.style.borderBottomRightRadius = '15px';
                }

                option.addEventListener('mouseenter', () => {
                    option.style.background = 'rgba(255, 255, 255, 0.2)';
                });

                option.addEventListener('mouseleave', () => {
                    option.style.background = 'transparent';
                });

                option.addEventListener('click', () => {
                    this.changeLanguage(langCode);
                    dropdownMenu.style.display = 'none';
                });

                dropdownMenu.appendChild(option);
            }
        });

        // 切换下拉菜单显示/隐藏
        mainButton.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止冒泡，避免触发文档点击事件
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'flex' : 'none';
        });

        // 添加到容器
        selectorContainer.appendChild(mainButton);
        selectorContainer.appendChild(dropdownMenu);

        document.body.appendChild(selectorContainer);

        // 点击文档其他地方关闭菜单
        document.addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
        });

        // 防止点击菜单内部时关闭菜单
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
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
        // 更新主按钮文本
        const mainButton = document.getElementById('language-main-button');
        if (mainButton) {
            mainButton.textContent = this.languages[this.currentLanguage]?.language_name || this.currentLanguage;
            // 重新添加下拉箭头
            const arrow = document.createElement('span');
            arrow.textContent = ' ▼';
            arrow.style.marginLeft = '5px';
            mainButton.appendChild(arrow);
        }

        // 更新下拉菜单
        const dropdownMenu = document.getElementById('language-dropdown-menu');
        if (dropdownMenu) {
            // 清空当前菜单
            dropdownMenu.innerHTML = '';
            
            // 重新创建语言选项
            this.supportedLanguages.forEach(langCode => {
                if (langCode !== this.currentLanguage) { // 不显示当前选中的语言
                    const option = document.createElement('button');
                    option.dataset.lang = langCode;
                    option.textContent = this.languages[langCode]?.language_name || langCode;
                    option.style.padding = '8px 16px';
                    option.style.border = 'none';
                    option.style.background = 'transparent';
                    option.style.color = 'white';
                    option.style.fontSize = '14px';
                    option.style.cursor = 'pointer';
                    option.style.transition = 'all 0.3s ease';
                    option.style.textAlign = 'left';
                    option.style.width = '100%';
                    option.style.boxSizing = 'border-box';

                    // 为第一个和最后一个选项添加圆角
                    if (langCode === this.supportedLanguages[0]) {
                        option.style.borderTopLeftRadius = '15px';
                        option.style.borderTopRightRadius = '15px';
                    }
                    if (langCode === this.supportedLanguages[this.supportedLanguages.length - 1]) {
                        option.style.borderBottomLeftRadius = '15px';
                        option.style.borderBottomRightRadius = '15px';
                    }

                    option.addEventListener('mouseenter', () => {
                        option.style.background = 'rgba(255, 255, 255, 0.2)';
                    });

                    option.addEventListener('mouseleave', () => {
                        option.style.background = 'transparent';
                    });

                    option.addEventListener('click', () => {
                        this.changeLanguage(langCode);
                        dropdownMenu.style.display = 'none';
                    });

                    dropdownMenu.appendChild(option);
                }
            });
        }
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