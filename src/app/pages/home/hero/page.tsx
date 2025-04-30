'use client';

import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { DynamicForm } from '@/components/common/DynamicForm';
import { RenderComponent } from '@/components/common/RenderComponent';

export default function HeroPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    txt_title: 'Bienvenido a nuestra plataforma',
    txtp_description: 'Descubre todo lo que tenemos para ti',
    img_background: {
      id: '1',
      url: '/images/hero-bg.jpg',
      alt: 'Hero background'
    },
    btn_cta: {
      label: 'Comenzar ahora',
      url: '/start',
      icon: 'FaArrowRight'
    }
  });

  const handleSave = (data: any) => {
    setFormData(data);
    setIsEditing(false);
  };

  return (
    <>
      <Header
        title="Hero"
        breadcrumbs={[/*...*/]}
        actions={[
          {
            label: 'Editar',
            onClick: () => setIsEditing(true),
            variant: 'secondary'
          }
        ]}
      />

      <div className="p-6">
        {/* Renderizado del componente con los datos actuales */}
        <RenderComponent type="hero_banner" content={formData} />
      </div>

      <DynamicForm
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
        initialData={formData}
        title="Editar Hero"
      />
    </>
  );
} 