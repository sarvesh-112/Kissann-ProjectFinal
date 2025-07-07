"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { askKisanBot } from '@/ai/flows/kisan-bot';
import { textToSpeech, type TtsLanguageCode } from '@/ai/flows/tts';
import { Loader2, Send, Bot, User, Mic, Volume2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { type SupportedLanguage } from '@/ai/schemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

const formSchema = z.object({
  query: z.string().min(1, { message: 'Please enter a message.' }),
});

const languageToTtsCode: Record<SupportedLanguage, TtsLanguageCode> = {
  english: 'en-US',
  kannada: 'kn-IN',
  hindi: 'hi-IN',
  tamil: 'ta-IN',
};

export function ChatAssistant() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>('english');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
    onTranscript: (text) => {
      form.setValue('query', text);
      stopListening();
      form.handleSubmit(onSubmit)(); 
    },
    lang: languageToTtsCode[language],
  });

   useEffect(() => {
    if (transcript) {
      form.setValue('query', transcript);
    }
  }, [transcript, form]);


  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const userMessage: Message = { role: 'user', text: data.query };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    form.reset();

    try {
      const assistantResponse = await askKisanBot(data.query, language);
      const assistantMessage: Message = { role: 'assistant', text: assistantResponse };
      setMessages((prev) => [...prev, assistantMessage]);
      handleSpeak(assistantResponse);
    } catch (error) {
      console.error('Error asking assistant:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
      });
      const errorMessage: Message = { role: 'assistant', text: "Sorry, I encountered an error. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (!text || isSpeaking) return;
    setIsSpeaking(true);
    setAudioUrl(null);
    try {
      const response = await textToSpeech(text, languageToTtsCode[language]);
      if (response?.media) {
        setAudioUrl(response.media);
      } else {
        // Speech unavailable, do nothing to avoid showing a toast.
        console.warn('TTS service did not return audio media.');
      }
    } catch (error) {
      // Log error but don't show a toast to the user
      console.error('Error during TTS call, handled gracefully:', error);
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
    <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-100px)] flex flex-col">
       <header className="mb-4 flex justify-between items-center">
        <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight">KisanBot</h1>
            <p className="text-muted-foreground mt-2">Your AI companion for farming.</p>
        </div>
        <div className='flex flex-col gap-2'>
            <Label htmlFor="language-select">Language</Label>
            <Select 
                value={language}
                onValueChange={(value) => setLanguage(value as SupportedLanguage)}
            >
                <SelectTrigger className="w-[180px]" id="language-select">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="kannada">Kannada</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </header>
      <Card className="flex-1 flex flex-col shadow-lg">
        <CardContent className="p-0 flex-1 flex flex-col">
           <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
             <div className="space-y-4">
               {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'assistant' && <Bot className="h-6 w-6 text-primary shrink-0" />}
                  <div className={cn("p-3 rounded-lg max-w-lg", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                   {message.role === 'user' && <User className="h-6 w-6 text-muted-foreground shrink-0" />}
                </div>
              ))}
              {loading && (
                 <div className="flex items-start gap-3 justify-start">
                    <Bot className="h-6 w-6 text-primary shrink-0" />
                    <div className="p-3 rounded-lg bg-secondary">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                 </div>
              )}
             </div>
           </ScrollArea>
           <div className="p-4 border-t">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                   <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Input placeholder="Ask KisanBot anything..." {...field} autoComplete="off" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={toggleListening} disabled={loading}>
                        <Mic className={`h-5 w-5 ${isListening ? 'text-destructive animate-pulse' : ''}`} />
                    </Button>
                    <Button type="submit" size="icon" disabled={loading}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
              </Form>
           </div>
        </CardContent>
      </Card>
      {audioUrl && <audio autoPlay src={audioUrl} onEnded={() => setAudioUrl(null)} className="hidden" />}
    </div>
  );
}
