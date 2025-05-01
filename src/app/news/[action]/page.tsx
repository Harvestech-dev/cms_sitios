'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import { NewsFormData } from '@/types/news';
import Header from '@/components/layout/Header';
import NewsForm from '../components/NewsForm';

export default function NewsEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { createNews, updateNews, getNewsById } = useNews();
  const [initialData, setInitialData] = useState<Partial<NewsFormData> | undefined>();
  const isEditing = params.action === 'edit';

  useEffect(() => {
    if (isEditing && params.id) {
      const newsData = getNewsById(params.id as string);
      if (newsData) {
        setInitialData(newsData);
      } else {
        router.push('/news');
      }
    }
  }, [isEditing, params.id]);

  const handleSave = async (data: NewsFormData) => {
    try {
      if (isEditing && params.id) {
        await updateNews(params.id as string, data);
      } else {
        await createNews(data);
      }
      router.push('/news');
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <>
      <Header
        title={isEditing ? 'Editar Noticia' : 'Nueva Noticia'}
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Noticias', href: '/news' },
          { label: isEditing ? 'Editar' : 'Nueva', href: '#' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <NewsForm
            onSave={handleSave}
            onCancel={() => router.push('/news')}
            initialData={initialData}
          />
        </div>
      </div>
    </>
  );
} 