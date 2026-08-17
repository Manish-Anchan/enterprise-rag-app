import React from 'react';
import { Menu, Trash2, Network, Activity, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ChatHeader({ 
  onToggleSidebar, 
  onClearChat, 
  onOpenArchitecture, 
  messageCount,
  latency 
}) {
  return (
    <header className="h-14 border-b border-white/[0.08] px-4 md:px-6 flex items-center justify-between bg-zinc-950/60 backdrop-blur-xl z-10 shrink-0">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon-sm" 
          className="md:hidden text-zinc-400 hover:text-white" 
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>NovaTech Assistant</span>
          </h2>
          <p className="text-[11px] text-zinc-400 hidden sm:block">Agentic RAG with NeMo Guardrails & FlashRank</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {latency && (
          <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono text-zinc-400">
            <Activity className="h-3 w-3 text-zinc-400" />
            <span>{latency}s</span>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs gap-1.5 border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white text-zinc-300 shadow-sm"
          onClick={onOpenArchitecture}
        >
          <Network className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Workflow</span>
        </Button>

        {messageCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs gap-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/20"
            onClick={onClearChat}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>
    </header>
  );
}
