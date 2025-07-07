"use client";

import { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/kisan/Logo';
import { Dashboard } from '@/components/kisan/Dashboard';
import { CropDiseaseDiagnosis } from '@/components/kisan/CropDiseaseDiagnosis';
import { MarketPriceAnalysis } from '@/components/kisan/MarketPriceAnalysis';
import { GovernmentSchemes } from '@/components/kisan/GovernmentSchemes';
import { LayoutDashboard, Sprout, BarChart3, Landmark } from 'lucide-react';

type View = 'dashboard' | 'disease' | 'market' | 'schemes';

export function MainLayout() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'disease':
        return <CropDiseaseDiagnosis />;
      case 'market':
        return <MarketPriceAnalysis />;
      case 'schemes':
        return <GovernmentSchemes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('dashboard')} isActive={activeView === 'dashboard'} tooltip="Dashboard">
                <LayoutDashboard />
                <span className="font-headline">Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('disease')} isActive={activeView === 'disease'} tooltip="Crop Disease Diagnosis">
                <Sprout />
                <span className="font-headline">Crop Diagnosis</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('market')} isActive={activeView === 'market'} tooltip="Market Price Analysis">
                <BarChart3 />
                <span className="font-headline">Market Prices</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('schemes')} isActive={activeView === 'schemes'} tooltip="Government Schemes">
                <Landmark />
                <span className="font-headline">Govt. Schemes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="farmer profile" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">User</span>
              <span className="text-xs text-muted-foreground">Farmer</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <div className="flex-1">
                <h1 className="text-xl font-semibold font-headline capitalize">{activeView.replace('-', ' ')}</h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
