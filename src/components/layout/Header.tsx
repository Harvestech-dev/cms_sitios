'use client';

import Link from 'next/link';
import IconRenderer from '@/components/common/IconRenderer';

interface Breadcrumb {
  label: string;
  href: string;
}

interface Action {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: string;
  disabled?: boolean;
  tooltip?: string;
}

interface Status {
  label: string;
  type: 'draft' | 'published';
}

interface HeaderProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  actions: Action[];
  status?: Status;
}

export default function Header({ title, breadcrumbs, actions, status }: HeaderProps) {
  const getActionStyle = (variant: Action['variant']) => {
    const baseStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-blue-600 text-white hover:bg-blue-700`;
      case 'secondary':
        return `${baseStyle} bg-gray-700 text-gray-300 hover:bg-gray-600`;
      default:
        return baseStyle;
    }
  };

  const getStatusStyle = (type: Status['type']) => {
    const baseStyle = "flex items-center gap-2 px-3 py-1 rounded-full text-sm";
    switch (type) {
      case 'published':
        return `${baseStyle} bg-green-500/10 text-green-500`;
      case 'draft':
        return `${baseStyle} bg-yellow-500/10 text-yellow-500`;
      default:
        return baseStyle;
    }
  };

  return (
    <header className="sticky top-16 z-40 bg-gray-800 border-b border-gray-700 px-64">
      <div className="container mx-auto px-6 py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          {breadcrumbs.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {index > 0 && (
                <IconRenderer
                  icon="FaChevronRight"
                  className="w-3 h-3 mx-2 text-gray-600"
                />
              )}
              <Link
                href={item.href}
                className="hover:text-gray-300 transition-colors"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {status && (
              <div className={getStatusStyle(status.type)}>
                <IconRenderer
                  icon={status.type === 'published' ? 'FaCheckCircle' : 'FaClock'}
                  className="w-4 h-4"
                />
                <span>{status.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {actions?.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                title={action.tooltip}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${action.variant === 'primary' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                `}
              >
                {action.icon && (
                  <IconRenderer icon={action.icon} className="w-4 h-4" />
                )}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
} 