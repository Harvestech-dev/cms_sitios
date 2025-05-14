'use client';

import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { ComponentsProvider } from '@/contexts/ComponentsContext';
import { MediaProvider } from '@/contexts/MediaContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { IconSelectorProvider } from '@/contexts/IconSelectorContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { NewsProvider } from '@/contexts/NewsContext';
import { ToastContainer } from '@/components/common/ToastContainer';
import { inter } from '@/lib/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ToastProvider>
          <MediaProvider>
            <NewsProvider>
              <ProductProvider>
                <ComponentsProvider>
                  <IconSelectorProvider>
                    <div className="min-h-screen bg-gray-900 text-gray-100">
                      <Sidebar />
                      <main className="mx-[180px] pt-[72px]">
                        {children}
                      </main>
                    </div>
                  </IconSelectorProvider>
                </ComponentsProvider>
              </ProductProvider>
            </NewsProvider>
          </MediaProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
