"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getMarketPriceAnalysis, MarketPriceAnalysisOutput } from '@/ai/flows/market-price-analysis';
import { textToSpeech } from '@/ai/flows/tts';
import { Loader2, BarChart3, Lightbulb, Mic, Volume2 } from 'lucide-react';

const formSchema = z.object({
  crop: z.string().min(2, { message: 'Crop name must be at least 2 characters.' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
});

export function MarketPriceAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketPriceAnalysisOutput | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop: '',
      location: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setAudioUrl(null);
    try {
      const analysisResult = await getMarketPriceAnalysis(data);
      setResult(analysisResult);
    } catch (error) {
      console.error('Error getting market analysis:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get market analysis. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (!text || isSpeaking) return;
    setIsSpeaking(true);
    setAudioUrl(null);
    try {
      const response = await textToSpeech(text);
      setAudioUrl(response.media);
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        variant: 'destructive',
        title: 'Speech Error',
        description: 'Failed to generate audio. Please try again.',
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Market Price Analysis</h1>
        <p className="text-muted-foreground mt-2">Enter a crop and location to get AI-powered price analysis and advice.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline">Check Market Prices</CardTitle>
                <CardDescription>Find out the current market rates for your produce.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="crop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="e.g., Tomato, Potato" {...field} />
                          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                             <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location / Market</FormLabel>
                      <FormControl>
                         <Input placeholder="e.g., Hassan, Bangalore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Get Analysis'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="space-y-6">
           {loading && (
             <Card className="flex flex-col items-center justify-center h-full">
              <CardContent className="text-center p-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="font-semibold font-headline">Fetching Market Data...</p>
                <p className="text-sm text-muted-foreground">Our AI is analyzing the latest prices.</p>
              </CardContent>
            </Card>
          )}

          {result && (
             <Card className="bg-gradient-to-br from-card to-secondary/50">
              <CardHeader className="flex flex-row items-start gap-4">
                 <BarChart3 className="h-8 w-8 text-primary shrink-0" />
                <div>
                    <CardTitle className="font-headline text-2xl">Price Analysis</CardTitle>
                    <CardDescription>For {form.getValues('crop')} in {form.getValues('location')}</CardDescription>
                </div>
                 <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleSpeak(result.summary + '. ' + result.advice)} disabled={isSpeaking}>
                    {isSpeaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-headline text-lg font-semibold">Price Summary</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
                </div>
                <div>
                   <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-accent-foreground stroke-accent" />
                    AI-Powered Advice
                  </h3>
                  <p className="text-foreground font-medium pl-7">{result.advice}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {audioUrl && (
            <audio autoPlay src={audioUrl} onEnded={() => setAudioUrl(null)} className="hidden" />
          )}
        </div>
      </div>
    </div>
  );
}
