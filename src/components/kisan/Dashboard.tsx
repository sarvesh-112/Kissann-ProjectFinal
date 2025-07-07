import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, BarChart3, Landmark } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Welcome to Kisan Mitra
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered assistant for modern farming. Get instant insights on crop health, market prices, and government schemes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <Sprout className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline">Crop Disease Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Upload a photo of your crop to instantly identify diseases and get expert-recommended remedies.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <BarChart3 className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline">Market Price Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get real-time market prices for your crops. Our AI provides summaries and advice on the best time to sell.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <Landmark className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline">Government Schemes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Ask about government schemes and get clear summaries on eligibility and application links.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-muted-foreground mt-8">
        <p>Select a feature from the sidebar to get started.</p>
      </div>
    </div>
  );
}
