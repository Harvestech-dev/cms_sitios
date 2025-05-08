'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import IconRenderer from '@/components/common/IconRenderer';

interface MenuItem {
  label: string;
  icon: string;
  href: string;
}

interface SidebarProps {
  items?: MenuItem[]; // Hacemos opcional items ya que definiremos el menú internamente
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Inicio',
    icon: 'FaHome',
    href: '/'
  },
  {
    label: 'Páginas',
    icon: 'FaFile',
    href: '/components'
  },
  {
    label: 'Noticias',
    icon: 'FaNewspaper',
    href: '/news'
  },
  {
    label: 'Productos',
    icon: 'FaBox',
    href: '/products'
  },
  {
    label: 'Media',
    icon: 'FaImage',
    href: '/media'
  }
];

export default function Sidebar({}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPinned, setIsPinned] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isActive = (href: string) => {
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

  return (
    <div
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        fixed top-16 left-0 h-[calc(100%-4rem)] bg-gray-900 text-gray-300
        transition-all duration-300 ease-in-out z-40
        ${isExpanded ? 'w-64' : 'w-16'}
        shadow-xl overflow-hidden
      `}
    >
      <nav className="pt-4 px-2 space-y-1 h-[calc(100%-4rem)] overflow-y-auto">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center px-3 py-3 rounded-md mb-2
              transition-colors duration-200
              ${!isExpanded ? 'justify-center w-12' : 'w-full'}
              ${isActive(item.href) 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <div className="flex items-center">
              <IconRenderer icon={item.icon} className={`
                w-5 h-5 transition-all duration-200
                ${!isExpanded ? 'mx-auto' : 'mr-3'}
              `} />
              {isExpanded && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* Botón de pin */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center px-4 border-t border-gray-800 bg-gray-900">
        <button
          onClick={handleTogglePin}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${isPinned ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}
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