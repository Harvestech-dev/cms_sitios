'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { NewsItem, NewsFilters, NewsFormData } from '@/types/news';
import { useToast } from './ToastContext';

interface NewsContextType {
  news: NewsItem[];
  loading: boolean;
  error: Error | null;
  filters: NewsFilters;
  setFilters: (filters: NewsFilters) => void;
  totalCount: number;
  getNewsById: (id: string) => NewsItem | undefined;
  createNews: (data: NewsFormData) => Promise<void>;
  updateNews: (id: string, data: Partial<NewsFormData>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: React.ReactNode }) {
  // Estado para todas las noticias (caché)
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  // Estado para noticias filtradas
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<NewsFilters>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [totalCount, setTotalCount] = useState(0);

  const { showToast } = useToast();

  // Cargar todas las noticias al montar el componente
  const loadAllNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllNews(data || []);
      setFilteredNews(data || []);
    } catch (error) {
      setError(error as Error);
      showToast('Error al cargar las noticias', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Cargar datos iniciales
  useEffect(() => {
    loadAllNews();
  }, [loadAllNews]);

  // Filtrar noticias según los filtros activos
  const filterNews = useCallback(() => {
    let filtered = [...allNews];

    // Filtrar por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.author.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por estado
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Filtrar por destacados
    if (filters.featured !== undefined) {
      filtered = filtered.filter(item => item.featured === filters.featured);
    }

    // Filtrar por categoría
    if (filters.category) {
      const categories = filters.category.split(',');
      filtered = filtered.filter(item => 
        categories.some(cat => item.categories.includes(cat))
      );
    }

    // Filtrar por tags
    if (filters.tag) {
      const tags = filters.tag.split(',');
      filtered = filtered.filter(item => 
        tags.some(tag => item.tags.includes(tag))
      );
    }

    // Filtrar por fechas
    if (filters.dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.created_at) >= new Date(filters.dateFrom!)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.created_at) <= new Date(filters.dateTo!)
      );
    }

    // Aplicar ordenamiento
    filtered = sortNews(filtered, filters);

    // Actualizar total antes de la paginación
    setTotalCount(filtered.length);

    // Aplicar paginación
    const start = ((filters.page || 1) - 1) * (filters.limit || 10);
    const end = start + (filters.limit || 10);
    
    return filtered.slice(start, end);
  }, [allNews, filters]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    setFilteredNews(filterNews());
  }, [filters, filterNews]);

  // CRUD operations ahora actualizan tanto allNews como filteredNews
  const createNews = async (newsData: NewsFormData) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .insert([{ ...newsData, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;

      setAllNews(prev => [data, ...prev]);
      setFilteredNews(prev => [data, ...prev]);
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

      setAllNews(prev => prev.map(item => item.id === id ? data : item));
      setFilteredNews(prev => prev.map(item => item.id === id ? data : item));
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

      setAllNews(prev => prev.filter(item => item.id !== id));
      setFilteredNews(prev => prev.filter(item => item.id !== id));
      showToast('Noticia eliminada correctamente', 'success');
    } catch (error) {
      showToast('Error al eliminar la noticia', 'error');
      throw error;
    }
  };

  const getNewsById = useCallback((id: string) => {
    console.log('getNewsById called with id:', id);
    try {
      // Buscar en el array local
      const newsItem = allNews.find(item => item.id === id);
      console.log('Found news item in local data:', newsItem);
      return newsItem;
    } catch (error) {
      console.error('Error in getNewsById:', error);
      throw error;
    }
  }, [allNews]);

  const value = {
    news: filteredNews,
    loading,
    error,
    filters,
    setFilters,
    totalCount,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
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

const sortNews = (news: NewsItem[], filters: NewsFilters) => {
  if (filters.sortBy) {
    return [...news].sort((a, b) => {
      const aValue = a[filters.sortBy as keyof NewsItem] ?? '';
      const bValue = b[filters.sortBy as keyof NewsItem] ?? '';
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      return aValue > bValue ? order : -order;
    });
  }
  return news;
}; 