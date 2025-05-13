'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import { NewsFormData } from '@/types/news';
import Header from '@/components/layout/Header';
import NewsForm from '../../components/NewsForm';

export default function NewsEditPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { updateNews, getNewsById } = useNews();
  const [initialData, setInitialData] = useState<Partial<NewsFormData> | undefined>();
  const [initialView, setInitialView] = useState<'edit' | 'preview'>('edit');
  const id = params.id as string;

  useEffect(() => {
    const loadNews = async () => {
      try {
        const news = await getNewsById(params.id);
        if (!news) {
          router.push('/news');
        }
      } catch (error) {
        console.error('Error loading news:', error);
        router.push('/news');
      }
    };
    loadNews();
  }, [params.id, getNewsById, router]);

  useEffect(() => {
    // Obtener el modo de vista de los parámetros de búsqueda
    const view = searchParams.get('view');
    if (view === 'preview') {
      setInitialView('preview');
    }
  }, [searchParams]);

  const handleSave = async (data: NewsFormData, status: NewsStatus) => {
    try {
      await updateNews(id, { ...data, status });
      router.push('/news');
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <>
      <Header
        title="Editar Noticia"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Noticias', href: '/news' },
          { label: 'Editar', href: '#' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <NewsForm
            onSave={handleSave}
            onCancel={() => router.push('/news')}
            initialData={initialData}
            initialView={initialView}
          />
        </div>
      </div>
    </>
  );
} 