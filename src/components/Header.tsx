"use client";

import { useState } from 'react';
import { Logo } from '@/components/kisan/Logo';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavLink = {
  label: string;
  view: 'dashboard' | 'disease' | 'market' | 'schemes';
};

const navLinks: NavLink[] = [
  { label: 'Home', view: 'dashboard' },
  { label: 'Crop Diagnosis', view: 'disease' },
  { label: 'Price Insights', view: 'market' },
  { label: 'Schemes', view: 'schemes' },
];

type HeaderProps = {
  activeView: string;
  setActiveView: (view: 'dashboard' | 'disease' | 'market' | 'schemes') => void;
};

export function Header({ activeView, setActiveView }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full animate-in fade-in-down duration-300 shadow-lg">
      <div className="relative bg-gradient-to-r from-lime-300 via-green-500 to-green-700 text-white p-4 transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <Logo />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.view}
                variant="ghost"
                onClick={() => setActiveView(link.view)}
                className={cn(
                  'font-semibold text-white hover:bg-white/20 hover:scale-105 transition-all',
                  activeView === link.view && 'bg-white/25'
                )}
              >
                {link.label}
              </Button>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
             <p className="text-sm font-semibold">Powered by Google AI</p>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white/20"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-700/95 backdrop-blur-sm text-white animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col items-center gap-4 p-4">
            {navLinks.map((link) => (
              <Button
                key={link.view}
                variant="ghost"
                onClick={() => {
                  setActiveView(link.view);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  'w-full font-semibold text-white hover:bg-white/20 text-lg',
                  activeView === link.view && 'bg-white/25'
                )}
              >
                {link.label}
              </Button>
            ))}
             <p className="text-sm font-semibold pt-4 border-t border-white/20 w-full text-center">Powered by Google AI</p>
          </nav>
        </div>
      )}
    </header>
  );
}
