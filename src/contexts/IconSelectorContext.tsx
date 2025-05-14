'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import IconSelector from '@/components/common/IconSelector';

interface IconSelectorContextType {
  showIconSelector: boolean;
  currentIcon?: string;
  onIconSelect?: (icon: string) => void;
  openIconSelector: (currentIconOrConfig: string | { onSelect: (icon: string) => void }, onSelectCallback?: (icon: string) => void) => void;
  closeIconSelector: () => void;
}

const IconSelectorContext = createContext<IconSelectorContextType | undefined>(undefined);

export const IconSelectorProvider = ({ children }: { children: ReactNode }) => {
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [currentIcon, setCurrentIcon] = useState('');
  const [onSelectIcon, setOnSelectIcon] = useState<(icon: string) => void>(() => () => {});

  const openIconSelector = (
    currentIconOrConfig: string | { onSelect: (icon: string) => void },
    onSelectCallback?: (icon: string) => void
  ) => {
    if (typeof currentIconOrConfig === 'string') {
      setCurrentIcon(currentIconOrConfig);
      if (onSelectCallback) {
        setOnSelectIcon(() => onSelectCallback);
      }
    } else if (typeof currentIconOrConfig === 'object' && currentIconOrConfig !== null) {
      setCurrentIcon('');
      setOnSelectIcon(() => currentIconOrConfig.onSelect);
    }
    
    setShowIconSelector(true);
  };

  const closeIconSelector = () => {
    setShowIconSelector(false);
  };

  return (
    <IconSelectorContext.Provider
      value={{
        showIconSelector,
        currentIcon,
        onIconSelect: onSelectIcon,
        openIconSelector,
        closeIconSelector
      }}
    >
      {children}
      <div className="relative z-[100]">
        {showIconSelector && (
          <IconSelector
            isOpen={showIconSelector}
            onClose={closeIconSelector}
            onSelect={(icon) => {
              onSelectIcon(icon);
              closeIconSelector();
            }}
            currentIcon={currentIcon}
          />
        )}
      </div>
    </IconSelectorContext.Provider>
  );
};

export const useIconSelector = () => {
  const context = useContext(IconSelectorContext);
  if (!context) {
    throw new Error('useIconSelector debe usarse dentro de un IconSelectorProvider');
  }
  return context;
}; 


