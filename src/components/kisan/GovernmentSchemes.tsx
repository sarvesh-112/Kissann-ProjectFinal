"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getGovernmentSchemeInformation, GovernmentSchemeInformationOutput } from '@/ai/flows/government-scheme-information';
import { textToSpeech } from '@/ai/flows/tts';
import { Landmark, FileText, Link, Mic, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  query: z.string().min(10, { message: 'Please describe what you are looking for in at least 10 characters.' }),
});

export function GovernmentSchemes() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GovernmentSchemeInformationOutput | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
    },
  });

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
    onTranscript: (text) => {
      form.setValue('query', text);
      stopListening();
    },
    onError: (error) => {
        console.error("Speech recognition error:", error);
        // Do not show a toast for this error
    }
  });

  useEffect(() => {
    if (transcript) {
      form.setValue('query', transcript);
    }
  }, [transcript, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setAudioUrl(null);
    try {
      const schemeResult = await getGovernmentSchemeInformation(data);
      setResult(schemeResult);
    } catch (error) {
      console.error('Error getting scheme information:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get scheme information. Please try again.',
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

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight">Government Scheme Information</h1>
        <p className="text-muted-foreground mt-2">Ask a question about government programs for farmers to get relevant information.</p>
      </header>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Ask About a Scheme</CardTitle>
                <CardDescription>Describe what you need help with, e.g., "I need a loan for buying seeds" or "tell me about crop insurance".</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Question</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea rows={5} placeholder="Type your question here..." {...field} className="rounded-lg"/>
                           <Button variant="ghost" size="icon" className="absolute right-2 bottom-2 h-8 w-8" type="button" onClick={toggleListening}>
                            <Mic className={`h-4 w-4 ${isListening ? 'text-destructive animate-pulse' : ''}`} />
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
                  {loading ? 'Searching...' : 'Get Information'}
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
                    <Landmark className="h-6 w-6 text-primary shrink-0" />
                 </div>
                <div>
                    <CardTitle className="font-headline text-2xl">{result.scheme}</CardTitle>
                    <CardDescription>Information based on your query.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleSpeak(result.scheme + '. ' + result.summary + ' Eligibility: ' + result.eligibility)} disabled={isSpeaking}>
                    <Volume2 className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Summary
                  </h3>
                  <p className="text-muted-foreground mt-1">{result.summary}</p>
                </div>
                <div>
                   <h3 className="font-headline text-lg font-semibold">Eligibility</h3>
                  <p className="text-muted-foreground mt-1">{result.eligibility}</p>
                </div>
                 <div>
                    <Button asChild className="w-full font-bold" size="lg">
                        <a href={result.link} target="_blank" rel="noopener noreferrer">
                            <Link className="mr-2 h-4 w-4" />
                            Visit Official Page
                        </a>
                    </Button>
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
