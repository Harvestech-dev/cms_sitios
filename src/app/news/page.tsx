'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import NewsList from './components/NewsList';

export default function NewsPage() {
  const router = useRouter();

  return (
    <>
      <Header
        title="Noticias"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Noticias', href: '/news' }
        ]}
        actions={[
          {
            label: 'Nueva Noticia',
            onClick: () => router.push('/news/create'),
            icon: 'FaPlus',
            variant: 'primary'
          }
        ]}
        isExpanded={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        <NewsList />
      </div>
    </>
  );
} 