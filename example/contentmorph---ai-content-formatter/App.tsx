
import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Plus,
  Sparkles,
  Copy,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Code,
  Layout,
  Moon,
  Sun,
  FileText,
  Settings
} from 'lucide-react';
import { AppState, Variant } from './types';
import {
  DEFAULT_BASE_CONTENT,
  DEFAULT_VARIANT_PROMPT,
  DEFAULT_CSS,
  DEFAULT_SOCIAL_CSS,
  TEMPLATES
} from './constants.tsx';
import { geminiService } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    baseContent: DEFAULT_BASE_CONTENT,
    baseCss: DEFAULT_CSS,
    variants: [
      {
        id: 'xhs-default',
        title: '风格1',
        prompt: DEFAULT_VARIANT_PROMPT,
        content: '',
        customCss: DEFAULT_SOCIAL_CSS,
        isGenerating: false,
        isExpanded: false
      }
    ],
    activeId: 'base'
  });

  const [isCopied, setIsCopied] = useState(false);
  const [editingCssId, setEditingCssId] = useState<string | null>(null);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiModel, setApiModel] = useState('');
  const baseTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const cssFileInputRef = React.useRef<HTMLInputElement>(null);
  const customStyleElementRef = React.useRef<HTMLStyleElement | null>(null);

  // 添加防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 防抖更新内容 - 减少渲染频率
  const debouncedUpdateContent = useCallback((newContent: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, baseContent: newContent }));
    }, 150); // 150ms延迟
  }, []);

  // 立即更新内容（用于非输入场景）
  const updateContentImmediately = useCallback((newContent: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setState(prev => ({ ...prev, baseContent: newContent }));
  }, []);

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 恢复主题设置
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.setAttribute('data-weui-theme', 'dark');
      setIsDarkTheme(true);
    }
  }, []);

  // 恢复API配置
  React.useEffect(() => {
    const savedApiUrl = localStorage.getItem('api_url');
    const savedApiKey = localStorage.getItem('api_key');
    const savedApiModel = localStorage.getItem('api_model');
    if (savedApiUrl) setApiUrl(savedApiUrl);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedApiModel) setApiModel(savedApiModel);
  }, []);

  const activeData = useMemo(() => {
    if (state.activeId === 'base') {
      return { content: state.baseContent, css: state.baseCss };
    }
    const variant = state.variants.find(v => v.id === state.activeId);
    return {
      content: variant?.content || '暂无内容，请点击生成或输入。',
      css: variant?.customCss || DEFAULT_CSS
    };
  }, [state.activeId, state.baseContent, state.baseCss, state.variants]);

  const toggleVariant = (id: string) => {
    setState(prev => ({
      ...prev,
      activeId: id,
      variants: prev.variants.map(v => ({
        ...v,
        isExpanded: v.id === id ? !v.isExpanded : false
      }))
    }));
  };

  const addVariant = () => {
    const id = `variant-${Date.now()}`;
    setState(prev => {
      const nextIndex = prev.variants.length + 1;
      const newVariant: Variant = {
        id,
        title: `风格${nextIndex}`,
        prompt: '请将原文改写为...',
        content: '',
        customCss: DEFAULT_CSS,
        isGenerating: false,
        isExpanded: true
      };
      return { 
        ...prev, 
        variants: prev.variants.map(v => ({...v, isExpanded: false})).concat(newVariant),
        activeId: id
      };
    });
  };

  const generateAI = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const variant = state.variants.find(v => v.id === id);
    if (!variant) return;

    setState(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === id ? { ...v, isGenerating: true } : v)
    }));

    try {
      const result = await geminiService.generateVariant(state.baseContent, variant.prompt);
      setState(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === id ? { ...v, content: result, isGenerating: false } : v)
      }));
      setError(null); // 清除之前的错误状态
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "生成失败，请稍后重试。";
      setError(errorMessage);
      console.error("Generation error:", err);
      setState(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === id ? { ...v, isGenerating: false } : v)
      }));
    }
  };

  const copyToClipboard = async () => {
    const element = document.getElementById('formatted-preview');
    if (!element) return;

    try {
      // 创建临时容器
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      // 克隆预览内容
      const clonedContent = element.cloneNode(true) as HTMLElement;

      // 添加内联样式，确保复制到微信时保留样式
      addInlineStyles(clonedContent);
      tempContainer.appendChild(clonedContent);

      // 选中内容
      const range = document.createRange();
      range.selectNodeContents(tempContainer);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // 执行复制
      const successful = document.execCommand('copy');

      // 清理
      if (selection) {
        selection.removeAllRanges();
      }
      document.body.removeChild(tempContainer);

      if (successful) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      // Fallback: 尝试复制纯文本
      try {
        await navigator.clipboard.writeText(element.innerText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (e) {
        console.error('Fallback copy failed:', e);
      }
    }
  };

  // 为元素添加内联样式 - 完全按照参考项目的样式
  const addInlineStyles = (element: HTMLElement) => {
    // 基础文本样式
    const baseStyles = {
      'font-family': '-apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif',
      'font-size': '15px',
      'line-height': '1.75',
      'color': 'rgb(63, 63, 63)',
      'letter-spacing': '2px',
      'word-wrap': 'break-word',
      'word-break': 'break-word',
      'background-color': 'rgb(255, 255, 255)'
    };

    // 为根元素添加样式
    Object.keys(baseStyles).forEach(key => {
      const camelKey = key.replace(/-./g, x => x[1].toUpperCase());
      (element.style as any)[camelKey] = (baseStyles as any)[key];
    });

    // 样式映射表 - 使用参考项目的样式定义
    const styleMap: { [key: string]: string } = {
      'h1': 'font-size: 24px; font-weight: bold; margin: 0.6em 0; line-height: 1.4; color: rgb(30, 30, 30); letter-spacing: 2px;',
      'h2': 'font-size: 17px; font-weight: bold; margin: 0.6em 0; line-height: 1.5; color: rgb(30, 30, 30); letter-spacing: 2px;',
      'h3': 'font-size: 15px; font-weight: bold; margin: 0.5em 0; line-height: 1.5; color: rgb(30, 30, 30); letter-spacing: 2px;',
      'h4': 'font-size: 15px; font-weight: bold; margin: 0.4em 0; line-height: 1.5; color: rgb(63, 63, 63); letter-spacing: 2px;',
      'h5': 'font-size: 15px; font-weight: bold; margin: 0.4em 0; line-height: 1.5; color: rgb(63, 63, 63); letter-spacing: 2px;',
      'h6': 'font-size: 15px; font-weight: bold; margin: 0.4em 0; line-height: 1.5; color: rgb(99, 99, 99); letter-spacing: 2px;',
      'p': 'margin: 0px 8px 1em; padding: 0px; line-height: 1.75; color: rgb(63, 63, 63); font-size: 15px; letter-spacing: 2px;',
      'section': 'margin-left: 8px; margin-right: 8px;',
      'strong': 'font-weight: bold;',
      'b': 'font-weight: bold;',
      'em': 'font-style: italic;',
      'i': 'font-style: italic;',
      'code': 'font-family: Menlo, "Operator Mono", Consolas, Monaco, monospace; font-size: 13px; background-color: rgba(27, 31, 35, 0.05); padding: 0.2em 0.4em; border-radius: 3px; color: rgb(215, 58, 73);',
      'pre': 'margin: 0px 8px 10px; display: block; overflow-x: auto; color: rgb(201, 209, 217); background: rgb(13, 17, 23); text-align: left; line-height: 1.5; border-radius: 8px; font-size: 14px;',
      'blockquote': 'margin: 1em 8px; padding: 0.8em 1em; border-left: 4px solid rgb(220, 220, 220); background-color: rgba(0, 0, 0, 0.03); color: rgb(99, 99, 99);',
      'ul': 'margin: 1em 8px; padding-left: 1.5em; list-style-type: disc;',
      'ol': 'margin: 1em 8px; padding-left: 1.5em; list-style-type: decimal;',
      'li': 'margin: 0.5em 0; line-height: 1.75; color: rgb(63, 63, 63); font-size: 15px; letter-spacing: 2px;',
      'table': 'margin: 1em 8px; border-collapse: collapse; width: calc(100% - 16px); font-size: 14px;',
      'th': 'padding: 0.6em 1em; border: 1px solid rgb(229, 229, 229); text-align: left; font-weight: bold; background-color: rgb(248, 248, 248); color: rgb(30, 30, 30);',
      'td': 'padding: 0.6em 1em; border: 1px solid rgb(229, 229, 229); text-align: left; color: rgb(63, 63, 63);',
      'img': 'max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 9px; box-shadow: rgb(180, 180, 180) 0px 0px 0.5em 0px;',
      'a': 'color: rgb(0, 128, 255); text-decoration: underline; font-weight: bold;',
      'hr': 'border-style: solid; border-width: 1px 0 0; border-color: rgba(0, 0, 0, 0.1); transform: scale(1, 0.5); margin: 1em 0;',
      'del': 'text-decoration: line-through; opacity: 0.7;',
      's': 'text-decoration: line-through; opacity: 0.7;',
      'u': 'text-decoration: underline;',
      'mark': 'background-color: rgb(255, 243, 205); padding: 0.1em 0.3em; border-radius: 2px;',
      'small': 'font-size: 12px; color: rgb(99, 99, 99);',
      'sub': 'font-size: 0.75em; vertical-align: sub;',
      'sup': 'font-size: 0.75em; vertical-align: super;',
      'kbd': 'display: inline-block; padding: 3px 6px; font-size: 12px; line-height: 1; color: rgb(68, 77, 86); vertical-align: middle; background-color: rgb(250, 251, 252); border: 1px solid rgb(209, 213, 218); border-radius: 3px; box-shadow: inset 0 -1px 0 rgb(209, 213, 218); font-family: Menlo, Consolas, monospace;'
    };

    // 为所有子元素添加内联样式
    Object.keys(styleMap).forEach(tag => {
      const elements = element.getElementsByTagName(tag);
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const currentStyle = el.getAttribute('style') || '';
        el.setAttribute('style', currentStyle + ' ' + styleMap[tag]);

        // 特殊处理：pre code 需要使用代码块样式
        if (tag === 'code' && el.parentElement && el.parentElement.tagName.toLowerCase() === 'pre') {
          el.setAttribute('style', 'font-family: Menlo, "Operator Mono", Consolas, Monaco, monospace; font-size: 13px; display: block; padding: 0.5em 1em 1em; overflow-x: auto; line-height: 1.75; white-space: pre-wrap; word-wrap: break-word; color: rgb(201, 209, 217); background: transparent;');
        }
      }
    });

    return element;
  };

  const handleCssChange = (newCss: string) => {
    if (editingCssId === 'base') {
      setState(prev => ({ ...prev, baseCss: newCss }));
    } else {
      setState(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === editingCssId ? { ...v, customCss: newCss } : v)
      }));
    }
  };

  const applyTemplate = (templateName: keyof typeof TEMPLATES) => {
    const templateCss = TEMPLATES[templateName];
    if (state.activeId === 'base') {
      setState(prev => ({ ...prev, baseCss: templateCss }));
    } else {
      setState(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === state.activeId ? { ...v, customCss: templateCss } : v)
      }));
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const loadCustomCSS = () => {
    cssFileInputRef.current?.click();
  };

  const handleCSSFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.css')) {
      showToast('⚠️ 请选择CSS文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const cssContent = event.target?.result as string;

      // 移除旧的自定义样式
      if (customStyleElementRef.current) {
        customStyleElementRef.current.remove();
      }

      // 创建新的style元素
      const styleElement = document.createElement('style');
      styleElement.id = 'custom-css';
      styleElement.textContent = cssContent;
      document.head.appendChild(styleElement);
      customStyleElementRef.current = styleElement;

      showToast('✅ CSS已加载成功！');
    };

    reader.onerror = () => {
      showToast('❌ CSS文件读取失败');
    };

    reader.readAsText(file);

    // 重置文件输入，允许重复加载同一文件
    if (cssFileInputRef.current) {
      cssFileInputRef.current.value = '';
    }
  };

  const resetCSS = () => {
    if (customStyleElementRef.current) {
      customStyleElementRef.current.remove();
      customStyleElementRef.current = null;
      showToast('✅ 已重置为默认样式');
    } else {
      showToast('ℹ️ 当前使用的是默认样式');
    }
  };

  const toggleTheme = () => {
    const body = document.body;
    const currentTheme = body.getAttribute('data-weui-theme');

    if (currentTheme === 'dark') {
      body.removeAttribute('data-weui-theme');
      setIsDarkTheme(false);
      localStorage.setItem('theme', 'light');
      showToast('已切换到亮色主题');
    } else {
      body.setAttribute('data-weui-theme', 'dark');
      setIsDarkTheme(true);
      localStorage.setItem('theme', 'dark');
      showToast('已切换到暗色主题');
    }
  };

  const saveApiConfig = () => {
    if (!apiUrl.trim()) {
      showToast('⚠️ 请输入API URL');
      return;
    }
    if (!apiKey.trim()) {
      showToast('⚠️ 请输入API Key');
      return;
    }
    if (!apiModel.trim()) {
      showToast('⚠️ 请选择或输入模型名称');
      return;
    }
    localStorage.setItem('api_url', apiUrl.trim());
    localStorage.setItem('api_key', apiKey.trim());
    localStorage.setItem('api_model', apiModel.trim());
    geminiService.reinitialize();
    showToast('✅ API配置已保存');
    setShowSettingsModal(false);
  };

  const loadExampleContent = (type: 'basic' | 'full' | 'article' | 'code') => {
    const examples = {
      basic: `# 欢迎使用 Markdown 编辑器

这是一个基础示例，展示常用的 Markdown 格式。

## 文本样式

这是普通段落。你可以使用 **粗体**、*斜体*、~~删除线~~ 等样式。

## 列表

无序列表：
- 项目 1
- 项目 2
- 项目 3

有序列表：
1. 第一步
2. 第二步
3. 第三步

## 代码

行内代码：\`console.log('Hello')\`

代码块：
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## 引用

> 这是一段引用文字。
> 可以用来展示名言或重要内容。

## 链接

[访问 GitHub](https://github.com)

---

开始编辑你的内容吧！`,

      full: `# Markdown 完整示例

## 一、标题层级

### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 二、文本格式

**粗体文字** | *斜体文字* | ***粗斜体*** | ~~删除线~~

H<sub>2</sub>O | X<sup>2</sup>

## 三、列表

### 无序列表
- 项目 1
  - 子项 1.1
  - 子项 1.2
- 项目 2

### 有序列表
1. 第一项
2. 第二项
   1. 子项 2.1
   2. 子项 2.2

### 任务列表
- [x] 已完成
- [ ] 待完成

## 四、代码

行内代码：\`const x = 10;\`

代码块：
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

## 五、引用

> 这是一段引用。
>
> > 嵌套引用。

## 六、表格

| 功能 | 支持 | 说明 |
|------|------|------|
| 标题 | ✅ | H1-H6 |
| 列表 | ✅ | 有序/无序 |
| 代码 | ✅ | 行内/块 |

## 七、链接和图片

[GitHub](https://github.com)

![示例图片](https://via.placeholder.com/600x300)

---

这是分割线

## 八、其他元素

<kbd>Ctrl</kbd> + <kbd>C</kbd> 复制`,

      article: `# 如何写出优秀的技术文章

> 分享一些写作技巧和最佳实践

## 📋 前言

写作是一项重要的技能，特别是对于技术人员来说。一篇好的技术文章不仅能帮助他人，也能提升自己的理解。

## 🎯 核心要点

### 1. 明确目标读者

在开始写作前，先思考：
- 读者的技术水平如何？
- 他们想解决什么问题？
- 需要多少背景知识？

### 2. 结构清晰

一个好的文章结构：

1. **引言** - 说明文章目的
2. **正文** - 详细展开内容
3. **示例** - 提供实际案例
4. **总结** - 回顾要点

### 3. 代码示例

提供清晰的代码示例：

\`\`\`javascript
// 好的代码示例应该：
// 1. 简洁明了
// 2. 有适当注释
// 3. 可以直接运行

function example() {
  console.log("Hello, World!");
}
\`\`\`

## 💡 写作技巧

| 技巧 | 说明 | 重要性 |
|------|------|--------|
| 简洁 | 避免冗余 | ⭐⭐⭐⭐⭐ |
| 准确 | 技术细节正确 | ⭐⭐⭐⭐⭐ |
| 易读 | 排版舒适 | ⭐⭐⭐⭐ |

## 📝 实践建议

> **提示**: 写完后多读几遍，站在读者角度思考是否清晰易懂。

- ✅ 使用标题层级组织内容
- ✅ 适当使用列表和表格
- ✅ 添加代码示例
- ✅ 配图说明（如有必要）
- ❌ 避免长篇大论
- ❌ 不要假设读者知道所有概念

## 🎉 总结

好的技术文章需要：

1. 明确的目标
2. 清晰的结构
3. 实用的示例
4. 易读的排版

现在开始写你的第一篇文章吧！

---

*本文使用 Markdown 编写，渲染为微信公众号风格*`,

      code: `# API 使用文档

## 📖 概述

这是一个示例 API 文档，展示如何使用 RESTful API。

## 🚀 快速开始

### 安装

\`\`\`bash
npm install example-api
# 或
yarn add example-api
\`\`\`

### 基础用法

\`\`\`javascript
import { ApiClient } from 'example-api';

const client = new ApiClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.example.com'
});
\`\`\`

## 📡 API 端点

### 1. 获取用户信息

**请求:**
\`\`\`http
GET /api/users/:id
\`\`\`

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✅ | 用户ID |

**响应:**
\`\`\`json
{
  "id": "123",
  "name": "张三",
  "email": "zhangsan@example.com"
}
\`\`\`

### 2. 创建用户

**请求:**
\`\`\`http
POST /api/users
Content-Type: application/json
\`\`\`

**请求体:**
\`\`\`json
{
  "name": "李四",
  "email": "lisi@example.com"
}
\`\`\`

**示例代码:**
\`\`\`javascript
const response = await client.createUser({
  name: '李四',
  email: 'lisi@example.com'
});

console.log(response.data);
\`\`\`

## ⚠️ 错误处理

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

**错误响应示例:**
\`\`\`json
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
\`\`\`

## 💡 最佳实践

> **提示**: 始终检查 API 响应的状态码

- ✅ 使用环境变量存储 API 密钥
- ✅ 实现错误重试机制
- ✅ 添加请求超时设置
- ❌ 不要在客户端暴露密钥

## 📚 更多示例

### 错误处理

\`\`\`javascript
try {
  const user = await client.getUser('123');
  console.log(user);
} catch (error) {
  if (error.status === 404) {
    console.error('用户不存在');
  } else {
    console.error('请求失败:', error.message);
  }
}
\`\`\`

### 批量操作

\`\`\`javascript
const users = await Promise.all([
  client.getUser('1'),
  client.getUser('2'),
  client.getUser('3')
]);
\`\`\`

---

**版本:** 1.0.0
**更新时间:** 2026-01-29`
    };

    updateContentImmediately(examples[type]);
    setShowExampleModal(false);
    showToast('已加载示例内容');
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, target: 'base' | string) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (blob) {
          const url = URL.createObjectURL(blob);
          const markdownImage = `\n![Image](${url})\n`;

          // Insert at cursor position
          const textarea = e.currentTarget;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentContent = textarea.value;

          const newContent = currentContent.substring(0, start) + markdownImage + currentContent.substring(end);

          if (target === 'base') {
            updateContentImmediately(newContent);
          } else {
            setState(prev => ({
              ...prev,
              variants: prev.variants.map(v => v.id === target ? { ...v, content: newContent } : v)
            }));
          }

          // Restore cursor position (approximate)
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + markdownImage.length;
          }, 0);
        }
      }
    }
  };

  const insertFormat = (type: string, textareaRef: HTMLTextAreaElement | null, target: 'base' | string) => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = textareaRef.value.substring(start, end);
    const beforeText = textareaRef.value.substring(0, start);
    const afterText = textareaRef.value.substring(end);

    let insertText = '';
    let cursorOffset = 0;

    switch(type) {
      case 'h1':
        insertText = selectedText ? `# ${selectedText}` : '# 标题';
        cursorOffset = selectedText ? insertText.length : 2;
        break;
      case 'h2':
        insertText = selectedText ? `## ${selectedText}` : '## 标题';
        cursorOffset = selectedText ? insertText.length : 3;
        break;
      case 'h3':
        insertText = selectedText ? `### ${selectedText}` : '### 标题';
        cursorOffset = selectedText ? insertText.length : 4;
        break;
      case 'bold':
        insertText = selectedText ? `**${selectedText}**` : '**粗体文字**';
        cursorOffset = selectedText ? insertText.length : 2;
        break;
      case 'italic':
        insertText = selectedText ? `*${selectedText}*` : '*斜体文字*';
        cursorOffset = selectedText ? insertText.length : 1;
        break;
      case 'strikethrough':
        insertText = selectedText ? `~~${selectedText}~~` : '~~删除线~~';
        cursorOffset = selectedText ? insertText.length : 2;
        break;
      case 'quote':
        insertText = selectedText ? `> ${selectedText}` : '> 引用文字';
        cursorOffset = selectedText ? insertText.length : 2;
        break;
      case 'code':
        insertText = selectedText ? `\`${selectedText}\`` : '`代码`';
        cursorOffset = selectedText ? insertText.length : 1;
        break;
      case 'codeblock':
        insertText = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```javascript\n代码块\n```';
        cursorOffset = selectedText ? insertText.length : 14;
        break;
      case 'ul':
        insertText = selectedText ? `- ${selectedText}` : '- 列表项';
        cursorOffset = selectedText ? insertText.length : 2;
        break;
      case 'ol':
        insertText = selectedText ? `1. ${selectedText}` : '1. 列表项';
        cursorOffset = selectedText ? insertText.length : 3;
        break;
      case 'task':
        insertText = selectedText ? `- [ ] ${selectedText}` : '- [ ] 任务项';
        cursorOffset = selectedText ? insertText.length : 6;
        break;
      case 'link':
        insertText = selectedText ? `[${selectedText}](url)` : '[链接文字](https://example.com)';
        cursorOffset = selectedText ? start + selectedText.length + 3 : 1;
        break;
      case 'image':
        insertText = selectedText ? `![${selectedText}](url)` : '![图片描述](https://example.com/image.jpg)';
        cursorOffset = selectedText ? start + selectedText.length + 4 : 2;
        break;
      case 'table':
        insertText = '| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |';
        cursorOffset = 2;
        break;
      case 'hr':
        insertText = '\n---\n';
        cursorOffset = insertText.length;
        break;
      default:
        return;
    }

    const newContent = beforeText + insertText + afterText;

    if (target === 'base') {
      updateContentImmediately(newContent);
    } else {
      setState(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === target ? { ...v, content: newContent } : v)
      }));
    }

    setTimeout(() => {
      if (selectedText) {
        textareaRef.selectionStart = textareaRef.selectionEnd = start + insertText.length;
      } else {
        textareaRef.selectionStart = textareaRef.selectionEnd = start + cursorOffset;
      }
      textareaRef.focus();
    }, 0);
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F5F7] text-[#1d1d1f] overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Left Pane */}
      <div className="w-1/2 flex flex-col border-r border-black/5 bg-white/60 backdrop-blur-2xl transition-all">
        <header className="h-18 px-6 pt-6 pb-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
              <Layout className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight text-[#1d1d1f]">ContentMorph</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-2 pb-12 space-y-6">
          {/* Base Editor - Dominates top space */}
          <section 
            className={`group min-h-[70vh] flex flex-col bg-white rounded-2xl transition-all duration-300 ${state.activeId === 'base' ? 'shadow-[0_12px_40px_rgba(0,0,0,0.08)] ring-2 ring-[#0066CC]/30' : 'shadow-sm hover:shadow-md ring-1 ring-black/5'}`}
            onClick={() => setState(prev => ({ ...prev, activeId: 'base' }))}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50/50">
              <div className="flex items-center gap-2 font-medium text-[#1d1d1f] text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                基础内容
              </div>
            </div>
            {/* 格式化工具栏 */}
            <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-50/50 bg-gray-50/30" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => insertFormat('h1', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="一级标题">H1</button>
              <button onClick={() => insertFormat('h2', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="二级标题">H2</button>
              <button onClick={() => insertFormat('h3', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="三级标题">H3</button>
              <div className="w-px h-5 bg-gray-300 mx-1 self-center"></div>
              <button onClick={() => insertFormat('bold', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="粗体">B</button>
              <button onClick={() => insertFormat('italic', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs italic text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="斜体">I</button>
              <button onClick={() => insertFormat('strikethrough', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs line-through text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="删除线">S</button>
              <div className="w-px h-5 bg-gray-300 mx-1 self-center"></div>
              <button onClick={() => insertFormat('quote', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="引用">❝</button>
              <button onClick={() => insertFormat('code', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="行内代码">&lt;/&gt;</button>
              <button onClick={() => insertFormat('codeblock', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="代码块">{'{ }'}</button>
              <div className="w-px h-5 bg-gray-300 mx-1 self-center"></div>
              <button onClick={() => insertFormat('ul', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="无序列表">• List</button>
              <button onClick={() => insertFormat('ol', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="有序列表">1. List</button>
              <button onClick={() => insertFormat('task', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="任务列表">☑ Task</button>
              <div className="w-px h-5 bg-gray-300 mx-1 self-center"></div>
              <button onClick={() => insertFormat('link', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="链接">🔗</button>
              <button onClick={() => insertFormat('image', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="图片">🖼️</button>
              <button onClick={() => insertFormat('table', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="表格">📊</button>
              <button onClick={() => insertFormat('hr', baseTextareaRef.current, 'base')} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20" title="分割线">—</button>
              <div className="w-px h-5 bg-gray-300 mx-1 self-center"></div>
              <button onClick={() => setShowSettingsModal(true)} className="px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-[#0066CC] rounded transition-colors border border-transparent hover:border-[#0066CC]/20 flex items-center gap-1" title="API设置">
                <Settings className="w-3 h-3" strokeWidth={1.5} />
                设置
              </button>
            </div>
            <textarea
              ref={baseTextareaRef}
              className="w-full min-h-[60vh] p-5 text-[15px] leading-relaxed bg-transparent focus:outline-none resize-none custom-scrollbar placeholder:text-gray-300"
              value={state.baseContent}
              onChange={(e) => debouncedUpdateContent(e.target.value)}
              onPaste={(e) => handlePaste(e, 'base')}
              placeholder="在此输入您的 Markdown 内容..."
            />
          </section>

          <div className="flex items-center gap-4 py-2 opacity-60">
            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-widest shrink-0">AI 风格变体</span>
            <div className="h-[1px] w-full bg-black/5"></div>
          </div>

          {/* Variants - Collapsible */}
          <div className="space-y-4">
            {state.variants.map((v) => (
              <div 
                key={v.id}
                className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 ${state.activeId === v.id ? 'shadow-[0_12px_40px_rgba(0,0,0,0.08)] ring-2 ring-[#0066CC]/30' : v.isExpanded ? 'shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5' : 'shadow-sm hover:shadow-md ring-1 ring-black/5'}`}
              >
                <div 
                  className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none group relative"
                  onClick={() => toggleVariant(v.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${state.activeId === v.id ? 'bg-blue-50 text-[#0066CC]' : v.isExpanded ? 'bg-blue-50 text-[#0066CC]' : 'bg-gray-50 text-[#86868b] group-hover:text-[#1d1d1f]'}`}>
                      <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <input 
                      className="font-medium text-sm bg-transparent border-none focus:outline-none w-40 text-[#1d1d1f]"
                      value={v.title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setState(prev => ({
                        ...prev, 
                        variants: prev.variants.map(varItem => varItem.id === v.id ? {...varItem, title: e.target.value} : varItem)
                      }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => generateAI(e, v.id)}
                      disabled={v.isGenerating}
                      className="p-1.5 bg-gray-50 text-[#0066CC] rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                      {v.isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <Sparkles className="w-4 h-4" strokeWidth={1.5} />}
                    </button>
                    {v.isExpanded ? <ChevronUp className="w-4 h-4 text-[#86868b]" strokeWidth={1.5} /> : <ChevronDown className="w-4 h-4 text-[#86868b]" strokeWidth={1.5} />}
                  </div>
                </div>

                <div className={`transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${v.isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="px-5 pb-5 pt-1 space-y-4">
                    <div className="flex items-center justify-between pl-1">
                      <label className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Prompt</label>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingPromptId(v.id); }}
                        className="text-[11px] font-medium text-[#0066CC] hover:text-[#004499] hover:underline transition-colors"
                      >
                        查看/编辑
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center pl-1">
                        <label className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Content</label>
                      </div>
                      <textarea 
                        className="w-full h-48 p-4 text-sm font-mono bg-white ring-1 ring-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none shadow-inner"
                        value={v.content}
                        onChange={(e) => setState(prev => ({
                          ...prev, 
                          variants: prev.variants.map(varItem => varItem.id === v.id ? {...varItem, content: e.target.value} : varItem)
                        }))}
                        onPaste={(e) => handlePaste(e, v.id)}
                        placeholder="点击魔法棒由 AI 生成..."
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                       <button 
                        onClick={(e) => { e.stopPropagation(); setState(prev => ({...prev, variants: prev.variants.filter(varItem => varItem.id !== v.id), activeId: 'base'})); }}
                        className="text-xs text-red-500/80 hover:text-red-600 flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-all"
                       >
                         <Trash2 className="w-3 h-3" strokeWidth={1.5} /> 删除
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={addVariant}
              className="w-full py-3 bg-white border border-dashed border-black/10 rounded-xl text-[#86868b] hover:border-[#0066CC]/50 hover:text-[#0066CC] hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} /> 新增风格变体
            </button>
          </div>
        </main>
      </div>

      {/* Right Pane - Preview */}
      <div className="flex-1 flex flex-col bg-[#F5F5F7] p-6 overflow-hidden">
        <div className="w-full h-full flex flex-col bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 overflow-hidden">
          <header className="h-14 px-6 flex items-center justify-between shrink-0 border-b border-black/5 bg-white/80 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-100/50">
                <div className={`w-2 h-2 rounded-full ${state.activeId === 'base' ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                <span className="text-xs font-medium text-[#1d1d1f]">
                  {state.activeId === 'base' ? 'Original' : state.variants.find(v => v.id === state.activeId)?.title}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 示例按钮 */}
              <button
                onClick={() => setShowExampleModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 hover:text-gray-900 transition-all"
                title="加载示例内容"
              >
                <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                示例
              </button>
              {/* 加载CSS按钮 */}
              <button
                onClick={loadCustomCSS}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 hover:text-gray-900 transition-all"
                title="加载本地CSS文件"
              >
                <Code className="w-3.5 h-3.5" strokeWidth={1.5} />
                加载CSS
              </button>
              {/* 重置样式按钮 */}
              <button
                onClick={resetCSS}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 hover:text-gray-900 transition-all"
                title="重置为默认样式"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                重置样式
              </button>
              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 hover:text-gray-900 transition-all"
                title="切换主题"
              >
                {isDarkTheme ? <Sun className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Moon className="w-3.5 h-3.5" strokeWidth={1.5} />}
                主题
              </button>
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-xs transition-all ${isCopied ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-black text-white hover:bg-gray-800 shadow-md shadow-black/10 active:scale-95'}`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </header>
          
          <div className="flex-1 overflow-hidden relative">
             <MarkdownRenderer content={activeData.content} customCss={activeData.css} />
          </div>
        </div>
      </div>

      {/* CSS Modal */}
      {editingPromptId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-12 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#0066CC] text-white rounded-lg shadow-sm">
                  <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#1d1d1f]">编辑提示词</h3>
                </div>
              </div>
              <button 
                onClick={() => setEditingPromptId(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-[#86868b]"
              >
                <Plus className="w-5 h-5 rotate-45" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6">
              <textarea 
                className="w-full h-64 p-4 text-sm bg-[#F5F5F7] border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none text-[#1d1d1f]"
                value={state.variants.find(v => v.id === editingPromptId)?.prompt || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  variants: prev.variants.map(v => v.id === editingPromptId ? { ...v, prompt: e.target.value } : v)
                }))}
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setEditingPromptId(null)}
                className="px-6 py-2 bg-black text-white rounded-xl font-medium text-sm shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Modal */}
      {editingCssId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-12 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl h-full max-h-[700px] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#0066CC] text-white rounded-lg shadow-sm">
                  <Code className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#1d1d1f]">Custom CSS</h3>
                </div>
              </div>
              <button 
                onClick={() => setEditingCssId(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-[#86868b]"
              >
                <Plus className="w-5 h-5 rotate-45" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 bg-[#1e1e1e] p-6">
              <textarea 
                className="w-full h-full bg-transparent text-[#9cdcfe] font-mono text-sm resize-none focus:outline-none custom-scrollbar leading-relaxed"
                value={editingCssId === 'base' ? state.baseCss : state.variants.find(v => v.id === editingCssId)?.customCss || ''}
                onChange={(e) => handleCssChange(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setEditingCssId(null)}
                className="px-6 py-2 bg-black text-white rounded-xl font-medium text-sm shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 示例模态框 */}
      {showExampleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-12 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#0066CC] text-white rounded-lg shadow-sm">
                  <FileText className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#1d1d1f]">选择示例模板</h3>
                </div>
              </div>
              <button
                onClick={() => setShowExampleModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-[#86868b]"
              >
                <Plus className="w-5 h-5 rotate-45" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {/* 基础示例 */}
              <div
                onClick={() => loadExampleContent('basic')}
                className="p-4 border border-gray-200 rounded-xl hover:border-[#0066CC] hover:bg-blue-50/50 cursor-pointer transition-all group"
              >
                <div className="font-semibold text-sm text-[#1d1d1f] mb-1 group-hover:text-[#0066CC]">
                  🎯 基础示例
                </div>
                <div className="text-xs text-gray-600">
                  包含常用的标题、段落、列表等基础格式
                </div>
              </div>

              {/* 完整示例 */}
              <div
                onClick={() => loadExampleContent('full')}
                className="p-4 border border-gray-200 rounded-xl hover:border-[#0066CC] hover:bg-blue-50/50 cursor-pointer transition-all group"
              >
                <div className="font-semibold text-sm text-[#1d1d1f] mb-1 group-hover:text-[#0066CC]">
                  📚 完整示例
                </div>
                <div className="text-xs text-gray-600">
                  展示所有支持的 Markdown 元素
                </div>
              </div>

              {/* 文章模板 */}
              <div
                onClick={() => loadExampleContent('article')}
                className="p-4 border border-gray-200 rounded-xl hover:border-[#0066CC] hover:bg-blue-50/50 cursor-pointer transition-all group"
              >
                <div className="font-semibold text-sm text-[#1d1d1f] mb-1 group-hover:text-[#0066CC]">
                  📝 文章模板
                </div>
                <div className="text-xs text-gray-600">
                  适合写技术博客或文章的模板
                </div>
              </div>

              {/* 代码文档 */}
              <div
                onClick={() => loadExampleContent('code')}
                className="p-4 border border-gray-200 rounded-xl hover:border-[#0066CC] hover:bg-blue-50/50 cursor-pointer transition-all group"
              >
                <div className="font-semibold text-sm text-[#1d1d1f] mb-1 group-hover:text-[#0066CC]">
                  💻 代码文档
                </div>
                <div className="text-xs text-gray-600">
                  包含代码块和技术说明的模板
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setShowExampleModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-300 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 设置模态框 */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-12 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#0066CC] text-white rounded-lg shadow-sm">
                  <Settings className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#1d1d1f]">API 设置</h3>
                  <p className="text-xs text-gray-500 mt-0.5">配置 OpenAI 兼容的 API</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-[#86868b]"
              >
                <Plus className="w-5 h-5 rotate-45" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1/chat/completions"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模型名称
                </label>
                <input
                  type="text"
                  value={apiModel}
                  onChange={(e) => setApiModel(e.target.value)}
                  placeholder="gpt-4o, gpt-3.5-turbo, deepseek-chat 等"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all text-sm"
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  💡 配置信息将保存在本地浏览器中，不会上传到服务器<br/>
                  支持所有兼容 OpenAI API 格式的服务，如 OpenAI、DeepSeek、通义千问等
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-300 transition-all"
              >
                取消
              </button>
              <button
                onClick={saveApiConfig}
                className="px-6 py-2 bg-[#0066CC] text-white rounded-xl font-medium text-sm hover:bg-[#0052A3] transition-all shadow-md shadow-blue-500/20"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
           <span className="font-medium text-sm">{error}</span>
           <button onClick={() => setError(null)} className="p-0.5 hover:bg-white/20 rounded-full">
             <Plus className="w-4 h-4 rotate-45" strokeWidth={1.5} />
           </button>
        </div>
      )}

      {/* Toast提示消息 */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={cssFileInputRef}
        type="file"
        accept=".css"
        onChange={handleCSSFileUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default App;
