'use client';

import { useParams } from 'next/navigation';
import PageRender from '@/components/common/PageRender';

export default function DynamicPage() {
  const params = useParams();
  const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug];
  
  // La URL será /pages/[page]/[type]
  // Ejemplo: /pages/home/hero_banner
  const [page, type] = slugArray;

  if (!page || !type) {
    return (
      <div className="p-6 text-gray-300">
        Página no encontrada
      </div>
    );
  }

  return <PageRender page={page} type={type} />;
} 