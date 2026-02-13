
import React, { useMemo } from 'react';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

interface MarkdownRendererProps {
  content: string;
  customCss: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, customCss }) => {
  const htmlContent = useMemo(() => {
    return marked.parse(content);
  }, [content]);

  return (
    <div className="relative h-full overflow-y-auto bg-transparent pl-6 pr-8 py-8 custom-scrollbar">
      <style>{`
        /* 强制图片自适应容器宽度，避免溢出 */
        .preview-container img,
        .rich_media_content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          display: block;
          margin: 1rem 0;
        }
        /* 让内容靠左显示，提高空间利用率 */
        .preview-container {
          margin-left: 0 !important;
          margin-right: auto !important;
        }
        ${customCss}
      `}</style>
      <div
        id="formatted-preview"
        className="preview-container rich_media_content prose prose-gray max-w-none selection:bg-blue-100 selection:text-blue-900"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default MarkdownRenderer;
