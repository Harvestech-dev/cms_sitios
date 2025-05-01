'use client';

import { NewsProvider } from '@/contexts/NewsContext';

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <NewsProvider>
      <div className="min-h-screen bg-gray-900 pt-16">
        {children}
      </div>
    </NewsProvider>
  );
} 