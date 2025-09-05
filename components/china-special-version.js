class ChinaSpecialVersionModal{constructor(){this.modalId='china-special-version-modal';this.modal=null;this.isModalCreated=false;}init(){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>this.createModal());}else{this.createModal();}}createModal(){if(this.isModalCreated)return;const overlay=document.createElement('div');overlay.id=this.modalId;overlay.className='modal-overlay';overlay.innerHTML=`
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
    `;document.body.appendChild(overlay);this.modal=overlay;this.isModalCreated=true;this.addCloseEvent();this.listenForSplashScreenEnd();}listenForSplashScreenEnd(){const loadingScreen=document.getElementById('loading-screen');if(loadingScreen){const checkIfVisible=()=>{if(loadingScreen.classList.contains('hidden')){setTimeout(()=>this.showModal(),300);}else{requestAnimationFrame(checkIfVisible);}};setTimeout(()=>this.showModal(),3000);requestAnimationFrame(checkIfVisible);}else{setTimeout(()=>this.showModal(),1000);}}showModal(){if(!this.modal)return;this.modal.classList.add('active');document.body.style.overflow='hidden';}addCloseEvent(){const closeButton=document.getElementById('close-modal-btn');if(closeButton){closeButton.addEventListener('click',()=>this.hideModal());}this.modal.addEventListener('click',(e)=>{if(e.target===this.modal){this.hideModal();}});document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&this.modal.classList.contains('active')){this.hideModal();}});}hideModal(){if(!this.modal)return;this.modal.classList.remove('active');document.body.style.overflow='';setTimeout(()=>{if(document.contains(this.modal)){}},300);}}document.addEventListener('DOMContentLoaded',()=>{const chinaModal=new ChinaSpecialVersionModal();chinaModal.init();});