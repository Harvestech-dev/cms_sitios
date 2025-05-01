'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import IconSelector from '@/components/common/IconSelector';

interface IconSelectorContextType {
  showIconSelector: boolean;
  currentIcon?: string;
  onIconSelect?: (icon: string) => void;
  openIconSelector: (currentIcon: string, onSelect: (icon: string) => void) => void;
  closeIconSelector: () => void;
}

const IconSelectorContext = createContext<IconSelectorContextType | undefined>(undefined);

export function IconSelectorProvider({ children }: { children: ReactNode }) {
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [currentIcon, setCurrentIcon] = useState<string>();
  const [onIconSelect, setOnIconSelect] = useState<((icon: string) => void) | undefined>();

  const openIconSelector = (current: string, onSelect: (icon: string) => void) => {
    setCurrentIcon(current);
    setOnIconSelect(() => onSelect);
    setShowIconSelector(true);
  };

  const closeIconSelector = () => {
    setShowIconSelector(false);
    setCurrentIcon(undefined);
    setOnIconSelect(undefined);
  };

  return (
    <IconSelectorContext.Provider
      value={{
        showIconSelector,
        currentIcon,
        onIconSelect,
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
              onIconSelect?.(icon);
              closeIconSelector();
            }}
            currentIcon={currentIcon}
          />
        )}
      </div>
    </IconSelectorContext.Provider>
  );
}

export const useIconSelector = () => {
  const context = useContext(IconSelectorContext);
  if (!context) {
    throw new Error('useIconSelector must be used within an IconSelectorProvider');
  }
  return context;
}; 