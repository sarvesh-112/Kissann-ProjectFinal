"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { askKisanBot } from '@/ai/flows/kisan-bot';
import { textToSpeech, type TtsLanguageCode } from '@/ai/flows/tts';
import { Send, Bot, User, Mic } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { type SupportedLanguage } from '@/ai/schemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

type Message = {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
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
    onError: (error) => {
        console.error("Speech recognition error:", error);
        toast({
            variant: 'destructive',
            title: 'Speech Error',
            description: "Couldn't start voice input. Please check your microphone permissions.",
        });
    }
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
  }, [messages, loading]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const userMessage: Message = { role: 'user', text: data.query, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    form.reset();

    try {
      const assistantResponse = await askKisanBot(data.query, language);
      const assistantMessage: Message = { role: 'assistant', text: assistantResponse, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((prev) => [...prev, assistantMessage]);
      handleSpeak(assistantResponse);
    } catch (error) {
      console.error('Error asking assistant:', error);
      const errorMessage: Message = { role: 'assistant', text: "Sorry, I encountered an error. Please try again.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (!text) return;
    setAudioUrl(null);
    try {
      const response = await textToSpeech(text, languageToTtsCode[language]);
      if (response?.media) {
        setAudioUrl(response.media);
      }
    } catch (error) {
      // Gracefully handle TTS errors (e.g., quota exceeded) without notifying the user
      console.error('Error during TTS call, handled gracefully:', error);
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
    <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-80px)] flex flex-col">
       <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
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
      <Card className="flex-1 flex flex-col shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-0 flex-1 flex flex-col">
           <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
             <div className="space-y-6">
                <AnimatePresence>
                {messages.map((message, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                    {message.role === 'assistant' && <Bot className="h-8 w-8 text-primary shrink-0 rounded-full bg-primary/10 p-1.5" />}
                    <div className={cn("p-3 rounded-2xl max-w-xl shadow-md", message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none')}>
                        <p className="text-sm">{message.text}</p>
                        <p className={cn("text-xs mt-1.5", message.role === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left')}>
                            {message.timestamp}
                        </p>
                    </div>
                    {message.role === 'user' && <User className="h-8 w-8 text-muted-foreground shrink-0 bg-muted rounded-full p-1.5" />}
                    </motion.div>
                ))}
                </AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-3 justify-start"
                    >
                        <Bot className="h-8 w-8 text-primary shrink-0 rounded-full bg-primary/10 p-1.5" />
                        <div className="p-3 rounded-2xl bg-secondary flex items-center gap-1.5 shadow-md rounded-bl-none">
                           <Skeleton className="h-2 w-16" />
                        </div>
                    </motion.div>
                )}
             </div>
           </ScrollArea>
           <div className="p-4 border-t bg-background/80">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                   <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Input placeholder="Ask KisanBot anything..." {...field} autoComplete="off" className="rounded-full px-5"/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={toggleListening} disabled={loading} className='shrink-0 rounded-full'>
                        <Mic className={`h-5 w-5 ${isListening ? 'text-destructive animate-pulse' : ''}`} />
                    </Button>
                    <Button type="submit" size="icon" disabled={loading} className='shrink-0 rounded-full'>
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
