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
  User,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    <div className={`flex gap-3.5 py-3.5 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-100 shadow-sm shrink-0 mt-0.5">
          <Sparkles className="h-4 w-4 text-zinc-300" />
        </div>
      )}

      {/* Message Body Container */}
      <div className={`flex flex-col gap-1.5 max-w-[88%] sm:max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div 
          className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${
            isUser 
              ? 'bg-zinc-800/90 text-white border border-white/10 shadow-sm rounded-tr-sm' 
              : 'glass-panel text-zinc-100 rounded-tl-sm w-full shadow-md'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="space-y-3.5">
              {/* NeMo Guardrail Warning */}
              {isBlocked && (
                <div className="flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                  <span>Request intercepted by safety guardrails.</span>
                </div>
              )}

              {/* Reasoning Steps Accordion */}
              {hasThoughts && (
                <div className="rounded-lg border border-white/[0.08] bg-black/40 overflow-hidden text-xs">
                  <button
                    onClick={() => setShowThoughts(!showThoughts)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium text-zinc-300">
                      <Cpu className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Reasoning Plan ({message.thought_process.length} steps)</span>
                    </span>
                    {showThoughts ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {showThoughts && (
                    <div className="px-3.5 pb-3 pt-1 space-y-1.5 border-t border-white/[0.06] text-[11.5px] text-zinc-400">
                      {message.thought_process.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-zinc-500 font-mono">0{idx + 1}.</span>
                          <span className="text-zinc-300">{step}</span>
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

              {/* Citations & Source Documents */}
              {hasSources && (
                <div className="pt-2.5 border-t border-white/[0.08] space-y-2.5">
                  <button
                    onClick={() => setShowSources(!showSources)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 transition-all cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{showSources ? 'Hide Citations' : `View Citations (${message.sources.length})`}</span>
                    {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {showSources && (
                    <div className="space-y-2 pt-1 animate-in fade-in-0 duration-200">
                      {message.sources.map((source, idx) => {
                        const isExpanded = expandedSources[idx];
                        const preview = source.slice(0, 110).replace(/\n/g, ' ') + '...';

                        return (
                          <div 
                            key={idx} 
                            className="rounded-lg border border-white/[0.08] bg-black/60 overflow-hidden text-xs"
                          >
                            <div 
                              onClick={() => toggleChunk(idx)}
                              className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.03] cursor-pointer text-zinc-300"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Badge variant="neutral" className="text-[10px] font-mono py-0 px-1.5 h-4">
                                  #{idx + 1}
                                </Badge>
                                {!isExpanded && (
                                  <span className="text-[11.5px] text-zinc-400 truncate max-w-sm">
                                    {preview}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <button
                                  onClick={(e) => handleCopyChunk(source, idx, e)}
                                  className="hover:text-white p-1 cursor-pointer rounded hover:bg-white/[0.06]"
                                  title="Copy citation excerpt"
                                >
                                  {copiedChunkIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-400" />}
                                </button>
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="p-3 border-t border-white/[0.06] font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-950/80">
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

        {/* Timestamp & Copy Action */}
        <div className="flex items-center gap-3 px-1 text-[11px] text-zinc-500">
          <span>{message.timestamp || 'Just now'}</span>
          {!isUser && (
            <button
              onClick={handleCopyAnswer}
              className="hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1"
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
        <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-200 shadow-sm shrink-0 mt-0.5">
          <User className="h-4 w-4 text-zinc-300" />
        </div>
      )}
    </div>
  );
}
