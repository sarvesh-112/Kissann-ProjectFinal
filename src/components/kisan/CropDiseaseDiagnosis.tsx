"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { diagnoseCropDisease, DiagnoseCropDiseaseOutput } from '@/ai/flows/crop-disease-diagnosis';
import { textToSpeech } from '@/ai/flows/tts';
import { Sparkles, AlertTriangle, Mic, Volume2, UploadCloud, Leaf } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Textarea } from '../ui/textarea';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  image: z.any().refine((file) => file instanceof File, 'Image is required.'),
  description: z.string().optional(),
});

export function CropDiseaseDiagnosis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
    onTranscript: (text) => {
      form.setValue('description', text);
      stopListening();
    },
    onError: (error) => {
        console.error("Speech recognition error:", error);
        // Do not show a toast for this error
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

   useEffect(() => {
    if (transcript) {
      form.setValue('description', transcript);
    }
  }, [transcript, form]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    setAudioUrl(null);

    const reader = new FileReader();
    reader.readAsDataURL(data.image);
    reader.onload = async () => {
      const photoDataUri = reader.result as string;
      const diagnosisResult = await diagnoseCropDisease({ photoDataUri });
      setResult(diagnosisResult);
      setLoading(false);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        variant: 'destructive',
        title: 'File Error',
        description: 'Could not read the selected image file.',
      });
      setLoading(false);
    };
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
      console.error('Error during speech generation call, handled gracefully:', error);
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

  const isError = result?.disease === 'Diagnosis Failed';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight">Crop Disease Diagnosis</h1>
        <p className="text-muted-foreground mt-2">Upload an image of an affected crop to get an AI-powered diagnosis and remedy.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Upload Crop Image</CardTitle>
                <CardDescription>Select a clear image of the crop showing signs of disease.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                     <FormItem>
                      <FormLabel className="sr-only">Crop Image</FormLabel>
                        <FormControl>
                            <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 hover:border-primary transition-colors cursor-pointer text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                                <Input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {preview && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: '16rem' }}
                    className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border shadow-inner"
                  >
                    <Image src={preview} alt="Crop preview" layout="fill" objectFit="cover" />
                  </motion.div>
                )}
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Or describe the issue (optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea className="rounded-lg" placeholder="e.g., 'The leaves have yellow spots and are wilting...'" {...field} />
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
                  {loading ? 'Diagnosing...' : 'Get Diagnosis'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="space-y-6">
          {loading && (
             <Card className="flex flex-col items-center justify-center h-full shadow-lg rounded-2xl animate-pulse">
              <CardContent className="text-center p-6">
                 <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                 <Skeleton className="h-6 w-48 mx-auto mb-2" />
                 <Skeleton className="h-4 w-64 mx-auto" />
              </CardContent>
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
                    {isError ? (
                        <AlertTriangle className="h-8 w-8 text-destructive shrink-0" />
                    ) : (
                        <Sparkles className="h-8 w-8 text-yellow-500 shrink-0" />
                    )}
                    <div>
                    <CardTitle className="font-headline text-2xl">{isError ? 'Diagnosis Failed' : 'Diagnosis Result'}</CardTitle>
                    <CardDescription>{isError ? "An error occurred." : "Here's what our AI found."}</CardDescription>
                    </div>
                    {!isError && (
                        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleSpeak(result.disease + '. ' + result.remedy)} disabled={isSpeaking}>
                            <Volume2 className="h-5 w-5" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isError && (
                        <div>
                            <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Detected Issue
                            </h3>
                            <p className="text-lg text-foreground pl-7">{result.disease}</p>
                        </div>
                    )}
                    <div>
                        <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-primary" />
                            {isError ? 'Details' : 'Recommended Remedy'}
                        </h3>
                        <p className="text-muted-foreground whitespace-pre-wrap pl-7">{result.remedy}</p>
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
