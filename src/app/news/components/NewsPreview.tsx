'use client';

import { NewsItem } from '@/types/news';
import IconRender from '@/components/common/IconRender';
import { formatDate } from '@/lib/utils';
import MDPreview from '@/components/common/MDPreview';

interface NewsPreviewProps {
  news: NewsItem;
}

export default function NewsPreview({ news }: NewsPreviewProps) {
  return (
    <article className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Imagen principal */}
      {news.image_url && (
        <div className="relative aspect-video">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">{news.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <IconRender icon="FaCalendar" className="w-4 h-4" />
              <span>{formatDate(news.created_at)}</span>
            </div>
            {news.featured && (
              <div className="flex items-center gap-1 text-yellow-500">
                <IconRender icon="FaStar" className="w-4 h-4" />
                <span>Destacada</span>
              </div>
            )}
          </div>
        </div>

        {/* Resumen */}
        {news.summary && (
          <div className="mb-8">
            <p className="text-gray-300 text-lg">{news.summary}</p>
          </div>
        )}

        {/* Contenido */}
        <div className="prose prose-invert max-w-none">
          <MDPreview content={news.content} />
        </div>

        {/* Pie */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {news.tags?.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}