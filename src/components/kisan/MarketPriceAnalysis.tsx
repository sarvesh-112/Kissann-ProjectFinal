"use client";

import { useState, useEffect } from 'react';
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
import { BarChart3, Lightbulb, Mic, Volume2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  crop: z.string().min(2, { message: 'Crop name must be at least 2 characters.' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
});

const TrendIndicator = ({ summary }: { summary: string }) => {
    const lowerSummary = summary.toLowerCase();
    if (lowerSummary.includes('up') || lowerSummary.includes('increased') || lowerSummary.includes('rose') || lowerSummary.includes('high')) {
        return <TrendingUp className="h-5 w-5 text-green-600" />;
    }
    if (lowerSummary.includes('down') || lowerSummary.includes('dropped') || lowerSummary.includes('decreased') || lowerSummary.includes('low')) {
        return <TrendingDown className="h-5 w-5 text-destructive" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
};


export function MarketPriceAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketPriceAnalysisOutput | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeInput, setActiveInput] = useState<'crop' | 'location' | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop: '',
      location: '',
    },
  });

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
    onTranscript: (text) => {
      if (activeInput) {
        form.setValue(activeInput, text);
        stopListening();
        setActiveInput(null);
      }
    },
    onError: (error) => {
        console.error("Speech recognition error:", error);
        // Do not show a toast for this error
    }
  });

  useEffect(() => {
    if (transcript && activeInput) {
        form.setValue(activeInput, transcript);
    }
  }, [transcript, activeInput, form]);

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
      const response = await textToSpeech(text, 'kn-IN');
      if (response?.media) {
        setAudioUrl(response.media);
      }
    } catch (error) {
      console.error('Error during speech generation call:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const toggleListening = (field: 'crop' | 'location') => {
    if (isListening && activeInput === field) {
      stopListening();
      setActiveInput(null);
    } else {
      setActiveInput(field);
      startListening();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight">Market Price Analysis</h1>
        <p className="text-muted-foreground mt-2">Enter a crop and location to get AI-powered price analysis and advice.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Check Market Prices</CardTitle>
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
                          <Input placeholder="e.g., Tomato, Potato" {...field} className="rounded-lg" />
                          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" type="button" onClick={() => toggleListening('crop')}>
                             <Mic className={`h-4 w-4 ${isListening && activeInput === 'crop' ? 'text-destructive animate-pulse' : ''}`} />
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
                         <div className="relative">
                          <Input placeholder="e.g., Hassan, Bangalore" {...field} className="rounded-lg" />
                           <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" type="button" onClick={() => toggleListening('location')}>
                             <Mic className={`h-4 w-4 ${isListening && activeInput === 'location' ? 'text-destructive animate-pulse' : ''}`} />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} size="lg" className="font-bold w-full">
                  {loading ? 'Analyzing...' : 'Get Analysis'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="space-y-6">
           {loading && (
             <Card className="flex flex-col h-full shadow-lg rounded-2xl animate-pulse p-6">
                <div className="flex items-start gap-4 mb-6">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-5 w-1/4 mt-4" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </Card>
          )}

          {result && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
             <Card className="bg-gradient-to-br from-card to-secondary/30 shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row items-start gap-4">
                 <div className="bg-primary/10 p-3 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-primary shrink-0" />
                 </div>
                <div>
                    <CardTitle className="font-headline text-2xl">Price Analysis</CardTitle>
                    <CardDescription>For {form.getValues('crop')} in {form.getValues('location')}</CardDescription>
                </div>
                 <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleSpeak(result.summary + '. ' + result.advice)} disabled={isSpeaking}>
                    <Volume2 className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                    Price Summary <TrendIndicator summary={result.summary} />
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap mt-1">{result.summary}</p>
                </div>
                <div>
                   <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    AI-Powered Advice
                  </h3>
                  <p className="text-foreground font-medium mt-1">{result.advice}</p>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )}
          {audioUrl && (
            <audio autoPlay src={audioUrl} onEnded={() => setAudioUrl(null)} className="hidden" />
          )}
        </div>
      </div>
    </div>
  );
}
