'use client';

import { usePathname } from 'next/navigation';
import IconRenderer from '@/components/common/IconRenderer';

interface FooterProps {
  tip?: string;
  info?: string;
  showPath?: boolean;
}

export default function Footer({ tip, info, showPath = false }: FooterProps) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const formatPath = (path: string) => {
    return path
      .split('/')
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' / ');
  };

  return (
    <footer className="border-t border-gray-700 bg-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Información Principal */}
          <div className="text-sm text-gray-300">
            © {currentYear} CMS Web. Todos los derechos reservados.
          </div>

          {/* Tips e Info */}
          <div className="flex flex-col md:flex-row gap-4 text-sm">
            {tip && (
              <div className="flex items-center gap-2 text-blue-400">
                <IconRenderer icon="FaInfoCircle" className="w-4 h-4" />
                <span>{tip}</span>
              </div>
            )}
            
            {info && (
              <div className="flex items-center gap-2 text-gray-400">
                <IconRenderer icon="FaRegClock" className="w-4 h-4" />
                <span>{info}</span>
              </div>
            )}
          </div>

          {/* Ruta Actual */}
          {showPath && pathname && (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <IconRenderer icon="FaFolder" className="w-4 h-4" />
              <span>{formatPath(pathname)}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
} 