'use client';

import { useState, useEffect } from 'react';
import WelcomeHeader from '@/components/home/WelcomeHeader';
import QuickAccess from '@/components/home/QuickAccess';
import StatsSummary from '@/components/home/StatsSummary';
import ActivityTimeline from '@/components/home/ActivityTimeline';
import HelpTips from '@/components/home/HelpTips';
import AdminSection from '@/components/home/AdminSection';
import GlobalSearch from '@/components/home/GlobalSearch';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState('Usuario');
  
  return (
    <>
      <Header
        title="Dashboard"
        breadcrumbs={[
          { label: 'Inicio', href: '/' }
        ]}
        actions={[
          {
            label: 'Ayuda',
            onClick: () => window.open('https://docs.example.com', '_blank'),
            icon: 'FaQuestion',
            variant: 'secondary'
          }
        ]}
      />

      <div className="container mx-auto px-6 py-6">
        {/* Sección principal con layout de grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda (2/3 del ancho en pantallas grandes) */}
          <div className="lg:col-span-2 space-y-6">
            <WelcomeHeader username={username} />
            <GlobalSearch />
            <StatsSummary />
            <ActivityTimeline />
          </div>
          
          {/* Columna derecha (1/3 del ancho en pantallas grandes) */}
          <div className="space-y-6">
            <QuickAccess />
            <HelpTips />
            <AdminSection />
          </div>
        </div>
      </div>
    </>
  );
}
