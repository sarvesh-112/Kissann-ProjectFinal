import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Leaf, BarChart3, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type DashboardProps = {
  setActiveView: (view: 'dashboard' | 'disease' | 'market' | 'schemes' | 'chat') => void;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
};

export function Dashboard({ setActiveView }: DashboardProps) {
  return (
    <div className="flex flex-col min-h-full bg-secondary/20">
      <section className="w-full py-20 md:py-24 lg:py-32">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center md:text-left"
          >
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-primary">
              Kisan Mitra
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              Your AI partner for smarter farming. Instant help with crop diseases, market prices, and government schemes.
            </p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8"
            >
              <Button size="lg" className="font-bold group shadow-lg" onClick={() => setActiveView('chat')}>
                Ask KisanBot <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div 
              data-ai-hint="farming leaf logo"
              className="rounded-full shadow-2xl bg-primary/10 w-96 h-96 flex items-center justify-center"
            >
              <Leaf className="w-48 h-48 text-primary/80" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12 font-headline">Core Features</h2>
            <div className="grid gap-8 md:grid-cols-3">
                <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
                    <Card 
                        className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-2xl overflow-hidden text-center p-6 flex flex-col items-center"
                        onClick={() => setActiveView('disease')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('disease'); }}
                        role="button"
                        tabIndex={0}
                        aria-label="Navigate to Crop Disease Diagnosis"
                    >
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <Leaf className="w-12 h-12 text-primary" />
                        </div>
                        <CardHeader className="p-0">
                            <CardTitle className="font-headline text-xl">Crop Diagnosis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 mt-2">
                            <p className="text-muted-foreground">
                              Upload a photo to instantly identify diseases and get expert remedies.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                
                <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                  <Card 
                      className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-2xl overflow-hidden text-center p-6 flex flex-col items-center"
                      onClick={() => setActiveView('market')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('market'); }}
                      role="button"
                      tabIndex={0}
                      aria-label="Navigate to Market Price Analysis"
                  >
                      <div className="bg-primary/10 p-4 rounded-full mb-4">
                          <BarChart3 className="w-12 h-12 text-primary" />
                      </div>
                      <CardHeader className="p-0">
                          <CardTitle className="font-headline text-xl">Price Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-2">
                          <p className="text-muted-foreground">
                            Get real-time market prices and AI-powered advice on when to sell.
                          </p>
                      </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
                  <Card 
                      className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-2xl overflow-hidden text-center p-6 flex flex-col items-center"
                      onClick={() => setActiveView('schemes')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('schemes'); }}
                      role="button"
                      tabIndex={0}
                      aria-label="Navigate to Government Schemes"
                  >
                      <div className="bg-primary/10 p-4 rounded-full mb-4">
                          <Landmark className="w-12 h-12 text-primary" />
                      </div>
                      <CardHeader className="p-0">
                          <CardTitle className="font-headline text-xl">Govt. Schemes</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-2">
                          <p className="text-muted-foreground">
                            Ask about government schemes and get clear summaries on eligibility.
                          </p>
                      </CardContent>
                  </Card>
                </motion.div>
            </div>
        </div>
      </section>
    </div>
  );
}
