'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import ComponentList from './components/ComponentList';
import { ComponentData } from '@/types/components';

export default function ComponentsPage() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null);

  const handleComponentSelect = (component: ComponentData) => {
    setSelectedComponent(component);
  };

  return (
    <>
      <Header
        title={selectedComponent ? `Editar ${selectedComponent.type}` : "Componentes"}
        isExpanded={true}
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Componentes', href: '/components' },
          ...(selectedComponent ? [{ label: selectedComponent.type, href: '#' }] : [])
        ]}
        actions={selectedComponent ? [
          {
            label: 'Editar',
            icon: 'FaEdit',
            onClick: () => handleComponentSelect(selectedComponent),
            variant: 'primary'
          }
        ] : []}
      />
      
      <div className="container mx-auto px-4 py-8">
        <ComponentList onSelect={handleComponentSelect} />
      </div>
    </>
  );
} 