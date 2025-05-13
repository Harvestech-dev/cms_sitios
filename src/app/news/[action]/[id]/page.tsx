'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import NewsForm from '@/app/news/components/NewsForm';
import type { NewsFormData, NewsItem } from '@/types/news';

interface NewsEditPageProps {
  params: {
    action: string;
    id: string;
  };
}

export default function NewsEditPage({ params }: NewsEditPageProps) {
  const router = useRouter();
  const { getNewsById, updateNews } = useNews();
  const [news, setNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      if (params.action === 'edit' && params.id) {
        const newsItem = await getNewsById(params.id);
        if (!newsItem) {
          router.push('/news');
          return;
        }
        setNews(newsItem);
      } else {
        router.push('/news');
      }
    };

    loadNews();
  }, [params.action, params.id, getNewsById, router]);

  const handleSave = async (data: NewsFormData) => {
    if (!news) return;
    
    try {
      await updateNews(news.id, data);
      router.push('/news');
    } catch (error) {
      console.error('Error al actualizar noticia:', error);
      throw error;
    }
  };

  if (!news) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <NewsForm
        initialData={news}
        onSave={handleSave}
        onCancel={() => router.push('/news')}
      />
    </div>
  );
} 