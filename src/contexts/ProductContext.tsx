'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, ProductFilters, ProductFormData } from '@/types/products';
import { useToast } from './ToastContext';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: Error | null;
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  refreshProducts: () => Promise<void>;
  createProduct: (data: ProductFormData) => Promise<Product>;
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<Product>;
}

const defaultFilters: ProductFilters = {
  page: 1,
  limit: 10,
  sortBy: 'created_at',
  sortOrder: 'desc'
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const { showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      // Aplicar filtros
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters.categories?.length) {
        query = query.contains('categories', filters.categories);
      }

      if (filters.tags?.length) {
        query = query.contains('tags', filters.tags);
      }

      const { data, error: fetchError } = await query
        .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

      if (fetchError) throw fetchError;

      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar productos'));
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (data: ProductFormData): Promise<Product> => {
    try {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    try {
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const duplicateProduct = async (id: string): Promise<Product> => {
    try {
      const productToDuplicate = products.find(p => p.id === id);
      if (!productToDuplicate) throw new Error('Producto no encontrado');

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([{
          ...productToDuplicate,
          id: undefined, // Supabase generará un nuevo ID
          title: `${productToDuplicate.title} (copia)`,
          slug: `${productToDuplicate.slug}-copy`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      console.error('Error duplicating product:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      error,
      filters,
      setFilters,
      refreshProducts: fetchProducts,
      createProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts debe usarse dentro de un ProductProvider');
  }
  return context;
} 