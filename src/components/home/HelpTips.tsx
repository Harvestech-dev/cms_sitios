'use client';

import { useState, useEffect } from 'react';
import IconRenderer from '@/components/common/IconRenderer';

const TIPS = [
  {
    id: 1,
    text: '¿Sabías que puedes arrastrar y soltar medios directamente en el editor?',
    icon: 'FaLightbulb'
  },
  {
    id: 2,
    text: 'Utiliza etiquetas en tus productos para mejorar la navegación en tu tienda.',
    icon: 'FaTags'
  },
  {
    id: 3,
    text: 'Programar publicaciones te permite preparar contenido con anticipación.',
    icon: 'FaClock'
  },
  {
    id: 4,
    text: 'Las imágenes optimizadas mejoran el rendimiento de tu sitio web.',
    icon: 'FaImage'
  },
  {
    id: 5,
    text: 'No olvides revisar las estadísticas de visitas semanalmente.',
    icon: 'FaChartLine'
  }
];

const HELP_LINKS = [
  {
    title: 'Centro de ayuda',
    description: 'Consulta nuestra documentación',
    icon: 'FaQuestion',
    url: '#'
  },
  {
    title: 'Video tutoriales',
    description: 'Aprende con ejemplos prácticos',
    icon: 'FaVideo',
    url: '#'
  },
  {
    title: 'Contactar soporte',
    description: 'Obtén ayuda personalizada',
    icon: 'FaHeadset',
    url: '#'
  }
];

export default function HelpTips() {
  const [currentTip, setCurrentTip] = useState(0);

  // Cambiar el tip cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <IconRenderer icon="FaLightbulb" className="w-5 h-5 text-yellow-400" />
        Consejos y Ayuda
      </h2>
      
      {/* Tip del día */}
      <div className="mb-6 bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-lg">
            <IconRenderer icon={TIPS[currentTip].icon} className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-white text-sm font-medium mb-1">Tip del día</h3>
            <p className="text-gray-300 text-sm">
              {TIPS[currentTip].text}
            </p>
          </div>
        </div>
      </div>
      
      {/* Links de ayuda */}
      <div className="space-y-3">
        {HELP_LINKS.map((link) => (
          <a
            key={link.title}
            href={link.url}
            className="block bg-gray-700 hover:bg-gray-650 rounded-lg p-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <IconRenderer icon={link.icon} className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white text-sm font-medium">{link.title}</h3>
                <p className="text-gray-400 text-xs">{link.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 