import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, BarChart3, Landmark, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DashboardProps = {
  setActiveView: (view: 'disease' | 'market' | 'schemes') => void;
};

export function Dashboard({ setActiveView }: DashboardProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gray-100 dark:bg-gray-800/20">
        <div className="container mx-auto text-center px-4">
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-primary animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            Your AI-Powered Agricultural Assistant
          </h1>
          <p className="mt-4 font-headline text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
            Diagnose. Decide. Grow.
          </p>
          <div className="mt-8 animate-in fade-in zoom-in-95 duration-700 delay-500">
            <Button size="lg" className="font-bold group" onClick={() => setActiveView('disease')}>
              Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Our Features</h2>
            <div className="grid gap-8 md:grid-cols-3">
                <Card 
                    className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => setActiveView('disease')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('disease'); }}
                    role="button"
                    tabIndex={0}
                    aria-label="Navigate to Crop Disease Diagnosis"
                >
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                    <Sprout className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">Crop Disease Diagnosis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                    Upload a photo of your crop to instantly identify diseases and get expert-recommended remedies.
                    </p>
                </CardContent>
                </Card>

                <Card 
                    className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => setActiveView('market')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('market'); }}
                    role="button"
                    tabIndex={0}
                    aria-label="Navigate to Market Price Analysis"
                >
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">Market Price Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                    Get real-time market prices for your crops. Our AI provides summaries and advice on the best time to sell.
                    </p>
                </CardContent>
                </Card>

                <Card 
                    className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => setActiveView('schemes')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('schemes'); }}
                    role="button"
                    tabIndex={0}
                    aria-label="Navigate to Government Schemes"
                >
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Landmark className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">Government Schemes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                    Ask about government schemes and get clear summaries on eligibility and application links.
                    </p>
                </CardContent>
                </Card>
            </div>
        </div>
      </section>
    </div>
  );
}
