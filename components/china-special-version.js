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
          <h2 class="modal-title">合规声明 / Compliance Statement</h2>
        </div>
        <div class="modal-body">
          <p>您当前访问的是自介网站为中国大陆用户提供的特别版本，该版本遵循相关法律法规要求。</p>
          <p>You are currently accessing the special version of our website provided for users in mainland China in compliance with the relevant laws and regulations.</p>
          <p>根据要求，此版本不会收集、传输或分析您的任何数据，请放心使用。</p>
          <p>As required, this version does not collect, transmit, or analyze any of your data. Please use it with confidence.</p>
          <p>如果您的地理位置位于中国大陆，请使用此版本。国际版网站（提供多语言服务）暂不适用于中国大陆用户。</p>
          <p>If you are located in mainland China, please use this version. The international website (which offers multi-language services) is currently not available for users within mainland China.</p>
          <p>若您有任何问题或建议，请联系我们。</p>
          <p>If you have any questions or suggestions, please contact us.</p>
        </div>
        <div class="modal-footer">
          <button class="modal-button" id="close-modal-btn">我知道了 / Understood</button>
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