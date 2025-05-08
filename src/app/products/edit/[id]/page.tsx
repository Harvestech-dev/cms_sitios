'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/types/products';
import Header from '@/components/layout/Header';
import ProductForm from '../../components/ProductForm';

interface Params {
  id: string;
}

export default function EditProductPage() {
  const { id } = useParams<Params>();
  const { products } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [id, products]);

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Cargando producto...</div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Editar producto"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Productos', href: '/products' },
          { label: 'Editar producto', href: `/products/edit/${id}` }
        ]}
        isExpanded={false}
      />
      
      <div className="container mx-auto px-4 py-8">
        <ProductForm initialData={product} isEdit />
      </div>
    </>
  );
} 