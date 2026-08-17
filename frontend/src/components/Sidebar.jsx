import React, { useState } from 'react';
import { 
  Plus, 
  Shield, 
  Database, 
  Cpu, 
  Copy, 
  Check, 
  Network, 
  Briefcase, 
  DollarSign, 
  Code2, 
  Lock, 
  UserCheck, 
  TrendingUp,
  X,
  Sparkles
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
      className={`fixed inset-y-0 left-0 z-40 w-72 md:relative md:translate-x-0 transition-transform duration-200 ease-in-out border-r border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Top Header */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-xs shadow-md shadow-white/5">
              NT
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                <span>NovaTech Hub</span>
              </h1>
              <p className="text-[11px] text-zinc-400">Enterprise RAG Engine</p>
            </div>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
        </div>

        {/* New Session Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2 text-xs border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:text-white text-zinc-300 transition-all shadow-sm" 
          onClick={onResetSession}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Conversation</span>
        </Button>
      </div>

      {/* Main Navigation & System Status */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {/* System Diagnostics */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
            System Status
          </span>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 space-y-2.5 text-xs shadow-inner">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-400">
                <Database className="h-3.5 w-3.5 text-zinc-400" /> Backend
              </span>
              <Badge variant={isOnline ? "success" : "neutral"} className="text-[10px] py-0 px-2 h-5">
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-400">
                <Shield className="h-3.5 w-3.5 text-zinc-400" /> Guardrails
              </span>
              <span className="text-[11px] text-zinc-300 font-medium">NeMo Active</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-400">
                <Cpu className="h-3.5 w-3.5 text-zinc-400" /> Vector DB
              </span>
              <span className="text-[11px] text-zinc-300 font-medium">Qdrant Cloud</span>
            </div>

            <Separator className="my-1.5 bg-white/[0.06]" />

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
              <span>Thread: <code className="text-zinc-200 font-mono">{sessionId.slice(0, 8)}</code></span>
              <button 
                onClick={handleCopySession}
                className="hover:text-white transition-colors p-1 cursor-pointer rounded hover:bg-white/[0.06]"
                title="Copy Thread ID"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
            Knowledge Topics
          </span>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectPrompt(cat.prompt)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all text-left cursor-pointer group"
                >
                  <IconComp className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.08]">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05]"
          onClick={onOpenArchitecture}
        >
          <Network className="h-3.5 w-3.5" />
          <span>Pipeline Architecture</span>
        </Button>
      </div>
    </aside>
  );
}
