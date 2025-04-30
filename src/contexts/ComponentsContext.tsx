'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { ComponentData } from '@/types/components';

interface ComponentsContextType {
  components: ComponentData[];
  loading: boolean;
  error: Error | null;
  refetchComponents: () => Promise<void>;
  getComponentsByPage: (page: string) => ComponentData[];
  getComponentByType: (type: string) => ComponentData | undefined;
  updateComponent: (type: string, data: Partial<ComponentData>) => void;
  saveComponent: (type: string, data: Partial<ComponentData>) => Promise<void>;
}

const ComponentsContext = createContext<ComponentsContextType | undefined>(undefined);

export function ComponentsProvider({ children }: { children: ReactNode }) {
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('components')
        .select('*')
        .order('page', { ascending: true })
        .order('order', { ascending: true });

      if (supabaseError) throw supabaseError;

      setComponents(data || []);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const getComponentsByPage = (page: string) => {
    return components.filter(comp => comp.page === page);
  };

  const getComponentByType = (type: string) => {
    return components.find(comp => comp.type === type);
  };

  const updateComponent = (type: string, data: Partial<ComponentData>) => {
    console.log('Actualizando componente en estado local:', { type, data });
    setComponents(prev => {
      const updated = prev.map(component => 
        component.type === type 
          ? { ...component, ...data }
          : component
      );
      console.log('Nuevo estado:', updated);
      return updated;
    });
  };

  const saveComponent = async (type: string, data: Partial<ComponentData>) => {
    try {
      console.log('Guardando componente:', type);
      console.log('Datos a actualizar:', data);

      const currentComponent = components.find(comp => comp.type === type);
      
      if (!currentComponent?.id) {
        throw new Error('Componente no encontrado');
      }

      console.log('ID del componente:', currentComponent.id);
      
      const { published_at, ...updateData } = data;

      // Log de la llamada exacta
      console.log('Llamada a Supabase:', {
        table: 'components',
        id: currentComponent.id,
        updateData
      });

      // Primero intentemos obtener el componente directamente
      const { data: existingData, error: fetchError } = await supabase
        .from('components')
        .select('*')
        .eq('id', currentComponent.id)
        .single();

      console.log('Componente existente en DB:', existingData);
      if (fetchError) {
        console.error('Error al obtener componente:', fetchError);
      }

      // Ahora intentamos la actualización
      const { data: updatedData, error: supabaseError } = await supabase
        .from('components')
        .update(updateData)
        .eq('id', currentComponent.id)
        .select();

      console.log('Respuesta completa de Supabase:', {
        updatedData,
        supabaseError,
        status: supabaseError?.status,
        message: supabaseError?.message,
        details: supabaseError?.details
      });

      if (supabaseError) {
        console.error('Error de Supabase:', supabaseError);
        throw supabaseError;
      }

      if (updatedData?.[0]) {
        console.log('Actualizando estado local con:', updatedData[0]);
        updateComponent(type, updatedData[0]);
      } else {
        console.warn('No se recibieron datos actualizados de Supabase');
      }

      return updatedData?.[0];
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err : new Error('Error al guardar el componente'));
      throw err;
    }
  };

  const value = {
    components,
    loading,
    error,
    refetchComponents: fetchComponents,
    getComponentsByPage,
    getComponentByType,
    updateComponent,
    saveComponent
  };

  return (
    <ComponentsContext.Provider value={value}>
      {children}
    </ComponentsContext.Provider>
  );
}

export function useComponents() {
  const context = useContext(ComponentsContext);
  if (context === undefined) {
    throw new Error('useComponents debe usarse dentro de un ComponentsProvider');
  }
  return context;
} 