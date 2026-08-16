import React from 'react';
import { 
  Briefcase, 
  DollarSign, 
  Code2, 
  Lock, 
  UserCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  {
    id: 'hr',
    title: 'HR Policies',
    desc: 'Remote work, leaves, workplace guidelines',
    icon: Briefcase,
    prompt: "What is NovaTech's policy on remote work and flexible core hours?"
  },
  {
    id: 'benefits',
    title: 'Benefits & Compensation',
    desc: 'Health coverage, 401(k) matching, wellness',
    icon: DollarSign,
    prompt: 'What healthcare plans are offered and what is the 401(k) match?'
  },
  {
    id: 'eng',
    title: 'Engineering Standards',
    desc: 'Code review, branching, release pipelines',
    icon: Code2,
    prompt: 'What are the required steps and approvals for code reviews and PR merges?'
  },
  {
    id: 'security',
    title: 'Security & Access',
    desc: '2FA authentication, VPN, data privacy',
    icon: Lock,
    prompt: 'What are the mandatory security practices for 2FA and remote VPN access?'
  },
  {
    id: 'onboard',
    title: 'New Hire Onboarding',
    desc: 'First week checklist, account setup',
    icon: UserCheck,
    prompt: 'What should a new employee complete during their first week of onboarding?'
  },
  {
    id: 'perf',
    title: 'Performance & Growth',
    desc: 'Review cadence, engineering ladder',
    icon: TrendingUp,
    prompt: 'How are performance reviews conducted and what is the promotion criteria?'
  }
];

const SUGGESTIONS = [
  "How do I submit an expense report for office supplies?",
  "What is the on-call compensation rate for engineers?",
  "Can I work abroad temporarily as a remote employee?"
];

export default function EmptyState({ onSelectPrompt }) {
  return (
    <div className="py-6 space-y-8 max-w-2xl mx-auto">
      {/* Hero Header */}
      <div className="space-y-3">
        <Badge variant="outline" className="gap-1.5 text-xs text-muted-foreground border-border/80">
          <Sparkles className="h-3 w-3 text-zinc-400" />
          Enterprise Knowledge Engine
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          What can I help you find today?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ask questions across company documentation, engineering standards, HR policies, and benefits with grounded RAG citations.
        </p>
      </div>

      {/* 6 Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          return (
            <Card
              key={cat.id}
              onClick={() => onSelectPrompt(cat.prompt)}
              className="group cursor-pointer border-border/60 hover:border-zinc-500/50 hover:bg-zinc-900/60 transition-all duration-200"
            >
              <CardHeader className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <IconComp className="h-4 w-4 text-zinc-400 group-hover:text-foreground transition-colors" />
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle className="text-xs font-medium text-foreground">
                  {cat.title}
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  {cat.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Suggested Prompts */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-medium text-muted-foreground">Try asking:</span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(sug)}
              className="text-xs text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-border/60 rounded-full px-3 py-1.5 transition-colors text-left cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
