"use client";

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/kisan/AppSidebar';
import { Dashboard } from '@/components/kisan/Dashboard';
import { CropDiseaseDiagnosis } from '@/components/kisan/CropDiseaseDiagnosis';
import { MarketPriceAnalysis } from '@/components/kisan/MarketPriceAnalysis';
import { GovernmentSchemes } from '@/components/kisan/GovernmentSchemes';
import { ChatAssistant } from './ChatAssistant';

type View = 'dashboard' | 'disease' | 'market' | 'schemes' | 'chat';

export function MainLayout() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    // The key forces a re-render and re-trigger of animations when the view changes
    switch (activeView) {
      case 'dashboard':
        return <div key="dashboard" className="animate-in fade-in duration-500"><Dashboard setActiveView={setActiveView} /></div>;
      case 'disease':
        return <div key="disease" className="animate-in fade-in duration-500"><CropDiseaseDiagnosis /></div>;
      case 'market':
        return <div key="market" className="animate-in fade-in duration-500"><MarketPriceAnalysis /></div>;
      case 'schemes':
        return <div key="schemes" className="animate-in fade-in duration-500"><GovernmentSchemes /></div>;
      case 'chat':
        return <div key="chat" className="animate-in fade-in duration-500"><ChatAssistant /></div>;
      default:
        return <div key="dashboard-default" className="animate-in fade-in duration-500"><Dashboard setActiveView={setActiveView} /></div>;
    }
  };

  return (
     <SidebarProvider>
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <SidebarInset className="flex flex-col min-h-screen">
            <main className="flex-1">
                {renderView()}
            </main>
            <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t bg-background">
                <p className="font-semibold">A Procedural Prospectors Creation</p>
                <p className="mt-1 font-body">Developed by Sarvesh Ganesan</p>
            </footer>
        </SidebarInset>
    </SidebarProvider>
  );
}
