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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Phone } from 'lucide-react';

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
            <main className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 flex flex-col"
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </main>
            <footer className="py-6 px-6 text-center text-sm text-muted-foreground border-t bg-background">
                <div className='flex justify-center items-center gap-4 mb-2'>
                    {/* About Us Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm" className="text-muted-foreground">About</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>About Kisan Mitra</DialogTitle>
                          <DialogDescription>
                            AI-powered assistance for the modern farmer.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <p className="text-sm text-foreground">
                            Kisan Mitra is a project by <span className="font-semibold">Procedural Prospectors</span>, a team of passionate third-year Computer Science students from Amrita Vishwa Vidyapeetham.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            We specialize in applying cutting-edge Generative AI to solve real-world problems. Our goal with Kisan Mitra is to empower farmers with accessible, intelligent tools to increase yield, improve decision-making, and secure their livelihoods. This application is a testament to our commitment to innovation and social impact.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Privacy Policy Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm" className="text-muted-foreground">Privacy</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Privacy Policy</DialogTitle>
                          <DialogDescription>
                            Your privacy is important to us.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 text-sm text-muted-foreground">
                           <p>
                            Kisan Mitra is committed to protecting your privacy. This policy outlines how we handle your information:
                          </p>
                           <ul className="list-disc list-inside space-y-2">
                            <li>
                              <strong>Information We Collect:</strong> We collect information you provide, such as text queries, uploaded images of crops, and locations for market analysis. We log these interactions to improve our AI models and provide a better service.
                            </li>
                            <li>
                              <strong>How We Use Information:</strong> Your data is used solely for the purpose of providing the app's services, such as diagnosing crop diseases or fetching market prices. We may use anonymized data to enhance our AI's accuracy.
                            </li>
                             <li>
                              <strong>Data Storage:</strong> Your interaction data is stored securely using Firebase Firestore. We do not share your personal information with third parties.
                            </li>
                             <li>
                              <strong>Your Consent:</strong> By using Kisan Mitra, you consent to our privacy policy.
                            </li>
                          </ul>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Contact Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                         <Button variant="link" size="sm" className="text-muted-foreground">Contact</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Contact Us</DialogTitle>
                           <DialogDescription>
                            We'd love to hear from you.
                          </DialogDescription>
                        </DialogHeader>
                         <div className="grid gap-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                For any questions, feedback, or support, please reach out to us.
                            </p>
                            <div className="flex flex-col gap-4">
                               <a href="mailto:sarveshganesan3@gmail.com" className="flex items-center gap-3 group">
                                    <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-foreground group-hover:text-primary transition-colors">sarveshganesan3@gmail.com</span>
                                </a>
                                <a href="tel:+917305973321" className="flex items-center gap-3 group">
                                    <Phone className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-foreground group-hover:text-primary transition-colors">+91 7305973321</span>
                                </a>
                            </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                </div>
                <p className="font-semibold">A Procedural Prospectors Creation</p>
                <p className="mt-1">Developed by Sarvesh Ganesan</p>
                <p className="text-xs mt-2">Powered by Gemini + Firebase</p>
            </footer>
        </SidebarInset>
    </SidebarProvider>
  );
}
