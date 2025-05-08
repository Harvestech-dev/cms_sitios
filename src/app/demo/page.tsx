'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/products';
import { NewsItem } from '@/types/news';
import { ComponentData } from '@/types/components';
import ProductList from '@/app/products/components/ProductList';
import NewsList from '@/app/news/components/NewsList';
import ProductPreview from '@/app/products/components/ProductPreview';
import NewsPreview from '@/app/news/components/NewsPreview';
import PageRender from '@/components/common/PageRender';

interface APIMetrics {
  responseTime: number;
  dataSize: number;
  status: number;
  endpoint: string;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  api?: APIMetrics;
}

export default function DemoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedItem, setSelectedItem] = useState<'products' | 'news' | 'components'>('products');
  const [metrics, setMetrics] = useState<Record<string, PerformanceMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const measureAPICall = async (endpoint: string): Promise<[any, APIMetrics]> => {
    const startTime = performance.now();
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    const metrics: APIMetrics = {
      responseTime: performance.now() - startTime,
      dataSize: JSON.stringify(data).length,
      status: response.status,
      endpoint
    };

    return [data, metrics];
  };

  const measurePerformance = async (key: string, endpoint: string) => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize;

    try {
      const [data, apiMetrics] = await measureAPICall(endpoint);

      switch (key) {
        case 'products':
          setProducts(data);
          break;
        case 'news':
          setNews(data);
          break;
        case 'components':
          setComponents(data);
          break;
      }

      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize;

      setMetrics(prev => ({
        ...prev,
        [key]: {
          loadTime: endTime - startTime,
          renderTime: performance.now() - endTime,
          componentCount: document.querySelectorAll(`[data-component="${key}"]`).length,
          memoryUsage: endMemory ? endMemory - startMemory : undefined,
          api: apiMetrics
        }
      }));
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      setError(`Error cargando ${key}`);
    }
  };

  useEffect(() => {
    const loadDemoData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          measurePerformance('products', '/api/products?limit=100'),
          measurePerformance('news', '/api/news?limit=100'),
          measurePerformance('components', '/api/components')
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadDemoData();
  }, []);

  const renderMetrics = (key: string) => {
    const m = metrics[key];
    if (!m) return null;

    return (
      <div className="space-y-2">
        <div className="border-b border-gray-700 pb-2 mb-2">
          <p className="text-sm font-medium text-gray-300">Métricas de Renderizado</p>
          <p className="text-sm text-gray-400">Tiempo de carga: {m.loadTime.toFixed(2)}ms</p>
          <p className="text-sm text-gray-400">Tiempo de renderizado: {m.renderTime.toFixed(2)}ms</p>
          <p className="text-sm text-gray-400">Componentes: {m.componentCount}</p>
          {m.memoryUsage && (
            <p className="text-sm text-gray-400">
              Memoria: {(m.memoryUsage / 1024 / 1024).toFixed(2)}MB
            </p>
          )}
        </div>
        
        {m.api && (
          <div>
            <p className="text-sm font-medium text-gray-300">Métricas de API</p>
            <p className="text-sm text-gray-400">
              Endpoint: {m.api.endpoint}
            </p>
            <p className="text-sm text-gray-400">
              Tiempo de respuesta: {m.api.responseTime.toFixed(2)}ms
            </p>
            <p className="text-sm text-gray-400">
              Tamaño de datos: {(m.api.dataSize / 1024).toFixed(2)}KB
            </p>
            <p className="text-sm text-gray-400">
              Estado: {m.api.status}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Cargando datos de demo...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Demo - Pruebas de Rendimiento</h1>

        {/* Selector de vista */}
        <div className="flex gap-4 mb-8">
          {(['products', 'news', 'components'] as const).map(item => (
            <button
              key={item}
              onClick={() => setSelectedItem(item)}
              className={`px-4 py-2 rounded-lg ${
                selectedItem === item 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {/* Métricas de rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Productos ({products.length})</h2>
            {renderMetrics('products')}
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Noticias ({news.length})</h2>
            {renderMetrics('news')}
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Componentes ({components.length})</h2>
            {renderMetrics('components')}
          </div>
        </div>

        {/* Vista previa del contenido seleccionado */}
        <div className="space-y-8">
          {selectedItem === 'products' && (
            <>
              <section data-component="products">
                <h2 className="text-xl font-semibold mb-6">Lista de Productos</h2>
                <div className="bg-gray-800 rounded-lg mb-8">
                  <ProductList />
                </div>
                {products[0] && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Vista Previa de Producto</h3>
                    <ProductPreview product={products[0]} />
                  </div>
                )}
              </section>
            </>
          )}

          {selectedItem === 'news' && (
            <>
              <section data-component="news">
                <h2 className="text-xl font-semibold mb-6">Lista de Noticias</h2>
                <div className="bg-gray-800 rounded-lg mb-8">
                  <NewsList onEdit={() => {}} />
                </div>
                {news[0] && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Vista Previa de Noticia</h3>
                    <NewsPreview news={news[0]} />
                  </div>
                )}
              </section>
            </>
          )}

          {selectedItem === 'components' && (
            <section data-component="components">
              <h2 className="text-xl font-semibold mb-6">Componentes</h2>
              <div className="bg-gray-800 rounded-lg">
                {components.map(component => (
                  <div key={component.id} className="p-6 border-b border-gray-700 last:border-0">
                    <h3 className="text-lg font-semibold mb-4">{component.type}</h3>
                    <PageRender type={component.type} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
} 