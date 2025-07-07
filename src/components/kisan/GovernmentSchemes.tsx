"use client";

import { useState } from 'react';
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
import { Loader2, Landmark, FileText, Link, Mic, Volume2 } from 'lucide-react';

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
        <h1 className="font-headline text-4xl font-bold tracking-tight">Government Scheme Information</h1>
        <p className="text-muted-foreground mt-2">Ask a question about government programs for farmers to get relevant information.</p>
      </header>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
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
                          <Textarea rows={5} placeholder="Type your question here..." {...field} />
                           <Button variant="ghost" size="icon" className="absolute right-2 bottom-2 h-8 w-8">
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                 <Button type="submit" disabled={loading} className="font-semibold">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Get Information'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="space-y-6">
          {loading && (
             <Card className="flex flex-col items-center justify-center h-full shadow-md">
              <CardContent className="text-center p-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="font-semibold font-headline">Finding Schemes...</p>
                <p className="text-sm text-muted-foreground">Our AI is searching for relevant information.</p>
              </CardContent>
            </Card>
          )}

          {result && (
             <Card className="bg-gradient-to-br from-card to-secondary/50 shadow-lg">
               <CardHeader className="flex flex-row items-start gap-4">
                 <Landmark className="h-8 w-8 text-primary shrink-0" />
                <div>
                    <CardTitle className="font-headline text-2xl">{result.scheme}</CardTitle>
                    <CardDescription>Information based on your query.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleSpeak(result.scheme + '. ' + result.summary + ' Eligibility: ' + result.eligibility)} disabled={isSpeaking}>
                    {isSpeaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Summary
                  </h3>
                  <p className="text-muted-foreground pl-7">{result.summary}</p>
                </div>
                <div>
                   <h3 className="font-headline text-lg font-semibold">Eligibility</h3>
                  <p className="text-muted-foreground">{result.eligibility}</p>
                </div>
                 <div>
                   <h3 className="font-headline text-lg font-semibold">Application Link</h3>
                    <Button asChild variant="link" className="p-0 h-auto">
                        <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-base text-primary hover:underline">
                            <Link className="mr-2 h-4 w-4" />
                            Visit Official Scheme Page
                        </a>
                    </Button>
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
