const fs = require('fs');
const path = require('path');

// 配置项
const config = {
  inputHtml: 'index.html',
  outputHtml: 'dist/index.html',
  baseDir: __dirname
};

// 确保输出目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 读取文件内容
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// 将文件转换为data URI
function fileToDataUri(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath);
  const base64 = content.toString('base64');

  // 根据文件扩展名设置MIME类型
  const mimeTypes = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf'
  };

  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  return `data:${mimeType};base64,${base64}`;
}

// 内联CSS文件
function inlineCss(html) {
  // 匹配<link rel="stylesheet" href="...">标签
  const cssRegex = /<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/g;
  return html.replace(cssRegex, (match, href) => {
    const cssPath = path.join(config.baseDir, href);
    if (fs.existsSync(cssPath)) {
      const cssContent = readFile(cssPath);
      return `<style>${cssContent}</style>`;
    }
    return match; // 如果文件不存在，保留原标签
  });
}

// 内联JavaScript文件
function inlineJs(html) {
  // 匹配<script>标签，支持带有type等属性的情况
  const jsRegex = /<script\s+[^>]*src="([^"]+)"[^>]*><\/script>/g;
  return html.replace(jsRegex, (match, src) => {
    const jsPath = path.join(config.baseDir, src);
    if (fs.existsSync(jsPath)) {
      const jsContent = readFile(jsPath);
      // 保留原始script标签的type属性
      const typeMatch = match.match(/type="([^"]+)"/);
      const typeAttr = typeMatch ? ` type="${typeMatch[1]}"` : '';
      return `<script${typeAttr}>${jsContent}</script>`;
    }
    return match; // 如果文件不存在，保留原标签
  });
}

// 内联图片和字体等资源
function inlineAssets(html) {
  // 匹配图片路径
  const imgRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
  html = html.replace(imgRegex, (match, src) => {
    if (src.startsWith('data:')) return match; // 已经是data URI
    const imgPath = path.join(config.baseDir, src);
    if (fs.existsSync(imgPath)) {
      const dataUri = fileToDataUri(imgPath);
      return match.replace(src, dataUri);
    }
    return match;
  });

  // 匹配CSS中的@font-face规则中的字体文件
  const fontFaceRegex = /@font-face\s*\{[^}]*src:\s*url\((['"]?)([^'"\)]+)\1\)(?:\s*format\([^)]+\))?/g;
  html = html.replace(fontFaceRegex, (match, quote, url) => {
    if (url.startsWith('data:')) return match; // 已经是data URI
    
    // 处理相对路径，考虑到CSS文件可能在components目录
    let fontPath;
    if (url.startsWith('../fonts/')) {
      // 对于从components目录引用的字体，直接使用项目根目录下的fonts
      fontPath = path.join(config.baseDir, 'fonts', path.basename(url));
    } else {
      // 其他情况使用正常解析
      fontPath = path.resolve(config.baseDir, url);
    }
    
    console.log(`Trying to inline font: ${fontPath}`);
    if (fs.existsSync(fontPath)) {
      console.log(`Successfully inlined font: ${fontPath}`);
      const dataUri = fileToDataUri(fontPath);
      return match.replace(url, dataUri);
    } else {
      console.log(`Font file not found: ${fontPath}`);
    }
    return match;
  });

  // 匹配CSS中的其他url()资源
  const cssUrlRegex = /url\((['"]?)([^'"\)]+)\1\)/g;
  html = html.replace(cssUrlRegex, (match, quote, url) => {
    if (url.startsWith('data:')) return match; // 已经是data URI
    if (url.startsWith('http://') || url.startsWith('https://')) return match; // 外部资源
    
    // 处理资源路径
    let resourcePath = path.join(config.baseDir, url);
    
    // 如果是字体文件且路径中没有明确的字体文件夹，尝试从fonts目录查找
    const fontExts = ['.woff2', '.woff', '.ttf', '.otf'];
    const ext = path.extname(url).toLowerCase();
    if (fontExts.includes(ext) && !url.includes('fonts') && !fs.existsSync(resourcePath)) {
      resourcePath = path.join(config.baseDir, 'fonts', path.basename(url));
    }
    
    if (fs.existsSync(resourcePath)) {
      const dataUri = fileToDataUri(resourcePath);
      return `url(${dataUri})`;
    }
    
    // 如果找不到文件，尝试从根目录再找一次
    const rootResourcePath = path.join(config.baseDir, url);
    if (fs.existsSync(rootResourcePath)) {
      const dataUri = fileToDataUri(rootResourcePath);
      return `url(${dataUri})`;
    }
    
    return match;
  });

  // 匹配SVG图片路径
  const svgRegex = /src="([^"]+\.svg)"/g;
  html = html.replace(svgRegex, (match, src) => {
    if (src.startsWith('data:')) return match; // 已经是data URI
    const svgPath = path.join(config.baseDir, src);
    if (fs.existsSync(svgPath)) {
      const dataUri = fileToDataUri(svgPath);
      return match.replace(src, dataUri);
    }
    return match;
  });

  return html;
}

// 压缩HTML代码
function minifyHtml(html) {
  // 移除注释
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // 移除多余空白
  html = html.replace(/\s+/g, ' ');
  
  // 移除标签间的空白
  html = html.replace(/>\s+</g, '><');
  
  // 压缩内联CSS
  html = html.replace(/<style>([\s\S]*?)<\/style>/g, (match, css) => {
    // 移除CSS注释
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    // 移除多余空白
    css = css.replace(/\s+/g, ' ');
    // 移除花括号前后的空白
    css = css.replace(/\s*\{\s*/g, '{');
    css = css.replace(/\s*\}\s*/g, '}');
    // 移除冒号和分号前后的空白
    css = css.replace(/\s*:\s*/g, ':');
    css = css.replace(/\s*;\s*/g, ';');
    // 移除逗号前后的空白
    css = css.replace(/\s*,\s*/g, ',');
    return `<style>${css}</style>`;
  });
  
  // 压缩内联JS
  html = html.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (match, attrs, js) => {
    // 移除JS注释
    js = js.replace(/\/\/.*$/gm, '');
    js = js.replace(/\/\*[\s\S]*?\*\//g, '');
    // 移除多余空白
    js = js.replace(/\s+/g, ' ');
    // 移除行首和行尾的空白
    js = js.replace(/^\s+|\s+$/gm, '');
    // 如果JS内容为空，则不返回该标签
    if (!js.trim()) {
      return '';
    }
    return `<script${attrs}>${js}</script>`;
  });
  
  // 移除空的script标签
  html = html.replace(/<script\s*><\/script>/g, '');
  
  return html;
}

// 构建单文件HTML
function buildSingleFileHtml() {
  try {
    // 读取输入HTML文件
    const html = readFile(path.join(config.baseDir, config.inputHtml));

    // 内联CSS、JS和资源
    let processedHtml = inlineCss(html);
    processedHtml = inlineJs(processedHtml);
    processedHtml = inlineAssets(processedHtml);
    
    // 压缩HTML代码
    processedHtml = minifyHtml(processedHtml);

    // 确保输出目录存在
    ensureDir(path.dirname(config.outputHtml));

    // 写入输出文件
    fs.writeFileSync(config.outputHtml, processedHtml);

    console.log(`✅ 单文件HTML构建成功: ${config.outputHtml}`);
    console.log(`✅ 代码已压缩`);
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 执行构建
buildSingleFileHtml();