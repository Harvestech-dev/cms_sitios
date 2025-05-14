'use client';

import { News } from '@/types/news';
import { formatDate } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Chip } from '@/components/common/Chip';
import IconRenderer from '@/components/common/IconRenderer';
import SafeImage from '@/components/common/SafeImage';

interface NewsPreviewProps {
  news: News;
}

export default function NewsPreview({ news }: NewsPreviewProps) {
  if (!news) return null;
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Cabecera con metadatos */}
      <div className="border-b border-gray-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">{news.title}</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <IconRenderer icon="FaCalendar" className="w-3.5 h-3.5" />
              <span>
                {formatDate(news.publish_date || news.created_at, {
                  dateStyle: 'long'
                })}
              </span>
            </div>
          </div>
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs ${
              news.status === 'published' 
                ? 'bg-green-900 text-green-300' 
                : 'bg-gray-700 text-gray-300'
            }`}>
              {news.status === 'published' ? 'Publicado' : 'Borrador'}
            </span>
            {news.featured && (
              <span className="ml-2 inline-block px-3 py-1 rounded-full text-xs bg-yellow-900 text-yellow-300">
                Destacado
              </span>
            )}
          </div>
        </div>
        
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {news.tags.map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Contenido principal */}
      <div className="p-6">
        {news.summary && (
          <div className="mb-8 text-lg font-medium text-gray-300 border-l-4 border-blue-600 pl-4 py-2">
            {news.summary}
          </div>
        )}
        
        {news.img_src && (
          <div className="my-8">
            <SafeImage
              src={news.img_src}
              alt={news.img_alt || news.title}
              width={800}
              height={400}
              className="mx-auto max-w-full h-auto rounded-lg"
            />
            {news.img_alt && (
              <p className="text-center text-gray-400 text-sm mt-2">{news.img_alt}</p>
            )}
          </div>
        )}
        
        <article className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
            rehypePlugins={[rehypeRaw]}
          >
            {news.content || ''}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}