'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useComponents } from '@/contexts/ComponentsContext';
import { useToast } from '@/contexts/ToastContext';
import DynamicForm from '@/components/common/DynamicForm';
import Header from '@/components/layout/Header';

export default function EditComponentPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [component, setComponent] = useState<any>(null);
  const { getComponentById, updateComponent } = useComponents();
  const { showToast } = useToast();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        const data = await getComponentById(id);
        
        // Log para depuración
        console.log('Componente cargado:', data);
        
        if (!data) {
          showToast('No se encontró el componente', 'error');
          router.push('/components');
          return;
        }
        
        setComponent(data);
      } catch (error) {
        console.error('Error loading component:', error);
        showToast('Error al cargar el componente', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [id, getComponentById, router, showToast]);

  const handleSubmit = async (formData: any) => {
    try {
      // Log para depuración
      console.log('Datos a guardar:', formData);
      
      await updateComponent(id, formData);
      showToast('Componente actualizado correctamente', 'success');
      router.push('/components');
    } catch (error) {
      console.error('Error updating component:', error);
      showToast('Error al actualizar el componente', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header
        title={`Editar ${component?.type || 'Componente'}`}
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Componentes', href: '/components' },
          { label: 'Editar', href: `/components/edit/${id}` }
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          {component ? (
            <>
              <h2 className="text-xl font-bold mb-6">
                Editar componente: {component.title || component.name || id}
              </h2>
              
              {/* Agregar log antes de renderizar el formulario */}
              {console.log('Renderizando DynamicForm con datos:', component)}
              
              <DynamicForm
                initialData={component}
                onSubmit={handleSubmit}
                requiredFields={['title', 'type']}
                excludeKeys={['id', 'created_at', 'updated_at']}
              />
            </>
          ) : (
            <div className="text-red-500">No se pudo cargar el componente</div>
          )}
        </div>
      </div>
    </>
  );
} 