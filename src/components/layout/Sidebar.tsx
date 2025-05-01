'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import IconRenderer from '@/components/common/IconRenderer';
import { useComponents } from '@/contexts/ComponentsContext';

interface MenuItem {
  label: string;
  icon?: string;
  href?: string;
  items?: MenuItem[];
  collapsible?: boolean;
}

interface Component {
  id: number;
  name: string;
  type: string;
  page: string;
  order: number;
  status: 'draft' | 'published';
}

interface SidebarProps {
  items: MenuItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPinned, setIsPinned] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { components, loading } = useComponents();

  // Procesar los componentes para el menú
  const getPagesMenuItems = (): MenuItem[] => {
    const groupedByPage = components.reduce((acc: { [key: string]: Component[] }, component) => {
      if (!acc[component.page]) {
        acc[component.page] = [];
      }
      acc[component.page].push(component);
      return acc;
    }, {});

    return Object.entries(groupedByPage).map(([page, pageComponents]) => ({
      label: page.charAt(0).toUpperCase() + page.slice(1),
      collapsible: true,
      items: pageComponents.map((comp: Component) => ({
        label: comp.name,
        href: `/pages/${page}/${comp.type}`,
      }))
    }));
  };

  // Actualizar el menú con los componentes de páginas
  const getUpdatedMenu = () => {
    return items.map(item => {
      if (item.label === 'Páginas') {
        return {
          ...item,
          items: getPagesMenuItems()
        };
      }
      return item;
    });
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Manejar hover
  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsExpanded(false);
    }
  };

  // Toggle pin
  const handleTogglePin = () => {
    setIsPinned(!isPinned);
    setIsExpanded(!isPinned);
  };

  const renderMainItem = (item: MenuItem) => {
    const content = (
      <div className="flex items-center gap-3">
        {item.icon && (
          <IconRenderer icon={item.icon} className="w-5 h-5" />
        )}
        {isExpanded && (
          <span className="font-semibold whitespace-nowrap">{item.label}</span>
        )}
      </div>
    );

    const baseClasses = `
      flex items-center px-4 py-2 rounded-md
      ${!isExpanded ? 'justify-center' : ''}
    `;

    if (item.href) {
      return (
        <Link 
          href={item.href} 
          className={`
            ${baseClasses}
            ${isActive(item.href) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
          `}
        >
          {content}
        </Link>
      );
    }

    return (
      <div 
        className={`
          ${baseClasses}
          text-gray-300
          ${item.collapsible ? 'cursor-pointer hover:bg-gray-700' : 'cursor-default'}
          ${isActive(item.href) ? 'bg-gray-700 text-white' : ''}
        `}
      >
        <div className="flex-1">{content}</div>
      </div>
    );
  };

  const renderSubItems = (items: MenuItem[], level: number = 0) => {
    if (!items || !isExpanded) return null;

    return (
      <div className={`
        mt-1 space-y-1
        ${level === 0 ? 'ml-4' : 'ml-3 border-l border-gray-700'}
      `}>
        {items.map((item, index) => (
          <div key={item.label + index} className="relative">
            {/* Línea conectora para subitems */}
            {level > 0 && (
              <div className="absolute -left-px top-3 h-px w-3 bg-gray-700" />
            )}
            
            {/* Item */}
            <div className={level > 0 ? 'pl-4' : ''}>
              {renderMainItem(item)}
              {item.items && renderSubItems(item.items, level + 1)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        fixed top-16 left-0 h-[calc(100%-4rem)] bg-gray-900 text-gray-300
        transition-all duration-500 ease-in-out z-40
        ${isExpanded ? 'w-64' : 'w-16'}
        shadow-xl overflow-hidden
      `}
    >
      {/* Navigation con padding ajustado */}
      <nav className="pt-4 px-4 space-y-1 h-[calc(100%-4rem)] overflow-y-auto">
        {(loading ? items : getUpdatedMenu()).map((item, index) => (
          <div 
            key={item.label + index} 
            className={`
              mb-4 transition-all duration-500
              ${isExpanded ? 'opacity-100' : 'opacity-80'}
            `}
          >
            {renderMainItem(item)}
            {item.items && renderSubItems(item.items)}
          </div>
        ))}
      </nav>

      {/* Botón de pin en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-end px-4 border-t border-gray-800 bg-gray-900">
        <button
          onClick={handleTogglePin}
          className={`
            p-2 rounded-lg
            transition-all duration-300
            ${isPinned ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}
            ${!isExpanded && 'opacity-0'}
          `}
        >
          <IconRenderer 
            icon={isPinned ? 'FaLock' : 'FaLockOpen'} 
            className="w-4 h-4"
          />
        </button>
      </div>
    </div>
  );
} 