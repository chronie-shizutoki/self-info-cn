/**
 * 更新日志管理模块
 * 负责加载、解析和显示存储在JSON文件中的更新日志
 */
class UpdateLogsManager {
    constructor() {
        this.logs = [];
        this.initialized = false;
        this.updateTimeout = null; // 用于防抖动的计时器
        this.init();
    }

    async init() {
        try {
            // 加载更新日志JSON文件，添加5秒超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
            
            const response = await fetch('components/update_logs.json', { 
                signal: controller.signal, 
                cache: 'no-cache' // 检查服务器是否有更新版本
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            this.logs = data.logs || [];
            this.logs.sort((a, b) => new Date(b.date) - new Date(a.date)); // 按日期降序排列
            
            // 保存翻译数据
            this.translations = data.translations || {
                'zh-CN': {},
                'zh-TW': {},
                'en': {},
                'ja': {},
                'ko': {}
            };
            
            // 监听语言切换事件
            this.setupLanguageListener();
            
            // 初始化更新日志显示
            this.updateLogDisplay();
            
            this.initialized = true;
        } catch (error) {
            console.error('加载更新日志失败:', error);
            // 显示错误信息，使用i18n翻译
            const updateInfoElement = document.getElementById('update-info');
            if (updateInfoElement) {
                const errorText = window.i18n ? window.i18n.translate('update_log_load_failed') || '加载更新日志失败' : '加载更新日志失败';
                updateInfoElement.textContent = errorText;
            }
        }
    }

    setupLanguageListener() {
        // 监听i18n的语言切换事件
        document.addEventListener('languageChanged', () => {
            this.debouncedUpdateDisplay();
        });
        
        // 监听DOM变化，当i18n更新update-info元素时重新应用我们的日志显示
        const updateInfoElement = document.getElementById('update-info');
        if (updateInfoElement) {
            const observer = new MutationObserver(() => {
                if (this.initialized && !this.isUpdating) {
                    this.debouncedUpdateDisplay();
                }
            });
            observer.observe(updateInfoElement, { childList: true, characterData: true });
        }
    }
    
    // 防抖动方法，避免频繁更新
    debouncedUpdateDisplay() {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        this.updateTimeout = setTimeout(() => {
            this.updateLogDisplay();
            
            // 关闭已打开的日志模态框，以便下次打开时使用新的语言
            const openModal = document.querySelector('[id^="update-log-modal-"]');
            if (openModal && openModal.parentNode) {
                const modal = openModal.closest('div[id^="update-log-modal-"]') || openModal.parentNode;
                if (modal && document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }
        }, 50);
    }

    updateLogDisplay() {
        // 设置更新标志，防止触发MutationObserver的无限循环
        this.isUpdating = true;
        
        try {
            const updateInfoElement = document.getElementById('update-info');
            if (!updateInfoElement) return;
            
            // 获取最新的日志
            const latestLog = this.logs[0];
            if (!latestLog) {
                // 如果有i18n，使用翻译，否则使用默认文本
                const noLogsText = window.i18n ? window.i18n.translate('no_update_logs') || '暂无更新日志' : '暂无更新日志';
                updateInfoElement.textContent = noLogsText;
                return;
            }
            
            // 格式化日期显示
            const formattedDate = this.formatDate(latestLog.date);
            
            // 如果有i18n，尝试获取翻译后的格式
            let displayText = `✨ ${formattedDate} | v${latestLog.version} ✨`;
            if (window.i18n) {
                displayText = `✨ ${formattedDate} | v${latestLog.version} ✨`;
            }
            
            // 更新显示文本
            updateInfoElement.textContent = displayText;
            
            // 添加点击事件以显示完整日志
            updateInfoElement.onclick = () => this.showFullLogs();
            updateInfoElement.style.cursor = 'pointer';
        } finally {
            // 使用setTimeout确保DOM更新完成后再清除标志
            setTimeout(() => {
                this.isUpdating = false;
            }, 0);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        // 如果有i18n，根据当前语言设置日期格式
        if (window.i18n && window.i18n.currentLanguage) {
            const lang = window.i18n.currentLanguage;
            if (lang === 'zh-CN' || lang === 'zh-TW') {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${year}年${month}月${day}日`;
            } else if (lang === 'ja') {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${year}年${month}月${day}日`;
            } else if (lang === 'ko') {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${year}년 ${month}월 ${day}일`;
            } else {
                // 默认使用英文格式
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }
        }
        // 默认格式（中文）
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    }

    showFullLogs() {
        // 创建文档片段以减少DOM操作
        const fragment = document.createDocumentFragment();
        
        // 创建日志显示模态框
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
        `;
        
        // 创建模态框内容
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            position: relative;
            border-radius: 24px;
            padding: 25px;
            max-width: 600px;
            max-height: 80vh;
            overflow-x: hidden; /* 禁止横向滚动 */
            overflow-y: auto; /* 允许垂直滚动 */
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(2px) saturate(120%);
            -webkit-backdrop-filter: blur(2px) saturate(120%);
            box-shadow: 
                inset 0 0 0 1px rgba(255, 255, 255, 0.25),
                0 8px 32px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.08);
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            /* 自定义滚动条 */
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1);
            /* 确保尺寸计算正确 */
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        `;
        
        // 创建一个唯一的ID用于样式选择器
        const uniqueId = 'update-log-modal-' + Date.now();
        modalContent.id = uniqueId;
        
        // 创建样式元素来添加Webkit滚动条样式
        const style = document.createElement('style');
        style.textContent = `
            #${uniqueId}::-webkit-scrollbar {
                width: 8px;
            }
            #${uniqueId}::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 4px;
            }
            #${uniqueId}::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
            }
            #${uniqueId}::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
        `;
        document.head.appendChild(style);
        
        // 在模态框关闭时移除样式
        modal.addEventListener('click', () => {
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        });
        
        // 添加液态玻璃效果的光晕层
        const glowLayer = document.createElement('div');
        glowLayer.style.cssText = `
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 25% 25%, 
                rgba(100, 150, 255, 0.25), 
                rgba(255, 200, 220, 0.15), 
                transparent 40%);
            transform-origin: center center;
            opacity: 0.6;
            pointer-events: none;
            z-index: 0;
        `;
        modalContent.appendChild(glowLayer);
        
        // 添加材质噪点层
        const noiseLayer = document.createElement('div');
        noiseLayer.style.cssText = `
            content: '';
            position: absolute;
            inset: 0;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.03"/></svg>');
            pointer-events: none;
            opacity: 0.8;
            z-index: 0;
        `;
        modalContent.appendChild(noiseLayer);
        
        // 创建内容容器，确保内容在图层之上
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            position: relative;
            z-index: 1;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        `;
        
        // 获取多语言文本
        const modalTitle = window.i18n ? window.i18n.translate('update_logs_title') || '📝 更新日志' : '📝 更新日志';
        const closeButtonText = window.i18n ? window.i18n.translate('close_button') || '关闭' : '关闭';
        
        // 创建标题
        const title = document.createElement('h2');
        title.textContent = modalTitle;
        title.style.cssText = `
            color: #fff;
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
            font-size: 24px;
            padding-right: 40px; /* 为右上角的关闭按钮留出空间 */
        `;
        
        // 创建日志列表
        const logsContainer = document.createElement('div');
        logsContainer.style.cssText = `
            margin-bottom: 20px;
            width: 100%;
            box-sizing: border-box;
            word-wrap: break-word;
            overflow-wrap: break-word;
        `;
        
        // 为每个日志条目创建显示内容
            this.logs.forEach((log, index) => {
                const logEntry = document.createElement('div');
                logEntry.style.cssText = `
                    margin-bottom: 25px;
                    padding-bottom: 20px;
                    ${index < this.logs.length - 1 ? 'border-bottom: 1px solid #eee;' : ''}
                `;
                
                const logHeader = document.createElement('h3');
                const formattedDate = this.formatDate(log.date);
                
                // 获取版本前缀的翻译
                let versionPrefix = 'v';
                if (window.i18n) {
                    versionPrefix = window.i18n.translate('version_prefix') || 'v';
                }
                
                logHeader.textContent = `${formattedDate} (${versionPrefix}${log.version})`;
                logHeader.style.cssText = `
                    color: #ff6b6b;
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 18px;
                `;
                
                const changesList = document.createElement('ul');
                changesList.style.cssText = `
                    color: #555;
                    margin: 0;
                    padding-left: 20px;
                `;
                
                log.changes.forEach(change => {
                    const changeItem = document.createElement('li');
                    
                    // 获取翻译后的内容
                    let translatedChange = change;
                    
                    // 检查是否有翻译数据
                    if (this.translations && window.i18n && window.i18n.currentLanguage) {
                        const lang = window.i18n.currentLanguage;
                        if (this.translations[lang] && this.translations[lang][change]) {
                            translatedChange = this.translations[lang][change];
                        } else if (this.translations['zh-CN'] && this.translations['zh-CN'][change]) {
                            // 如果当前语言没有翻译，使用默认的中文翻译
                            translatedChange = this.translations['zh-CN'][change];
                        }
                    }
                    
                    changeItem.textContent = translatedChange;
                    changeItem.style.marginBottom = '5px';
                    changesList.appendChild(changeItem);
                });
            
            logEntry.appendChild(logHeader);
            logEntry.appendChild(changesList);
            logsContainer.appendChild(logEntry);
        });
        
        // 创建关闭按钮并放置在右上角
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            background-color: rgba(255, 107, 107, 0.8);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            font-weight: 500;
            position: absolute;
            top: 15px;
            right: 15px;
            z-index: 2;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
        `;
        
        // 使用更高效的事件处理
        closeButton.addEventListener('mouseover', () => closeButton.style.backgroundColor = '#ee5253');
        closeButton.addEventListener('mouseout', () => closeButton.style.backgroundColor = '#ff6b6b');
        closeButton.addEventListener('click', () => {
            if (modal && document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
        
        // 组装模态框内容
        contentContainer.appendChild(title);
        contentContainer.appendChild(logsContainer);
        modalContent.appendChild(contentContainer);
        modalContent.appendChild(closeButton); // 关闭按钮使用绝对定位，应添加到modalContent中
        modal.appendChild(modalContent);
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal && document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
        
        // 添加到文档片段
        fragment.appendChild(modal);
        
        // 一次性添加到文档中以减少重排
        requestAnimationFrame(() => {
            document.body.appendChild(fragment);
        });
    }
}

// 当DOM加载完成后初始化更新日志管理器
document.addEventListener('DOMContentLoaded', () => {
    // 使用setTimeout异步初始化，避免阻塞主线程
    setTimeout(() => {
        // 检查i18n是否存在且已初始化
        if (!window.i18n || window.i18n.initialized) {
            window.updateLogsManager = new UpdateLogsManager();
        } else {
            // 等待i18n初始化完成，但设置最大等待时间
            let attempts = 0;
            const maxAttempts = 10;
            const checkI18nLoaded = setInterval(() => {
                attempts++;
                if (window.i18n && window.i18n.initialized || attempts >= maxAttempts) {
                    clearInterval(checkI18nLoaded);
                    if (!window.updateLogsManager) {
                        window.updateLogsManager = new UpdateLogsManager();
                    }
                }
            }, 100);
        }
    }, 0);
});