'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import { NewsItem } from '@/types/news';
import Header from '@/components/layout/Header';
import MDEditor from '@uiw/react-md-editor';
import IconRender from '@/components/common/IconRender';
import { formatDate } from '@/lib/utils';

export default function NewsPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const { getNewsById } = useNews();
  const [news, setNews] = useState<NewsItem | null>(null);
  const id = params.id as string;

  useEffect(() => {
    const newsData = getNewsById(id);
    if (newsData) {
      setNews(newsData);
    } else {
      router.push('/news');
    }
  }, [id]);

  if (!news) {
    return null;
  }

  return (
    <>
      <Header
        title="Vista previa de noticia"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Noticias', href: '/news' },
          { label: 'Vista previa', href: '#' }
        ]}
        actions={[
          {
            label: 'Editar',
            onClick: () => router.push(`/news/edit/${id}`),
            icon: 'FaEdit',
            variant: 'secondary'
          },
          {
            label: 'Volver',
            onClick: () => router.push('/news'),
            icon: 'FaArrowLeft',
            variant: 'primary'
          }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Cabecera */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-2">{news.title}</h1>
            {news.subtitle && (
              <h2 className="text-xl text-gray-300 mb-4">{news.subtitle}</h2>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <IconRender icon="FaUser" className="w-4 h-4" />
                {news.author}
              </span>
              <span className="flex items-center gap-1">
                <IconRender icon="FaCalendar" className="w-4 h-4" />
                {formatDate(news.created_at)}
              </span>
              {news.featured && (
                <span className="flex items-center gap-1 text-yellow-500">
                  <IconRender icon="FaStar" className="w-4 h-4" />
                  Destacado
                </span>
              )}
            </div>
          </div>

          {/* Imagen */}
          {news.img_src && (
            <div className="relative h-96 w-full">
              <img
                src={news.img_src}
                alt={news.img_alt || news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Contenido */}
          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              <div className="markdown-body">
                <MDEditor.Markdown source={news.content} />
              </div>
            </div>
          </div>

          {/* Metadatos */}
          <div className="p-6 bg-gray-900 border-t border-gray-700">
            <div className="flex flex-wrap gap-4">
              {news.categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <IconRender icon="FaFolder" className="w-4 h-4 text-gray-400" />
                  <div className="flex gap-2">
                    {news.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {news.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <IconRender icon="FaTags" className="w-4 h-4 text-gray-400" />
                  <div className="flex gap-2">
                    {news.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 