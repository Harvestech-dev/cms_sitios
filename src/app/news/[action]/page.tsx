'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import NewsForm from '@/app/news/components/NewsForm';
import type { NewsFormData } from '@/types/news';

interface NewsActionPageProps {
  params: {
    action: string;
  };
}

export default function NewsActionPage({ params }: NewsActionPageProps) {
  const router = useRouter();
  const { createNews } = useNews();

  useEffect(() => {
    if (params.action !== 'create') {
      router.push('/news');
    }
  }, [params.action, router]);

  const handleSave = async (data: NewsFormData) => {
    try {
      await createNews(data);
      router.push('/news');
    } catch (error) {
      console.error('Error al crear noticia:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      <NewsForm
        onSave={handleSave}
        onCancel={() => router.push('/news')}
      />
    </div>
  );
} 