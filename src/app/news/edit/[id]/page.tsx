'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useNews } from '@/contexts/NewsContext';
import { useToast } from '@/contexts/ToastContext';
import NewsForm from '../../components/NewsForm';
import Header from '@/components/layout/Header';
import { NewsFormData, NewsStatus, NewsItem } from '@/types/news';
import Loading from '@/components/common/Loading';

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [newsData, setNewsData] = useState<NewsItem | null>(null);
  const { getNewsById, updateNews } = useNews();
  const { showToast } = useToast();
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  useEffect(() => {
    const fetchNews = () => {
      try {
        setLoading(true);
        console.log('Buscando noticia con ID:', id);
        
        // getNewsById ahora devuelve sincrónicamente el resultado
        const news = getNewsById(id);
        console.log('Datos encontrados:', news);
        
        if (!news) {
          console.error('No se encontró la noticia');
          showToast('No se encontró la noticia', 'error');
          router.push('/news');
          return;
        }
        
        // Guardar los datos encontrados en el estado
        setNewsData(news);
        console.log('Datos guardados en estado:', news);
      } catch (error) {
        console.error('Error cargando noticia:', error);
        showToast('Error al cargar los datos de la noticia', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, getNewsById, router, showToast]);

  const handleSave = async (data: NewsFormData, status: NewsStatus) => {
    try {
      console.log('Guardando noticia:', data);
      await updateNews(id, { ...data, status });
      showToast('Noticia actualizada correctamente', 'success');
      router.push('/news');
    } catch (error) {
      console.error('Error updating news:', error);
      showToast('Error al actualizar la noticia', 'error');
    }
  };

  if (loading) {
    return <Loading />;
  }

  console.log('Renderizando formulario con datos:', newsData);

  // Preparar los datos iniciales para el formulario a partir de newsData
  const formInitialData = newsData ? {
    title: newsData.title || '',
    subtitle: newsData.subtitle || '',
    summary: newsData.summary || '',
    content: newsData.content || '',
    author: newsData.author || '',
    status: newsData.status || 'draft',
    featured: newsData.featured || false,
    tags: newsData.tags || [],
    categories: newsData.categories || [],
    img_src: newsData.img_src || '',
    img_alt: newsData.img_alt || '',
    slug: newsData.slug
  } : null;

  return (
    <>
      <Header
        title="Editar Noticia"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Noticias', href: '/news' },
          { label: 'Editar', href: `/news/edit/${id}` }
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        {formInitialData ? (
          <NewsForm
            initialData={formInitialData}
            fullNewsData={newsData}
            onSave={handleSave}
            onCancel={() => router.push('/news')}
          />
        ) : (
          <div className="bg-red-900/20 text-red-300 p-4 rounded-lg">
            No se pudieron cargar los datos de la noticia.
          </div>
        )}
      </div>
    </>
  );
} 