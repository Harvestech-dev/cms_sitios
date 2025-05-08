'use client';

import { useState } from 'react';
import { useComponents } from '@/contexts/ComponentsContext';
import IconRender from '@/components/common/IconRender';
import PageRender from '@/components/common/PageRender';
import DynamicForm from '@/components/common/DynamicForm';
import { useToast } from '@/contexts/ToastContext';

interface ComponentListProps {
  onEdit?: (id: string) => void; // Hacemos opcional onEdit ya que manejaremos la edición internamente
}

export default function ComponentList({}: ComponentListProps) {
  const { components, loading, updateComponent } = useComponents();
  const { showToast } = useToast();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const handleEdit = (component: any) => {
    setSelectedComponent(component);
    setShowDrawer(true);
  };

  const handleSave = async (data: any) => {
    try {
      await updateComponent(selectedComponent.id, data);
      showToast('Componente actualizado correctamente', 'success');
      setShowDrawer(false);
    } catch (error) {
      console.error('Error al actualizar componente:', error);
      showToast('Error al actualizar el componente', 'error');
    }
  };

  // Agrupar componentes por página
  const groupedComponents = components.reduce((acc, component) => {
    const page = component.page || 'Sin página';
    if (!acc[page]) {
      acc[page] = [];
    }
    acc[page].push(component);
    return acc;
  }, {} as Record<string, typeof components>);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">Cargando componentes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lista de páginas */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">Páginas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedComponents).map(([page, pageComponents]) => (
            <button
              key={page}
              onClick={() => setSelectedPage(page)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPage === page
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-blue-500/50 bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">{page}</h3>
                <span className="text-sm text-gray-400">
                  {pageComponents.length} componentes
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de componentes y previsualización */}
      {selectedPage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {groupedComponents[selectedPage].map(component => (
              <div
                key={component.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div>
                  <h3 className="text-white font-medium">{component.type}</h3>
                  <p className="text-sm text-gray-400">ID: {component.id}</p>
                </div>
                <button
                  onClick={() => handleEdit(component)}
                  className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <IconRender icon="FaEdit" className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Previsualización */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">
              Previsualización
            </h2>
            <div className="bg-gray-700 rounded-lg p-4">
              {selectedComponent && (
                <PageRender 
                  type={selectedComponent.type}
                  page={selectedComponent.page}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drawer de edición */}
      {showDrawer && selectedComponent && (
        <DynamicForm
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          onSave={handleSave}
          initialData={selectedComponent}
          title={`Editar ${selectedComponent.type}`}
        />
      )}
    </div>
  );
} 