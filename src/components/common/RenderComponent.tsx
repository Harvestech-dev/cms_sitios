'use client';

import { useComponents } from '@/contexts/ComponentsContext';
import HeroBanner from '@/app/pages/home/HeroBanner';
import BannerDemo from '@/app/pages/home/Banner_demo';
import { ComponentContent } from '@/types/components';
import ContactInfo from '@/app/pages/home/ContactInfo';
interface RenderComponentProps {
  type: string;
  content?: ComponentContent;
}

const componentMap = {
  hero_banner: HeroBanner,
  banner_demo: BannerDemo,
  contact_info: ContactInfo
  // Agregar más componentes según se necesiten
};

export default function RenderComponent({ type, content }: RenderComponentProps) {
  const { loading, error, getComponentByType } = useComponents();
  const componentData = content || getComponentByType(type)?.content;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-300">Cargando componente...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-red-400">Error: {error.message}</div>
      </div>
    );
  }

  if (!componentData) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-300">No se encontró el componente</div>
      </div>
    );
  }

  const Component = componentMap[type as keyof typeof componentMap];

  if (!Component) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="text-yellow-400">
          Componente &quot;{type}&quot; no implementado
        </div>
        <div className="text-yellow-400">
          Comuniquese con el administrador del sitio para que se implemente el componente
        </div>
      </div>
    );
  }

  return <Component content={componentData} />;
} 