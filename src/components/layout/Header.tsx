'use client';

import IconRenderer from '@/components/common/IconRenderer';

interface HeaderAction {
  label: string;
  onClick: () => void;
  icon: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  tooltip?: string;
}

interface Breadcrumb {
  label: string;
  href: string;
}

interface HeaderProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  actions?: HeaderAction[];
  status?: {
    label: string;
    color: string;
  };
}

export default function Header({ 
  title, 
  breadcrumbs, 
  actions = [], 
  status
}: HeaderProps) {
  return (
    <div className="fixed top-0  left-[180px] right-[180px] bg-gray-900 border-b border-gray-800 z-10">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              {breadcrumbs.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  {index > 0 && (
                    <IconRenderer 
                      icon="FaChevronRight" 
                      className="w-3 h-3 mx-2 text-gray-600" 
                    />
                  )}
                  <a 
                    href={item.href} 
                    className="hover:text-gray-200 transition-colors"
                  >
                    {item.label}
                  </a>
                </div>
              ))}
            </div>
            
            {/* Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{title}</h1>
              {status && (
                <span 
                  className={`px-2 py-1 text-xs rounded-full ${status.color}`}
                >
                  {status.label}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex items-center gap-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  title={action.tooltip}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md
                    ${action.variant === 'secondary' 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'}
                    ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    transition-colors
                  `}
                >
                  <IconRenderer icon={action.icon} className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 