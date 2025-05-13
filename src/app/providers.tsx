'use client';

import { ComponentsProvider } from '@/contexts/ComponentsContext';
import { MediaProvider } from '@/contexts/MediaContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { IconSelectorProvider } from '@/contexts/IconSelectorContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { NewsProvider } from '@/contexts/NewsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <MediaProvider>
        <NewsProvider>
          <ProductProvider>
            <ComponentsProvider>
              <IconSelectorProvider>
                {children}
              </IconSelectorProvider>
            </ComponentsProvider>
          </ProductProvider>
        </NewsProvider>
      </MediaProvider>
    </ToastProvider>
  );
} 