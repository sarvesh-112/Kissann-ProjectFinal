"use client";

import { useState } from 'react';
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
import { Loader2, Sparkles, AlertTriangle, Mic, Volume2 } from 'lucide-react';

const formSchema = z.object({
  image: z.any().refine((file) => file instanceof File, 'Image is required.'),
});

export function CropDiseaseDiagnosis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

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

    const reader = new FileReader();
    reader.readAsDataURL(data.image);
    reader.onload = async () => {
      const photoDataUri = reader.result as string;
      try {
        const diagnosisResult = await diagnoseCropDisease({ photoDataUri });
        setResult(diagnosisResult);
      } catch (error) {
        console.error('Error diagnosing crop disease:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to get diagnosis. Please try again.',
        });
      } finally {
        setLoading(false);
      }
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Crop Disease Diagnosis</h1>
        <p className="text-muted-foreground mt-2">Upload an image of an affected crop to get an AI-powered diagnosis and remedy.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline">Upload Crop Image</CardTitle>
                <CardDescription>Select a clear image of the crop showing signs of disease.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Crop Image</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" onChange={handleFileChange} className="file:text-primary"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {preview && (
                  <div className="mt-4 relative w-full h-64 rounded-md overflow-hidden border">
                    <Image src={preview} alt="Crop preview" layout="fill" objectFit="cover" />
                  </div>
                )}
                 <div className="relative mt-4">
                  <Input placeholder="Or describe the issue..."/>
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Diagnosing...
                    </>
                  ) : (
                    "Get Diagnosis"
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
                <p className="font-semibold font-headline">Analyzing Image...</p>
                <p className="text-sm text-muted-foreground">Our AI is looking at your crop.</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="bg-gradient-to-br from-card to-secondary/50">
              <CardHeader className="flex flex-row items-start gap-4">
                <Sparkles className="h-8 w-8 text-accent-foreground stroke-accent shrink-0" />
                <div>
                  <CardTitle className="font-headline text-2xl">Diagnosis Result</CardTitle>
                  <CardDescription>Here's what our AI found.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
                    <Volume2 className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Detected Issue
                  </h3>
                  <p className="text-lg text-foreground pl-7">{result.disease}</p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-semibold">Recommended Remedy</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.remedy}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
