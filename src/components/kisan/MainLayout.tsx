"use client";

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/kisan/AppSidebar';
import { Dashboard } from '@/components/kisan/Dashboard';
import { CropDiseaseDiagnosis } from '@/components/kisan/CropDiseaseDiagnosis';
import { MarketPriceAnalysis } from '@/components/kisan/MarketPriceAnalysis';
import { GovernmentSchemes } from '@/components/kisan/GovernmentSchemes';
import { ChatAssistant } from './ChatAssistant';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';

type View = 'dashboard' | 'disease' | 'market' | 'schemes' | 'chat';

export function MainLayout() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'disease':
        return <CropDiseaseDiagnosis />;
      case 'market':
        return <MarketPriceAnalysis />;
      case 'schemes':
        return <GovernmentSchemes />;
      case 'chat':
        return <ChatAssistant />;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  };

  return (
     <SidebarProvider>
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <SidebarInset className="flex flex-col min-h-screen">
            <main className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </main>
            <footer className="py-6 px-6 text-center text-sm text-muted-foreground border-t bg-background">
                <div className='flex justify-center items-center gap-4 mb-2'>
                    <Button variant="link" size="sm" className="text-muted-foreground">About</Button>
                    <Button variant="link" size="sm" className="text-muted-foreground">Privacy</Button>
                    <Button variant="link" size="sm" className="text-muted-foreground">Contact</Button>
                </div>
                <p className="font-semibold">A Procedural Prospectors Creation</p>
                <p className="mt-1">Developed by Sarvesh Ganesan</p>
                <p className="text-xs mt-2">Powered by Gemini + Firebase</p>
            </footer>
        </SidebarInset>
    </SidebarProvider>
  );
}
