import React, { useRef, useEffect } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatInput({ input, setInput, onSend, isLoading }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="p-4 md:px-6 bg-background/90 backdrop-blur-md border-t border-border/80 shrink-0">
      <div className="max-w-2xl mx-auto space-y-2">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!isLoading && input.trim()) onSend();
          }}
          className="relative flex items-end rounded-xl border border-border/80 bg-zinc-900/60 p-2 shadow-sm focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500 transition-all"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about policies, engineering standards, onboarding..."
            disabled={isLoading}
            className="w-full resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32 min-h-[36px]"
          />

          <Button
            type="submit"
            size="icon-sm"
            disabled={!input.trim() || isLoading}
            className="rounded-lg h-8 w-8 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground">
          NovaTech AI may produce errors. Verify critical policy decisions with HR or Legal.
        </p>
      </div>
    </div>
  );
}
