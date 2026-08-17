import React, { useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatInput({ input, setInput, onSend, isLoading }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
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
    <div className="p-4 md:px-6 md:pb-6 bg-gradient-to-t from-background via-background/95 to-transparent shrink-0">
      <div className="max-w-2xl mx-auto space-y-2.5">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!isLoading && input.trim()) onSend();
          }}
          className="relative flex items-end rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl p-2.5 shadow-lg shadow-black/40 focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/20 transition-all duration-200"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about policies, engineering standards, benefits..."
            disabled={isLoading}
            className="w-full resize-none bg-transparent px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none max-h-36 min-h-[38px] leading-relaxed"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="rounded-xl h-8 w-8 shrink-0 bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-20 disabled:hover:bg-white shadow-sm transition-all duration-150 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
            ) : (
              <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            )}
          </Button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-zinc-400" />
            <span>Grounded Agentic RAG</span>
          </span>
          <span className="hidden sm:inline">
            Press <kbd className="font-mono text-[10px] bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded text-zinc-400">↵ Enter</kbd> to send
          </span>
        </div>
      </div>
    </div>
  );
}
