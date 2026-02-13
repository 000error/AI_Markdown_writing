# AI Markdown Writing - 智能内容创作工具

<div align="center">

一个强大的 Markdown 编辑器，集成 AI 内容生成功能，专为微信公众号、知乎等平台优化。

[快速开始](#快速开始) | [功能特性](#功能特性) | [使用指南](#使用指南)

</div>

## ✨ 功能特性

### 📝 实时编辑与预览
- **左右分屏设计**：编辑区和预览区各占50%，空间利用率高
- **实时渲染**：Markdown 内容实时转换为富文本预览
- **性能优化**：防抖处理，输入流畅不卡顿

### 🎨 格式化工具栏
快速插入常用 Markdown 格式：
- 标题（H1-H3）
- 文本样式（粗体、斜体、删除线）
- 引用、代码、代码块
- 列表（有序、无序、任务列表）
- 链接、图片、表格、分割线

### 🤖 AI 内容生成
- **多风格变体**：基于原文生成不同风格的内容
- **自定义提示词**：灵活配置 AI 生成规则
- **OpenAI 兼容**：支持所有兼容 OpenAI API 格式的服务
  - OpenAI (GPT-4, GPT-3.5)
  - DeepSeek
  - 通义千问
  - ModelGate
  - 其他兼容服务

### 📱 一键复制到微信公众号
- **内联样式转换**：自动将 CSS 转换为内联样式
- **完美兼容**：复制后直接粘贴到微信公众号编辑器
- **样式保留**：标题、段落、代码、引用等样式完整保留

### 🎯 其他功能
- **示例模板**：内置基础、完整、文章、代码等多种模板
- **自定义 CSS**：支持加载本地 CSS 文件
- **主题切换**：支持亮色/暗色主题
- **图片粘贴**：直接粘贴图片到编辑器

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/000error/AI_Markdown_writing.git

# 进入项目目录
cd AI_Markdown_writing

# 安装依赖
npm install
```

### 运行

```bash
# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用。

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## ⚙️ 配置 API

1. 点击左侧工具栏的"设置"按钮
2. 配置 API 信息：
   - **API URL**：API 端点地址（如 `https://api.openai.com/v1/chat/completions`）
   - **API Key**：你的 API 密钥
   - **模型名称**：使用的模型（如 `gpt-4o`、`deepseek-chat` 等）
3. 保存配置

### 常用 API 配置示例

**OpenAI:**
```
URL: https://api.openai.com/v1/chat/completions
Model: gpt-4o 或 gpt-3.5-turbo
```

**DeepSeek:**
```
URL: https://api.deepseek.com/v1/chat/completions
Model: deepseek-chat
```

**通义千问:**
```
URL: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
Model: qwen-plus 或 qwen-turbo
```

**ModelGate:**
```
URL: https://mg.aid.pub/v1/chat/completions
Model: gpt-4o 或 gpt-5-nano
```

## 📖 使用指南

### 基础编辑
1. 在左侧编辑区输入 Markdown 内容
2. 右侧实时预览渲染效果
3. 使用工具栏快速插入格式

### AI 生成内容
1. 在基础内容区输入原文
2. 点击"新增风格变体"
3. 编辑提示词（如"改写为小红书风格"）
4. 点击魔法棒图标生成内容

### 复制到微信公众号
1. 编辑完成后，点击右上角"Copy"按钮
2. 打开微信公众号编辑器
3. 直接粘贴（Ctrl+V）
4. 样式会完整保留

### 加载示例
点击"示例"按钮，选择预设模板：
- 基础示例：常用格式演示
- 完整示例：所有 Markdown 元素
- 文章模板：技术博客模板
- 代码文档：API 文档模板

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 6
- **样式方案**：Tailwind CSS 4
- **Markdown 解析**：marked
- **图标库**：lucide-react

## 📁 项目结构

```
AI_Markdown_writing/
├── api/
│   └── generate.js              # Serverless API 路由
├── components/
│   └── MarkdownRenderer.tsx     # Markdown 渲染组件
├── services/
│   └── geminiService.ts         # API 服务封装
├── App.tsx                      # 主应用组件
├── index.tsx                    # 应用入口
├── index.html                   # HTML 模板
├── index.css                    # 全局样式
├── types.ts                     # TypeScript 类型定义
├── constants.tsx                # 常量和模板配置
├── vite.config.ts               # Vite 构建配置
├── tailwind.config.js           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
├── vercel.json                  # Vercel 部署配置
├── package.json                 # 项目依赖配置
└── README.md                    # 项目文档
```

## 🎨 自定义样式

### 加载自定义 CSS
1. 准备 CSS 文件
2. 点击"加载CSS"按钮
3. 选择 CSS 文件
4. 样式立即生效

### 重置样式
点击"重置样式"按钮恢复默认样式。

## 🔧 开发

### 添加新的 AI 服务
编辑 `services/geminiService.ts`，添加新的 API 配置。

### 自定义样式模板
编辑 `constants.tsx` 中的 `TEMPLATES` 对象。

### 修改默认内容
编辑 `constants.tsx` 中的 `DEFAULT_BASE_CONTENT`。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [marked](https://github.com/markedjs/marked) - Markdown 解析器
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [lucide-react](https://lucide.dev/) - 图标库
- [Vite](https://vitejs.dev/) - 构建工具

## 📮 联系方式

如有问题或建议，欢迎通过 [GitHub Issues](https://github.com/000error/AI_Markdown_writing/issues) 联系。

---

<div align="center">
Made with ❤️ by 000error
</div>
