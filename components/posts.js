document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container');
    
    // 贴文数据存储 - 不再硬编码初始数据
    let posts = JSON.parse(localStorage.getItem('posts')) || [];

    // 保存贴文到本地存储
    function savePosts() {
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    // 渲染贴文列表
    function renderPosts() {
        postsContainer.innerHTML = '';
        
        // 添加新贴文按钮
        const addButton = document.createElement('button');
        addButton.className = 'add-post-btn';
        addButton.innerHTML = '✨ 添加新贴文';
        addButton.onclick = showAddPostForm;
        postsContainer.appendChild(addButton);

        // 如果没有贴文，显示提示信息
        if (posts.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-posts';
            emptyMessage.innerHTML = `
                <p class="info-text">还没有贴文哦～</p>
                <p class="info-text">点击上方按钮创建第一条贴文吧！(◕‿◕✿)</p>
            `;
            postsContainer.appendChild(emptyMessage);
            return;
        }

        // 渲染贴文
        posts.sort((a, b) => b.timestamp - a.timestamp).forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            
            // 构建贴文内容
            let postContent = `
                <div class="post-header">
                    <h4>${post.title}</h4>
                    <div class="post-actions">
                        <button class="edit-btn" onclick="editPost(${post.id})">✏️</button>
                        <button class="delete-btn" onclick="deletePost(${post.id})">🗑️</button>
                    </div>
                </div>
                <p class="post-content">${post.content}</p>
            `;
            
            // 如果有图片，添加图片显示
            if (post.images && post.images.length > 0) {
                postContent += '<div class="post-images">';
                post.images.forEach(image => {
                    postContent += `<img src="${image.url}" alt="${image.name}" class="post-image" onclick="viewImage('${image.url}')">`;
                });
                postContent += '</div>';
            }
            
            // 如果有文件，添加文件列表
            if (post.files && post.files.length > 0) {
                postContent += '<div class="post-files">';
                post.files.forEach(file => {
                    postContent += `
                        <div class="file-item">
                            <span class="file-icon">📎</span>
                            <a href="${file.url}" download="${file.name}" class="file-link">${file.name}</a>
                            <span class="file-size">(${formatFileSize(file.size)})</span>
                        </div>
                    `;
                });
                postContent += '</div>';
            }
            
            postContent += `<span class="post-date">${post.date}</span>`;
            postElement.innerHTML = postContent;
            postsContainer.appendChild(postElement);
        });
    }

    // 显示添加贴文表单
    function showAddPostForm() {
        const form = document.createElement('div');
        form.className = 'post-form';
        form.innerHTML = `
            <h4>✨ 新贴文</h4>
            <input type="text" id="post-title" placeholder="标题" maxlength="50">
            <textarea id="post-content" placeholder="内容" maxlength="500"></textarea>
            <div class="file-upload-section">
                <label for="post-images" class="file-upload-label">
                    🖼️ 添加图片
                    <input type="file" id="post-images" multiple accept="image/*" style="display: none;">
                </label>
                <label for="post-files" class="file-upload-label">
                    📎 添加文件
                    <input type="file" id="post-files" multiple style="display: none;">
                </label>
            </div>
            <div id="file-preview"></div>
            <div class="form-actions">
                <button onclick="addPost()">发布</button>
                <button onclick="cancelForm()">取消</button>
            </div>
        `;
        postsContainer.insertBefore(form, postsContainer.firstChild);
        
        // 添加文件选择事件监听
        document.getElementById('post-images').addEventListener('change', handleImageSelect);
        document.getElementById('post-files').addEventListener('change', handleFileSelect);
    }

    // 添加贴文
    window.addPost = function() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        
        if (!title || !content) {
            alert('请填写标题和内容！');
            return;
        }

        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            date: new Date().toLocaleDateString('zh-CN'),
            timestamp: Date.now(),
            images: window.selectedImages || [],
            files: window.selectedFiles || []
        };

        posts.push(newPost);
        savePosts();
        
        // 清理临时文件数据
        window.selectedImages = [];
        window.selectedFiles = [];
        
        renderPosts();
    };

    // 编辑贴文
    window.editPost = function(id) {
        const post = posts.find(p => p.id === id);
        if (!post) return;

        const form = document.createElement('div');
        form.className = 'post-form';
        form.innerHTML = `
            <h4>✏️ 编辑贴文</h4>
            <input type="text" id="edit-title" value="${post.title}" maxlength="50">
            <textarea id="edit-content" maxlength="500">${post.content}</textarea>
            <div class="form-actions">
                <button onclick="updatePost(${id})">更新</button>
                <button onclick="cancelForm()">取消</button>
            </div>
        `;
        postsContainer.insertBefore(form, postsContainer.firstChild);
    };

    // 更新贴文
    window.updatePost = function(id) {
        const title = document.getElementById('edit-title').value.trim();
        const content = document.getElementById('edit-content').value.trim();
        
        if (!title || !content) {
            alert('请填写标题和内容！');
            return;
        }

        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex !== -1) {
            posts[postIndex].title = title;
            posts[postIndex].content = content;
            posts[postIndex].date = new Date().toLocaleDateString('zh-CN') + ' (已编辑)';
            savePosts();
            renderPosts();
        }
    };

    // 删除贴文
    window.deletePost = function(id) {
        if (confirm('确定要删除这条贴文吗？')) {
            posts = posts.filter(p => p.id !== id);
            savePosts();
            renderPosts();
        }
    };

    // 取消表单
    window.cancelForm = function() {
        const form = document.querySelector('.post-form');
        if (form) {
            form.remove();
        }
    };

    // 初始化渲染
    renderPosts();
});


    // 文件处理相关函数
    window.selectedImages = [];
    window.selectedFiles = [];

    // 处理图片选择
    function handleImageSelect(event) {
        const files = Array.from(event.target.files);
        const preview = document.getElementById('file-preview');
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageData = {
                        name: file.name,
                        url: e.target.result,
                        size: file.size,
                        type: file.type
                    };
                    window.selectedImages.push(imageData);
                    
                    // 添加预览
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}" class="preview-image">
                        <span class="preview-name">${file.name}</span>
                        <button class="remove-preview" onclick="removeImage(${window.selectedImages.length - 1})">×</button>
                    `;
                    preview.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 处理文件选择
    function handleFileSelect(event) {
        const files = Array.from(event.target.files);
        const preview = document.getElementById('file-preview');
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileData = {
                    name: file.name,
                    url: e.target.result,
                    size: file.size,
                    type: file.type
                };
                window.selectedFiles.push(fileData);
                
                // 添加预览
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item file-preview';
                previewItem.innerHTML = `
                    <span class="file-icon">📎</span>
                    <span class="preview-name">${file.name}</span>
                    <span class="file-size">(${formatFileSize(file.size)})</span>
                    <button class="remove-preview" onclick="removeFile(${window.selectedFiles.length - 1})">×</button>
                `;
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }

    // 移除图片预览
    window.removeImage = function(index) {
        window.selectedImages.splice(index, 1);
        updatePreview();
    };

    // 移除文件预览
    window.removeFile = function(index) {
        window.selectedFiles.splice(index, 1);
        updatePreview();
    };

    // 更新预览显示
    function updatePreview() {
        const preview = document.getElementById('file-preview');
        if (!preview) return;
        
        preview.innerHTML = '';
        
        // 重新显示图片预览
        window.selectedImages.forEach((image, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${image.url}" alt="${image.name}" class="preview-image">
                <span class="preview-name">${image.name}</span>
                <button class="remove-preview" onclick="removeImage(${index})">×</button>
            `;
            preview.appendChild(previewItem);
        });
        
        // 重新显示文件预览
        window.selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item file-preview';
            previewItem.innerHTML = `
                <span class="file-icon">📎</span>
                <span class="preview-name">${file.name}</span>
                <span class="file-size">(${formatFileSize(file.size)})</span>
                <button class="remove-preview" onclick="removeFile(${index})">×</button>
            `;
            preview.appendChild(previewItem);
        });
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 查看图片
    window.viewImage = function(url) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="closeModal()">&times;</span>
                <img src="${url}" alt="查看图片" class="modal-image">
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeModal();
            }
        };
    };

    // 关闭模态框
    window.closeModal = function() {
        const modal = document.querySelector('.image-modal');
        if (modal) {
            modal.remove();
        }
    };

