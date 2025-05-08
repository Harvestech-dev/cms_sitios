'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import ProductList from './components/ProductList';

export default function ProductsPage() {
  const router = useRouter();

  return (
    <>
      <Header
        title="Productos"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Productos', href: '/products' }
        ]}
        actions={[
          {
            label: 'Nuevo producto',
            onClick: () => router.push('/products/new'),
            icon: 'FaPlus',
            variant: 'primary'
          }
        ]}
        isExpanded={false}
      />
      
      <div className="container mx-auto px-4 py-8">
        <ProductList onEdit={(id) => router.push(`/products/edit/${id}`)} />
      </div>
    </>
  );
} 