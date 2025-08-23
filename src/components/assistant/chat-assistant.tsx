
'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askAssistant } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useMediaQuery } from '@/hooks/use-media-query';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

function ChatMessages({ messages, isPending, scrollAreaRef }: any) {
    return (
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
                {messages.map((message: Message) => (
                <div
                    key={message.id}
                    className={cn(
                    'flex items-end gap-2',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                >
                    {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="/images/icons/logo.png" alt="Bot" />
                        <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    )}
                    <div
                    className={cn(
                        'max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                        message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                    >
                    {message.text.replace(/\*/g, '')}
                    </div>
                </div>
                ))}
                {isPending && (
                    <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="/images/icons/logo.png" alt="Bot" />
                        <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
                )}
            </div>
        </ScrollArea>
    )
}

function ChatInput({ input, setInput, handleSendMessage, isPending }: any) {
    return (
        <footer className="border-t bg-background p-2">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez votre question..."
                    className="flex-1"
                    disabled={isPending}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isPending}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </footer>
    )
}

function ChatContent({ messages, input, setInput, handleSendMessage, isPending, scrollAreaRef }: any) {
    return (
        <>
            <ChatMessages messages={messages} isPending={isPending} scrollAreaRef={scrollAreaRef} />
            <ChatInput input={input} setInput={setInput} handleSendMessage={handleSendMessage} isPending={isPending} />
        </>
    )
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");


  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: 1, text: "Bonjour ! Je suis Le KAIZEN, votre assistant financier. Comment puis-je vous aider aujourd'hui ?", sender: 'bot' },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isPending]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    startTransition(async () => {
      try {
        const { reply } = await askAssistant(currentInput);
        const botMessage: Message = {
          id: Date.now() + 1,
          text: reply,
          sender: 'bot',
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        const errorMessage: Message = {
            id: Date.now() + 1,
            text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
            sender: 'bot',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    });
  };

  const chatInputProps = { input, setInput, handleSendMessage, isPending };
  const chatMessagesProps = { messages, isPending, scrollAreaRef };

  if (isMobile) {
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-lg z-50 md:bottom-6"
                    aria-label="Ouvrir le chat de l'assistant"
                >
                   <Bot className="h-8 w-8" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-full flex flex-col p-0 border-none">
                 <div className="flex-1 flex flex-col bg-background min-h-0">
                    <SheetHeader className='p-4 bg-primary text-primary-foreground text-left'>
                        <SheetTitle>Assistant Virtuel</SheetTitle>
                    </SheetHeader>
                    <ChatMessages {...chatMessagesProps} />
                 </div>
                 <ChatInput {...chatInputProps} />
            </SheetContent>
        </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-lg z-50 md:bottom-6"
            aria-label="Ouvrir le chat de l'assistant"
          >
            {isOpen ? <X className="h-8 w-8" /> : <Bot className="h-8 w-8" />}
          </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 md:w-96 rounded-lg shadow-xl border-none p-0 h-[60vh] flex flex-col"
        sideOffset={20}
      >
        <header className="bg-primary text-primary-foreground p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold text-lg">Assistant Virtuel</h3>
        </header>
        <div className="flex-1 flex flex-col bg-background min-h-0">
            <ChatMessages {...chatMessagesProps} />
            <ChatInput {...chatInputProps} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
