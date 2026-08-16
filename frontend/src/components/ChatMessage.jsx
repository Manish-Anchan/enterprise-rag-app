import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ShieldAlert, 
  Cpu, 
  FileText, 
  Sparkles,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [showThoughts, setShowThoughts] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedChunkIdx, setCopiedChunkIdx] = useState(null);

  const toggleChunk = (idx) => {
    setExpandedSources(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleCopyChunk = (text, idx, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedChunkIdx(idx);
    setTimeout(() => setCopiedChunkIdx(null), 2000);
  };

  const isBlocked = message.status === 'Blocked by guardrails.';
  const hasThoughts = message.thought_process && message.thought_process.length > 0;
  const hasSources = message.sources && message.sources.length > 0;

  return (
    <div className={`flex gap-3 py-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="h-7 w-7 rounded-md bg-zinc-800 border border-border/80 flex items-center justify-center text-zinc-200 shrink-0 mt-0.5">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Message Content Container */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div 
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
            isUser 
              ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/50' 
              : 'bg-card text-card-foreground border border-border/70 w-full'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="space-y-3">
              {/* NeMo Guardrail Warning */}
              {isBlocked && (
                <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                  <span>Request intercepted by safety guardrails.</span>
                </div>
              )}

              {/* Collapsible Thought Process */}
              {hasThoughts && (
                <div className="rounded-lg border border-border/60 bg-zinc-900/50 overflow-hidden text-xs">
                  <button
                    onClick={() => setShowThoughts(!showThoughts)}
                    className="w-full flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Cpu className="h-3.5 w-3.5" />
                      <span>Reasoning Steps ({message.thought_process.length})</span>
                    </span>
                    {showThoughts ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {showThoughts && (
                    <div className="px-3 pb-2.5 pt-1 space-y-1 border-t border-border/40 text-[11px] text-muted-foreground">
                      {message.thought_process.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-zinc-500">•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose-custom">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Source Documents */}
              {hasSources && (
                <div className="pt-2 border-t border-border/40 space-y-2">
                  <button
                    onClick={() => setShowSources(!showSources)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>{showSources ? 'Hide' : 'View'} Citations ({message.sources.length})</span>
                    {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {showSources && (
                    <div className="space-y-1.5 pt-1">
                      {message.sources.map((source, idx) => {
                        const isExpanded = expandedSources[idx];
                        return (
                          <div 
                            key={idx} 
                            className="rounded-md border border-border/60 bg-zinc-950/60 overflow-hidden text-xs"
                          >
                            <div 
                              onClick={() => toggleChunk(idx)}
                              className="flex items-center justify-between p-2 hover:bg-zinc-900/50 cursor-pointer text-muted-foreground"
                            >
                              <span className="font-mono text-[11px] text-zinc-300">Chunk #{idx + 1}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => handleCopyChunk(source, idx, e)}
                                  className="hover:text-foreground p-0.5 cursor-pointer"
                                  title="Copy excerpt"
                                >
                                  {copiedChunkIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                </button>
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="p-2.5 border-t border-border/40 font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-950">
                                {source}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp & Actions */}
        <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
          <span>{message.timestamp || 'Just now'}</span>
          {!isUser && (
            <button
              onClick={handleCopyAnswer}
              className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
              title="Copy answer"
            >
              {copiedAnswer ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="h-7 w-7 rounded-md bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200 shrink-0 mt-0.5">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}
