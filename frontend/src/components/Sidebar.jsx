import React, { useState } from 'react';
import { 
  Plus, 
  Shield, 
  Database, 
  Cpu, 
  Copy, 
  Check, 
  Network, 
  FileText, 
  Briefcase, 
  DollarSign, 
  Code2, 
  Lock, 
  UserCheck, 
  TrendingUp,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const CATEGORIES = [
  { id: 'hr', name: 'HR Policies', icon: Briefcase, prompt: 'What is the company policy on remote work and flexible hours?' },
  { id: 'benefits', name: 'Benefits & Comp', icon: DollarSign, prompt: 'What health insurance and retirement match plans are offered?' },
  { id: 'eng', name: 'Engineering', icon: Code2, prompt: 'What are the pull request and code review guidelines for engineers?' },
  { id: 'security', name: 'Security & Access', icon: Lock, prompt: 'What are the password security and 2FA requirements?' },
  { id: 'onboard', name: 'Onboarding', icon: UserCheck, prompt: 'What is the step-by-step checklist for new employee onboarding?' },
  { id: 'perf', name: 'Performance', icon: TrendingUp, prompt: 'How does the annual performance and promotion cycle work?' },
];

export default function Sidebar({ 
  isOpen, 
  onClose, 
  sessionId, 
  onResetSession, 
  onSelectPrompt, 
  backendStatus,
  onOpenArchitecture
}) {
  const [copied, setCopied] = useState(false);

  const handleCopySession = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOnline = backendStatus?.status === 'healthy';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 md:relative md:translate-x-0 transition-transform duration-200 ease-in-out border-r border-border bg-card/70 backdrop-blur-md flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
              NT
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground">NovaTech Hub</h1>
              <p className="text-[11px] text-muted-foreground">Enterprise RAG Engine</p>
            </div>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* New Session Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2 text-xs border-border/80 hover:bg-zinc-800/70" 
          onClick={onResetSession}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Conversation</span>
        </Button>
      </div>

      {/* Main Navigation & System Status */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5">
        {/* System Diagnostics */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            System Status
          </span>
          <div className="rounded-lg border border-border/60 bg-zinc-900/40 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Database className="h-3.5 w-3.5" /> Backend
              </span>
              <Badge variant={isOnline ? "success" : "neutral"} className="text-[10px] py-0 px-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="h-3.5 w-3.5" /> Guardrails
              </span>
              <Badge variant="neutral" className="text-[10px] py-0 px-2 font-normal">
                NeMo Active
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Cpu className="h-3.5 w-3.5" /> Vector Search
              </span>
              <Badge variant="neutral" className="text-[10px] py-0 px-2 font-normal">
                Qdrant
              </Badge>
            </div>

            <Separator className="my-1.5 bg-border/40" />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>Thread: <code className="text-zinc-300 font-mono">{sessionId.slice(0, 8)}</code></span>
              <button 
                onClick={handleCopySession}
                className="hover:text-foreground transition-colors p-1 cursor-pointer"
                title="Copy Thread ID"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Knowledge Topics
          </span>
          <div className="space-y-0.5">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectPrompt(cat.prompt)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-zinc-800/60 transition-colors text-left cursor-pointer group"
                >
                  <IconComp className="h-3.5 w-3.5 text-zinc-400 group-hover:text-foreground" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/80">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={onOpenArchitecture}
        >
          <Network className="h-3.5 w-3.5" />
          <span>Pipeline Architecture</span>
        </Button>
      </div>
    </aside>
  );
}
