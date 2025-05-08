'use client';

import Header from '@/components/layout/Header';
import ProductForm from '../components/ProductForm';

export default function NewProductPage() {
  return (
    <>
      <Header
        title="Nuevo producto"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Productos', href: '/products' },
          { label: 'Nuevo producto', href: '/products/new' }
        ]}
        isExpanded={false}
      />
      
      <div className="container mx-auto px-4 py-8">
        <ProductForm />
      </div>
    </>
  );
} 