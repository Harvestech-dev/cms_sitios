'use client';

import { useRouter } from 'next/navigation';
import IconRenderer from '@/components/common/IconRenderer';

interface QuickAccessItem {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

const QUICK_ACCESS: QuickAccessItem[] = [
  {
    title: 'Noticias',
    description: 'Ver, editar y publicar novedades',
    icon: 'FaNewspaper',
    path: '/news',
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    title: 'Productos',
    description: 'Administrar catálogo y stock',
    icon: 'FaBox',
    path: '/products',
    color: 'bg-green-600 hover:bg-green-700'
  },
  {
    title: 'Componentes',
    description: 'Secciones editables del sitio',
    icon: 'FaPuzzlePiece',
    path: '/components',
    color: 'bg-purple-600 hover:bg-purple-700'
  },
  {
    title: 'Medios',
    description: 'Administrar imágenes y archivos',
    icon: 'FaImage',
    path: '/media',
    color: 'bg-orange-600 hover:bg-orange-700'
  }
];

export default function QuickAccess() {
  const router = useRouter();

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <IconRenderer icon="FaCompass" className="w-5 h-5 text-blue-400" />
        Accesos Rápidos
      </h2>
      
      <div className="grid grid-cols-1 gap-3">
        {QUICK_ACCESS.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`${item.color} text-white rounded-lg p-4 transition-all w-full text-left`}
          >
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <IconRenderer icon={item.icon} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-200">{item.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 