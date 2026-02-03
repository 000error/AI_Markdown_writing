# Markdown Editor Enhanced - 微信公众号风格编辑器

一个功能强大的 Markdown 实时预览编辑器，专为微信公众号文章创作设计。支持自定义 CSS 样式、暗色主题、一键复制到微信等功能。

## ✨ 特性

- 📝 **实时预览** - 左侧编辑，右侧实时显示微信公众号风格的渲染效果
- 🎨 **自定义样式** - 支持加载自定义 CSS 文件，灵活调整文章样式
- 📱 **一键复制** - 直接复制富文本内容到微信公众号编辑器
- 💾 **导出功能** - 支持下载为 HTML 文件或复制 HTML 代码
- 🌓 **主题切换** - 支持亮色/暗色主题，保护眼睛
- 📊 **实时统计** - 显示字数、行数、字符数统计
- 📄 **示例模板** - 内置多种模板（基础示例、完整示例、文章模板、代码文档）
- ⌨️ **快捷键支持** - 提供常用操作的键盘快捷键
- 📐 **响应式设计** - 支持移动端和桌面端访问

## 🚀 快速开始

### 在线使用

1. 下载 `markdown_editor_enhanced.html` 文件
2. 用浏览器打开该文件
3. 开始编辑你的 Markdown 内容

### 本地部署

```bash
# 克隆仓库
git clone https://github.com/000error/markdown_editor_enhanced.git

# 进入目录
cd markdown_editor_enhanced

# 用浏览器打开 HTML 文件
# Windows: start markdown_editor_enhanced.html
# macOS: open markdown_editor_enhanced.html
# Linux: xdg-open markdown_editor_enhanced.html
```

## 📖 使用说明

### 基本操作

1. **编辑 Markdown**
   - 在左侧编辑器中输入 Markdown 内容
   - 右侧会实时显示渲染效果

2. **复制到微信**
   - 点击工具栏的"📱 复制到微信"按钮
   - 直接粘贴到微信公众号编辑器中

3. **加载自定义样式**
   - 点击"🎨 加载CSS"按钮
   - 选择 CSS 文件（如 `custom_large_h1.css` 或 `custom_style_example.css`）
   - 样式会立即应用到预览区

4. **下载 HTML**
   - 点击"💾 下载"按钮
   - 保存为独立的 HTML 文件

5. **切换主题**
   - 点击"🌓 主题"按钮
   - 在亮色和暗色主题之间切换

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + S` | 下载 HTML 文件 |
| `Ctrl/Cmd + Shift + C` | 复制 HTML 代码 |
| `Ctrl/Cmd + D` | 切换主题 |
| `Esc` | 关闭模态框 |

### 自定义 CSS

项目包含两个示例 CSS 文件：

#### 1. custom_large_h1.css
- 将一级标题（H1）大小从 24px 增加到 48px
- 其他样式保持微信公众号默认风格

#### 2. custom_style_example.css
- 紫色主题的标题样式
- 深蓝色渐变的代码块
- 橙色主题的行内代码
- 绿色渐变的引用块
- 彩色表格样式

**使用方法：**
1. 点击"🎨 加载CSS"按钮
2. 选择对应的 CSS 文件
3. 点击"🔄 重置样式"可恢复默认样式

## 📁 文件结构

```
markdown_editor_enhanced/
├── markdown_editor_enhanced.html  # 主程序文件
├── custom_large_h1.css           # 大号标题样式
├── custom_style_example.css      # 彩色主题样式
└── README.md                     # 项目说明文档
```

## 🎯 支持的 Markdown 语法

- ✅ 标题（H1-H6）
- ✅ 粗体、斜体、删除线
- ✅ 有序列表、无序列表
- ✅ 代码块（支持语法高亮）
- ✅ 行内代码
- ✅ 引用块
- ✅ 链接
- ✅ 图片
- ✅ 表格
- ✅ 分割线
- ✅ 上标、下标

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **JavaScript (ES6+)** - 交互逻辑
- **Marked.js** - Markdown 解析库

## 💡 使用场景

1. **微信公众号文章创作**
   - 实时预览微信公众号样式
   - 一键复制到公众号编辑器

2. **技术博客写作**
   - 支持代码高亮
   - 适合技术文档编写

3. **Markdown 学习**
   - 实时预览效果
   - 内置多种示例模板

4. **样式定制**
   - 支持自定义 CSS
   - 灵活调整文章风格

## 🎨 自定义开发

### 创建自定义样式

1. 创建新的 CSS 文件
2. 使用 `.rich_media_content` 作为样式前缀
3. 使用 `!important` 覆盖默认样式（如需要）

示例：

```css
/* 自定义标题颜色 */
.rich_media_content h1 {
  color: #ff6b6b !important;
  font-size: 32px !important;
}

/* 自定义代码块背景 */
.rich_media_content pre {
  background: #2d2d2d !important;
}
```

### 修改默认样式

编辑 `markdown_editor_enhanced.html` 文件中的 `<style>` 标签内容。

## 📝 示例模板

编辑器内置了 4 种示例模板：

1. **🎯 基础示例** - 包含常用的标题、段落、列表等基础格式
2. **📚 完整示例** - 展示所有支持的 Markdown 元素
3. **📝 文章模板** - 适合写技术博客或文章的模板
4. **💻 代码文档** - 包含代码块和技术说明的模板

点击工具栏的"📄 示例"按钮即可加载。

## 🔧 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请通过 GitHub Issues 联系。

## 🙏 致谢

- [Marked.js](https://marked.js.org/) - Markdown 解析库
- 微信公众号 - 样式参考

---

**Made with ❤️ for WeChat Official Account Writers**
