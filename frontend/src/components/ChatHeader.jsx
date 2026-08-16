import React from 'react';
import { Menu, Trash2, Network, Activity } from 'lucide-react';
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
    <header className="h-14 border-b border-border/80 px-4 md:px-6 flex items-center justify-between bg-background/95 backdrop-blur-sm z-10 shrink-0">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon-sm" 
          className="md:hidden" 
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-sm font-medium text-foreground tracking-tight">NovaTech Assistant</h2>
          <p className="text-[11px] text-muted-foreground hidden sm:block">Agentic RAG with NeMo Guardrails & FlashRank</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {latency && (
          <Badge variant="outline" className="text-[11px] font-mono gap-1 text-muted-foreground hidden sm:inline-flex">
            <Activity className="h-3 w-3" />
            <span>{latency}s</span>
          </Badge>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs gap-1.5 border-border/70"
          onClick={onOpenArchitecture}
        >
          <Network className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Workflow</span>
        </Button>

        {messageCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-950/20"
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
