// 检测CDN可用性并设置背景图片
function setupBackground() {
    const cdnImageUrl = 'https://s1.img-e.com/20251110/691205c80c1e1.webp';
    const localImageUrl = './pic/background.webp';
    
    // 创建一个Image对象来测试CDN图片是否可用
    const img = new Image();
    
    // 设置成功加载的回调
    img.onload = function() {
        // 如果CDN图片加载成功，使用CDN图片并设置自适应样式
        document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${cdnImageUrl}')`;
        setBackgroundStyles();
    };
    
    // 设置加载失败的回调
    img.onerror = function() {
        // 如果CDN图片加载失败，使用本地图片并设置自适应样式
        document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${localImageUrl}')`;
        setBackgroundStyles();
    };
    
    // 设置背景图片的自适应样式
    function setBackgroundStyles() {
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = '30% 20%';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
    }
    
    // 尝试加载CDN图片
    img.src = cdnImageUrl;
}

// 当DOM加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupBackground);
} else {
    // 如果DOM已经加载完成，直接执行
    setupBackground();
}