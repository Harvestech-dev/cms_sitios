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
      const currentComponent = components.find(comp => comp.type === type);
      
      if (!currentComponent?.id) {
        throw new Error('Componente no encontrado');
      }

      const { error: supabaseError } = await supabase
        .from('components')
        .update(data)
        .eq('id', currentComponent.id)
        .select();

      if (supabaseError) throw supabaseError;

      // Actualizar estado local
      updateComponent(type, data);
    } catch (err) {
      console.error('Error al guardar componente:', err);
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
  if (!context) {
    throw new Error('useComponents debe ser usado dentro de ComponentsProvider');
  }
  
  // Mejorar la función getComponentByType para que devuelva datos más consistentes
  const getComponentByType = (type: string) => {
    console.log("Buscando componente tipo:", type, "en", context.components);
    const component = context.components.find(c => c.type === type);
    console.log("Componente encontrado:", component ? "Sí" : "No", component);
    return component;
  };

  return {
    ...context,
    getComponentByType
  };
} 