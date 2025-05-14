'use client';

import React from 'react';
import { useComponents } from '@/contexts/ComponentsContext';
import HeroBanner from '@/app/pages/home/HeroBanner';
import BannerDemo from '@/app/pages/home/Banner_demo';
import { ComponentContent } from '@/types/components';
import ContactInfo from '@/app/pages/home/ContactInfo';
import FallbackComponent from './FallbackComponent';

interface RenderComponentProps {
  type: string;
  data?: any;
}

// Mapa de componentes disponibles
const componentMap = {
  hero_banner: HeroBanner,
  banner_demo: BannerDemo,
  contact_info: ContactInfo
  // Agregar más componentes según se necesiten
};

// Función para convertir valores que pueden ser objetos a strings simples
const getTextValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object' && value !== null) {
    // Si es un objeto con propiedad text, usar esa propiedad
    if ('text' in value) {
      return String(value.text);
    }
    // Intentar convertir el objeto a string de alguna manera
    return String(Object.values(value)[0] || '');
  }
  
  return String(value);
};

// Función para normalizar los datos del componente
const normalizeComponentData = (data: any): any => {
  if (!data) return {};
  
  // Si data contiene una propiedad content, extraerla
  if (data.content && typeof data.content === 'object') {
    console.log("Extrayendo content de data:", data.content);
    return normalizeComponentData(data.content);
  }
  
  const result = { ...data };
  
  // Recorrer todas las propiedades y convertir objetos con 'text' a strings simples
  Object.keys(result).forEach(key => {
    if (key.startsWith('txt_') || key.endsWith('_title') || key.endsWith('_subtitle') || key === 'title' || key === 'subtitle') {
      result[key] = getTextValue(result[key]);
    }
    
    // Manejar arrays recursivamente
    if (Array.isArray(result[key])) {
      result[key] = result[key].map((item: any) => 
        typeof item === 'object' && item !== null ? normalizeComponentData(item) : item
      );
    }
  });
  
  return result;
};

export default function RenderComponent({ type, data }: RenderComponentProps) {
  const { loading, error, getComponentByType } = useComponents();
  
  // Si no hay datos proporcionados, intentamos obtenerlos del contexto
  let componentData;
  if (!data) {
    console.log("No hay datos proporcionados, buscando en contexto para tipo:", type);
    const componentFromContext = getComponentByType(type);
    componentData = normalizeComponentData(componentFromContext);
    console.log("Datos obtenidos del contexto:", componentData);
  } else {
    console.log("Normalizando datos proporcionados:", data);
    componentData = normalizeComponentData(data);
  }
  
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

  if (!componentData || Object.keys(componentData).length === 0) {
    console.error("No se encontraron datos para el componente:", type);
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-300">No se encontró el componente o no tiene datos</div>
      </div>
    );
  }

  // Usar el mapa de componentes para encontrar el componente adecuado
  console.log("Buscando componente para tipo:", type);
  const Component = componentMap[type as keyof typeof componentMap];
  console.log("Componente encontrado:", Component ? "Sí" : "No");
  
  if (!Component) {
    console.error("No se encontró un componente para el tipo:", type);
    return <FallbackComponent content={{ type }} />;
  }

  console.log("Renderizando componente:", type, "con datos:", componentData);
  return <Component content={componentData} />;
} 