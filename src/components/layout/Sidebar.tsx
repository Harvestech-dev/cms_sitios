'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
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

  const toggleExpand = (label: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderMainItem = (item: MenuItem) => {
    const content = (
      <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        {item.icon && (
          <IconRenderer icon={item.icon} className="w-5 h-5" />
        )}
        {!isCollapsed && (
          <span className="font-semibold">{item.label}</span>
        )}
      </div>
    );

    const baseClasses = `
      flex items-center px-4 py-2 rounded-md
      ${isCollapsed ? 'justify-center' : ''}
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

    const isExpanded = expandedItems.includes(item.label);

    return (
      <div 
        className={`
          ${baseClasses}
          text-gray-300
          ${item.collapsible ? 'cursor-pointer hover:bg-gray-700' : 'cursor-default'}
          ${isActive(item.href) ? 'bg-gray-700 text-white' : ''}
        `}
        onClick={item.collapsible ? (e) => toggleExpand(item.label, e) : undefined}
      >
        <div className="flex-1">{content}</div>
        {item.collapsible && !isCollapsed && (
          <IconRenderer
            icon={isExpanded ? 'FaChevronDown' : 'FaChevronRight'}
            className={`w-4 h-4 transition-transform`}
          />
        )}
      </div>
    );
  };

  const renderSubItems = (items: MenuItem[], level: number = 0) => {
    if (!items || isCollapsed) return null;

    return (
      <div className={`
        mt-1 space-y-1
        ${level === 0 ? 'ml-4' : 'ml-3 border-l border-gray-700'}
      `}>
        {items.map((item, index) => {
          const isExpanded = expandedItems.includes(item.label);
          const showSubItems = !item.collapsible || isExpanded;

          return (
            <div key={item.label + index} className="relative">
              {/* Línea conectora para subitems */}
              {level > 0 && (
                <div className="absolute -left-px top-3 h-px w-3 bg-gray-700" />
              )}
              
              {/* Item */}
              <div className={level > 0 ? 'pl-4' : ''}>
                {renderMainItem(item)}
                {showSubItems && item.items && renderSubItems(item.items, level + 1)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-800 border-r border-gray-700
        transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 bg-gray-800 border border-gray-700 rounded-full p-1 shadow-sm"
      >
        <IconRenderer
          icon={isCollapsed ? 'FaChevronRight' : 'FaChevronLeft'}
          className={`w-4 h-4 text-gray-400`}
        />
      </button>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {(loading ? items : getUpdatedMenu()).map((item, index) => (
          <div key={item.label + index} className="mb-4">
            {renderMainItem(item)}
            {item.items && renderSubItems(item.items)}
          </div>
        ))}
      </nav>
    </aside>
  );
} 