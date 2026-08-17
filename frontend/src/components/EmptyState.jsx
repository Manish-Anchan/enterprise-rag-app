import React from 'react';
import { 
  Briefcase, 
  DollarSign, 
  Code2, 
  Lock, 
  UserCheck, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Command
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  {
    id: 'hr',
    title: 'HR Policies & Leaves',
    desc: 'Remote work guidelines, PTO schedules, and conduct',
    icon: Briefcase,
    prompt: "What is NovaTech's policy on remote work and flexible core hours?"
  },
  {
    id: 'benefits',
    title: 'Benefits & Compensation',
    desc: 'Health insurance tiers, 401(k) matching, and wellness',
    icon: DollarSign,
    prompt: 'What healthcare plans are offered and what is the 401(k) match?'
  },
  {
    id: 'eng',
    title: 'Engineering Standards',
    desc: 'Code reviews, PR approvals, CI/CD, and deployment',
    icon: Code2,
    prompt: 'What are the required steps and approvals for code reviews and PR merges?'
  },
  {
    id: 'security',
    title: 'Security & Access',
    desc: '2FA authentication, VPN access, and credential safety',
    icon: Lock,
    prompt: 'What are the mandatory security practices for 2FA and remote VPN access?'
  },
  {
    id: 'onboard',
    title: 'New Hire Onboarding',
    desc: 'Day-1 account checklist, mentor pairing, and tools',
    icon: UserCheck,
    prompt: 'What should a new employee complete during their first week of onboarding?'
  },
  {
    id: 'perf',
    title: 'Performance & Growth',
    desc: 'Quarterly reviews, promotions, and engineering ladder',
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
    <div className="py-8 md:py-12 space-y-9 max-w-2xl mx-auto">
      {/* Hero Header */}
      <div className="space-y-3.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-zinc-300 shadow-sm backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-zinc-300 animate-pulse" />
          <span className="font-medium tracking-wide">Enterprise Knowledge Engine</span>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2rem] leading-tight">
          How can I assist your workday?
        </h2>
        
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
          Search across internal company wikis, engineering handbooks, HR policies, and security protocols with grounded citation sources.
        </p>
      </div>

      {/* 6 Clean Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectPrompt(cat.prompt)}
              className="glass-card rounded-xl p-4.5 cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:bg-white/[0.1] transition-all">
                  <IconComp className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-white tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Prompts */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
          <span>Try asking</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(sug)}
              className="text-xs text-zinc-300 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white border border-white/[0.08] hover:border-white/20 rounded-full px-3.5 py-1.5 transition-all duration-150 text-left cursor-pointer shadow-sm active:scale-[0.98]"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
