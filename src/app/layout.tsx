import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import navigationData from "@/data/navigation.json";
import { ComponentsProvider } from '@/contexts/ComponentsContext';
import { MediaProvider } from '@/contexts/MediaContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { IconSelectorProvider } from '@/contexts/IconSelectorContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { NewsProvider } from '@/contexts/NewsContext';

export const metadata: Metadata = {
  title: "CMS Web",
  description: "Sistema de gestión de contenidos web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-900">
        <ToastProvider>
          <MediaProvider>
            <NewsProvider>
              <ProductProvider>
                <ComponentsProvider>
                  <IconSelectorProvider>
                    <Navbar />
                    <Sidebar items={navigationData.sidebarItems} />
                    <div className="flex flex-col min-h-screen mt-36 pt-20 px-64">
                      <main className="flex-1">
                        {children}
                      </main>
                    </div>
                    <Footer
                      showPath={true}
                      tip="Presiona Ctrl + S para guardar los cambios"
                      info="Última actualización: hace 5 minutos"
                    />
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
