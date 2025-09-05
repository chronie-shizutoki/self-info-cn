// 中国特别版本弹窗组件
class ChinaSpecialVersionModal {
  constructor() {
    this.modalId = 'china-special-version-modal';
    this.modal = null;
    this.isModalCreated = false;
  }

  // 初始化弹窗
  init() {
    // 确保DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createModal());
    } else {
      this.createModal();
    }
  }

  // 创建弹窗HTML结构
  createModal() {
    if (this.isModalCreated) return;

    // 创建弹窗覆盖层
    const overlay = document.createElement('div');
    overlay.id = this.modalId;
    overlay.className = 'modal-overlay';
    
    // 创建弹窗内容
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">特别版本提示/Special Version</h2>
        </div>
        <div class="modal-body">
          <p>您当前访问的是自介网站的中国大陆特别版本</p>
          <p>You are currently accessing the special version of the self-introduction website for mainland China.</p>
          <p>此版本不会收集、传输或分析您的任何数据，请放心使用。</p>
          <p>This version will not collect, transmit, or analyze any of your data. Please use it with confidence.</p>
          <p>其他语言（英语、日语、繁体中文等）暂不适用。</p>
          <p>Other languages (English, Japanese, Traditional Chinese, etc.) are not available for this version currently.</p>
          <p>若您地理位置未在中国大陆区域，并希望访问国际版多语言网站，请手动访问国际版网站：</p>
          <p>If you are not located in mainland China and wish to access the international multi-language website, please manually visit the international version:</p>
          <p style="text-align: center;">https://chronie-shizutoki.github.io/self-info-ja/</p>
          <p>若您地理位置位于中国大陆区域，您只能使用此特别版本。</p>
          <p>If you are located in mainland China, you can only use this special version.</p>
          <p>若您有任何问题或建议，请联系我们。</p>
          <p>If you have any questions or suggestions, please contact us.</p>
        </div>
        <div class="modal-footer">
          <button class="modal-button" id="close-modal-btn">我知道了/Understood</button>
        </div>
      </div>
    `;

    // 添加到body
    document.body.appendChild(overlay);
    this.modal = overlay;
    this.isModalCreated = true;

    // 添加关闭事件
    this.addCloseEvent();

    // 监听少女祈祷动画结束事件
    this.listenForSplashScreenEnd();
  }

  // 监听加载动画结束
  listenForSplashScreenEnd() {
    // 检查是否已有loading-screen元素
    const loadingScreen = document.getElementById('loading-screen');
    
    if (loadingScreen) {
      // 使用更可靠的方式检测动画结束
      // 添加过渡结束事件监听
      const checkIfVisible = () => {
        if (loadingScreen.classList.contains('hidden')) {
          // 延迟一小段时间确保动画完全结束
          setTimeout(() => this.showModal(), 300);
        } else {
          // 继续检查
          requestAnimationFrame(checkIfVisible);
        }
      };
      
      // 同时设置超时作为后备方案
      setTimeout(() => this.showModal(), 3000);
      
      // 开始主动检查
      requestAnimationFrame(checkIfVisible);
    } else {
      // 如果没有找到加载屏幕，在页面加载后1秒显示弹窗
      setTimeout(() => this.showModal(), 1000);
    }
  }

  // 显示弹窗
  showModal() {
    if (!this.modal) return;
    this.modal.classList.add('active');
    
    // 防止页面滚动
    document.body.style.overflow = 'hidden';
  }

  // 添加关闭事件
  addCloseEvent() {
    const closeButton = document.getElementById('close-modal-btn');
    
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hideModal());
    }

    // 点击弹窗外部也可以关闭
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });

    // 按ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.hideModal();
      }
    });
  }

  // 隐藏弹窗
  hideModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    
    // 恢复页面滚动
    document.body.style.overflow = '';
    
    // 动画结束后可以选择移除弹窗
    setTimeout(() => {
      if (document.contains(this.modal)) {
        // 这里可以选择不移除弹窗，以便将来需要时重新显示
        // this.modal.remove();
        // this.isModalCreated = false;
        // this.modal = null;
      }
    }, 300);
  }
}

// 页面加载时初始化弹窗
document.addEventListener('DOMContentLoaded', () => {
  // 创建弹窗实例
  const chinaModal = new ChinaSpecialVersionModal();
  chinaModal.init();
});