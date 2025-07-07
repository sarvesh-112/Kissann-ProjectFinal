"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/kisan/Logo';
import { Home, Leaf, BarChart3, Landmark, MessageSquare } from 'lucide-react';

type NavLink = {
  label: string;
  view: 'dashboard' | 'disease' | 'market' | 'schemes' | 'chat';
  icon: React.ElementType;
};

const navLinks: NavLink[] = [
  { label: 'Home', view: 'dashboard', icon: Home },
  { label: 'Crop Diagnosis', view: 'disease', icon: Leaf },
  { label: 'Price Insights', view: 'market', icon: BarChart3 },
  { label: 'Schemes', view: 'schemes', icon: Landmark },
  { label: 'KisanBot', view: 'chat', icon: MessageSquare },
];

type AppSidebarProps = {
  activeView: string;
  setActiveView: (view: 'dashboard' | 'disease' | 'market' | 'schemes' | 'chat') => void;
};

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between">
            <div className="group-data-[collapsible=icon]:hidden">
                <Logo />
            </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => (
            <SidebarMenuItem key={link.view}>
              <SidebarMenuButton
                onClick={() => setActiveView(link.view)}
                isActive={activeView === link.view}
                tooltip={link.label}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <p className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            Powered by Google AI
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
