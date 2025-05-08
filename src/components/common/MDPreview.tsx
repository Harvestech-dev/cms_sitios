'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-markdown-preview/markdown.css';

const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
);

interface MDPreviewProps {
  content: string;
}

export default function MDPreview({ content }: MDPreviewProps) {
  return (
    <div className="markdown-preview">
      <MarkdownPreview
        source={content}
        wrapperElement={{
          "data-color-mode": "dark"
        }}
      />
    </div>
  );
} 