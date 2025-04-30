'use client';

import Link from 'next/link';
import { useState } from 'react';

const navigationItems = [
  { name: 'Sitio', href: '/site' },
  { name: 'Productos', href: '/products' },
  { name: 'Noticias', href: '/news' },
  { name: 'Media', href: '/media' },
];

export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-gray-700 bg-gray-800 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl flex items-center gap-2 text-white">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>CMS Web</span>
        </Link>

        {/* Navegación Principal */}
        <div className="hidden md:flex items-center gap-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-300 hover:text-gray-100 font-medium"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Menú Usuario */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-full text-gray-300"
          >
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="hidden md:block text-gray-300">Admin</span>
          </button>

          {/* Menú desplegable */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                Mi Perfil
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                Configuración
              </Link>
              <hr className="my-1 border-gray-700" />
              <button
                onClick={() => console.log('Cerrar sesión')}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 