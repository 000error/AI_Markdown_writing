
export const DEFAULT_BASE_CONTENT = `# 欢迎使用 ContentMorph

在这里输入你的原始文本或 Markdown 内容。
右侧会实时展示渲染后的效果。

### Apple 风格设计
整体界面采用了极简的苹果设计风格：
- **圆角**：更圆润的视觉边缘。
- **毛玻璃**：柔和的半透明效果。
- **排版**：强调负空间与字间距。

你可以点击下方的 **AI 风格变体**，尝试不同的排版效果。`;

export const DEFAULT_VARIANT_PROMPT = `你是一个专业的小红书运营专家。
请将给出的文本改写成小红书风格。
要求：标题带Emoji，内容多使用Emoji增加可读性，适当加入相关的标签 (Hashtags)。
输出格式：Markdown。`;

export const TEMPLATES = {
  modern: `/* 现代极简风格 */
.preview-container {
  padding: 40px;
  line-height: 1.7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1d1d1f;
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
}
h1 { font-size: 32px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 24px; }
h3 { font-size: 20px; font-weight: 600; margin-top: 32px; margin-bottom: 12px; }
p { margin-bottom: 16px; color: #424245; }
ul { list-style-type: none; padding: 0; }
li { padding: 8px 0; border-bottom: 1px solid #f5f5f7; display: flex; align-items: center; }
li::before { content: "•"; color: #0071e3; margin-right: 12px; font-weight: bold; }`,

  social: `/* 小红书风格 */
.preview-container {
  padding: 30px;
  line-height: 1.8;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: #333;
  max-width: 450px;
  margin: 0 auto;
  background: #fff;
}
h1 { font-size: 20px; font-weight: bold; color: #000; margin-bottom: 15px; }
p { margin-bottom: 12px; font-size: 15px; }
strong { color: #ff2442; }
blockquote { background: #f9f9f9; padding: 15px; border-radius: 12px; font-size: 14px; color: #666; margin: 20px 0; }`,

  wechat: `/* 微信公众号风格 */
.preview-container {
  font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;
  font-size: 15px;
  color: rgb(63, 63, 63);
  background-color: transparent;
  line-height: 1.75;
  letter-spacing: 2px;
  max-width: 677px;
  margin: 0 auto;
  padding: 40px;
}

/* 段落 */
.preview-container p {
  margin: 0px 8px 1em;
  padding: 0px;
  color: rgb(63, 63, 63);
  font-size: 15px;
  letter-spacing: 2px;
  line-height: 1.75;
  text-align: left;
}

/* 标题 */
.preview-container h1 {
  font-size: 24px;
  font-weight: bold;
  color: rgb(30, 30, 30);
  margin: 0.6em 0;
  line-height: 1.4;
}

.preview-container h2 {
  font-size: 17px;
  font-weight: bold;
  color: rgb(30, 30, 30);
  margin: 0.6em 0;
  line-height: 1.5;
}

.preview-container h3 {
  font-size: 15px;
  font-weight: bold;
  color: rgb(30, 30, 30);
  margin: 0.5em 0;
  line-height: 1.5;
}

.preview-container h4,
.preview-container h5,
.preview-container h6 {
  font-size: 15px;
  font-weight: bold;
  color: rgb(63, 63, 63);
  margin: 0.4em 0;
  line-height: 1.5;
}

/* 粗体和斜体 */
.preview-container strong,
.preview-container b {
  font-weight: bold;
  color: inherit;
}

.preview-container em,
.preview-container i {
  font-style: italic;
}

.preview-container del,
.preview-container s {
  text-decoration: line-through;
  opacity: 0.7;
}

/* 链接 */
.preview-container a {
  color: rgb(0, 128, 255);
  text-decoration: underline;
  font-weight: bold;
}

/* 图片 */
.preview-container img {
  max-width: 100%;
  height: auto;
  border-radius: 9px;
  box-shadow: rgb(180, 180, 180) 0px 0px 0.5em 0px;
  display: block;
  margin: 0 auto;
}

/* 分割线 */
.preview-container hr {
  border-style: solid;
  border-width: 1px 0 0;
  border-color: rgba(0, 0, 0, 0.1);
  transform: scale(1, 0.5);
  margin: 1em 0;
}

/* 代码块 */
.preview-container pre {
  margin: 0px 8px 10px;
  display: block;
  overflow-x: auto;
  color: rgb(201, 209, 217);
  background: rgb(13, 17, 23);
  text-align: left;
  line-height: 1.5;
  border-radius: 8px;
  padding: 0px;
  font-size: 14px;
}

.preview-container pre code {
  font-family: Menlo, "Operator Mono", Consolas, Monaco, monospace;
  font-size: 13px;
  display: block;
  padding: 0.5em 1em 1em;
  overflow-x: auto;
  line-height: 1.75;
  color: rgb(201, 209, 217);
  background: transparent;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 行内代码 */
.preview-container code {
  font-family: Menlo, "Operator Mono", Consolas, Monaco, monospace;
  font-size: 13px;
  background-color: rgba(27, 31, 35, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  color: rgb(215, 58, 73);
}

/* 引用块 */
.preview-container blockquote {
  margin: 1em 8px;
  padding: 0.8em 1em;
  border-left: 4px solid rgb(220, 220, 220);
  background-color: rgba(0, 0, 0, 0.03);
  color: rgb(99, 99, 99);
}

.preview-container blockquote p {
  margin: 0.5em 0;
  padding: 0;
  line-height: 1.75;
  font-size: 15px;
  letter-spacing: 2px;
  color: inherit;
}

/* 列表 */
.preview-container ul {
  margin: 1em 8px;
  padding-left: 1.5em;
  list-style-type: disc;
}

.preview-container ol {
  margin: 1em 8px;
  padding-left: 1.5em;
  list-style-type: decimal;
}

.preview-container li {
  margin: 0.5em 0;
  color: rgb(63, 63, 63);
  font-size: 15px;
  letter-spacing: 2px;
  line-height: 1.75;
}

/* 表格 */
.preview-container table {
  margin: 1em 8px;
  border-collapse: collapse;
  width: calc(100% - 16px);
  font-size: 14px;
  overflow-x: auto;
  display: block;
}

.preview-container th,
.preview-container td {
  padding: 0.6em 1em;
  border: 1px solid rgb(229, 229, 229);
  text-align: left;
}

.preview-container th {
  font-weight: bold;
  background-color: rgb(248, 248, 248);
  color: rgb(30, 30, 30);
}

.preview-container td {
  color: rgb(63, 63, 63);
}`
};

export const DEFAULT_CSS = TEMPLATES.wechat;
export const DEFAULT_SOCIAL_CSS = TEMPLATES.social;
