'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { NewsItem, NewsFilters, NewsFormData } from '@/types/news';
import { useToast } from './ToastContext';

interface NewsContextType {
  news: NewsItem[];
  loading: boolean;
  error: Error | null;
  filters: NewsFilters;
  setFilters: (filters: NewsFilters) => void;
  refreshNews: () => Promise<void>;
  createNews: (news: NewsFormData) => Promise<void>;
  updateNews: (id: string, news: Partial<NewsFormData>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  getNewsById: (id: string) => NewsItem | undefined;
  totalCount: number;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<NewsFilters>({
    limit: 10,
    page: 1
  });
  const [totalCount, setTotalCount] = useState(0);
  const { showToast } = useToast();

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('news')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category) {
        query = query.contains('categories', filters.category.split(','));
      }
      if (filters.tag) {
        query = query.contains('tags', filters.tag.split(','));
      }
      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Ordenamiento
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc'
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Paginación
      const from = ((filters.page || 1) - 1) * (filters.limit || 10);
      const to = from + (filters.limit || 10) - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setNews(data || []);
      if (count !== null) setTotalCount(count);

    } catch (error) {
      setError(error as Error);
      showToast('Error al cargar las noticias', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [filters]);

  const createNews = async (newsData: NewsFormData) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .insert([{ ...newsData, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;

      setNews(prev => [data, ...prev]);
      showToast('Noticia creada correctamente', 'success');
    } catch (error) {
      showToast('Error al crear la noticia', 'error');
      throw error;
    }
  };

  const updateNews = async (id: string, newsData: Partial<NewsFormData>) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .update({ ...newsData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNews(prev => prev.map(item => item.id === id ? data : item));
      showToast('Noticia actualizada correctamente', 'success');
    } catch (error) {
      showToast('Error al actualizar la noticia', 'error');
      throw error;
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNews(prev => prev.filter(item => item.id !== id));
      showToast('Noticia eliminada correctamente', 'success');
    } catch (error) {
      showToast('Error al eliminar la noticia', 'error');
      throw error;
    }
  };

  const getNewsById = (id: string) => {
    return news.find(item => item.id === id);
  };

  const value = {
    news,
    loading,
    error,
    filters,
    setFilters,
    refreshNews: fetchNews,
    createNews,
    updateNews,
    deleteNews,
    getNewsById,
    totalCount
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews debe usarse dentro de un NewsProvider');
  }
  return context;
} 