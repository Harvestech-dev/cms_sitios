'use client';

import { useState } from 'react';
import { useComponents } from '@/contexts/ComponentsContext';
import Header from '@/components/layout/Header';
import RenderComponent from '@/components/common/RenderComponent';
import DynamicForm from '@/components/common/DynamicForm';
import { useToast } from '@/contexts/ToastContext';
import type { ComponentContent } from '@/types/components';

interface PageRenderProps {
  type: string;
  page: string;
}

export default function PageRender({ type, page }: PageRenderProps) {
  const { getComponentByType, updateComponent, saveComponent } = useComponents();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const componentData = getComponentByType(type);

  const handleSave = async (content: ComponentContent) => {
    try {
      updateComponent(type, { content, status: 'draft' });

      await saveComponent(type, { 
        content,
        status: 'draft'
      });

      setIsEditing(false);
      showToast('Cambios guardados correctamente', 'success');
    } catch (error) {
      console.error(error);
      showToast('Error al guardar los cambios', 'error');
      if (componentData) {
        updateComponent(type, componentData);
      }
    }
  };

  const handlePublish = async () => {
    try {
      if (!componentData) {
        showToast('No se encontró el componente', 'error');
        return;
      }

      setIsPublishing(true);
      
      await saveComponent(type, { 
        status: 'published'
      });

      showToast('Componente publicado correctamente', 'success');
    } catch (error) {
      console.error('Error al publicar:', error);
      showToast('Error al publicar el componente', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Header
        title={componentData?.name || 'Componente'}
        breadcrumbs={[
          { label: 'Páginas', href: '/pages' },
          { label: page, href: `/pages/${page}` },
          { label: componentData?.name || 'Componente', href: '#' }
        ]}
        actions={[
          {
            label: 'Editar',
            onClick: () => setIsEditing(true),
            icon: 'FaEdit',
            variant: 'secondary'
          },
          {
            label: isPublishing ? 'Publicando...' : 'Publicar',
            onClick: handlePublish,
            icon: 'FaGlobe',
            variant: 'primary',
            disabled: isPublishing || componentData?.status === 'published',
            tooltip: componentData?.status === 'published' 
              ? 'Este componente ya está publicado'
              : undefined
          }
        ]}
        status={{
          label: componentData?.status === 'published' ? 'Publicado' : 'Borrador',
          type: componentData?.status || 'draft'
        }}
        isExpanded={true}
      />

      <div className="p-6">
        <RenderComponent 
          type={type} 
        />
      </div>

      <DynamicForm
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
        initialData={componentData?.content || {}}
        title={`Editar ${componentData?.name || 'Componente'}`}
      />
    </>
  );
} 