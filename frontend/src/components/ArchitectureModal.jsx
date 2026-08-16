import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Search, 
  MessageSquareCode, 
  ImageIcon, 
  Layers 
} from 'lucide-react';
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getGraphImageUrl } from '@/services/api';

const PIPELINE_STEPS = [
  {
    step: '01',
    icon: ShieldCheck,
    title: 'NeMo Guardrails Filter',
    desc: 'Pre-flight safety inspection intercepts prompt injections, jailbreaks, and off-topic corporate inquiries.'
  },
  {
    step: '02',
    icon: Cpu,
    title: 'Planner Node (LangGraph)',
    desc: 'Classifies user intent to decide between dense vector retrieval or direct conversational answering from thread memory.'
  },
  {
    step: '03',
    icon: Search,
    title: 'Retriever (Qdrant + FlashRank)',
    desc: 'Dense vector retrieval in Qdrant DB refined with ultra-low-latency FlashRank cross-encoder reranking for maximum context precision.'
  },
  {
    step: '04',
    icon: MessageSquareCode,
    title: 'Responder Synthesis (LLM)',
    desc: 'Synthesizes an exact, grounded answer referencing only retrieved context chunks while persisting state across threads.'
  }
];

export default function ArchitectureModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('flow');
  const [imageError, setImageError] = useState(false);

  const graphUrl = getGraphImageUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span>RAG Pipeline Architecture</span>
        </DialogTitle>
        <DialogDescription>
          Multi-hop LangGraph execution lifecycle with guardrail protection.
        </DialogDescription>
      </DialogHeader>
      <DialogClose onClose={() => onClose(false)} />

      <div className="space-y-4 pt-4 flex-1 overflow-y-auto">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeTab === 'flow' ? 'default' : 'outline'}
            className="text-xs h-8"
            onClick={() => setActiveTab('flow')}
          >
            <Layers className="h-3.5 w-3.5 mr-1" /> Pipeline Nodes
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'graph' ? 'default' : 'outline'}
            className="text-xs h-8"
            onClick={() => setActiveTab('graph')}
          >
            <ImageIcon className="h-3.5 w-3.5 mr-1" /> Live Graph PNG
          </Button>
        </div>

        {activeTab === 'flow' ? (
          <div className="space-y-2.5">
            {PIPELINE_STEPS.map((item) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={item.step}
                  className="rounded-lg border border-border/70 bg-zinc-900/40 p-3 flex items-start gap-3 text-xs"
                >
                  <div className="h-8 w-8 rounded-md bg-zinc-800 border border-border/80 flex items-center justify-center shrink-0 mt-0.5">
                    <IconComp className="h-4 w-4 text-zinc-300" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500">{item.step}</span>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-border/70 bg-zinc-950 p-4 min-h-[260px] flex items-center justify-center text-center">
            {!imageError ? (
              <img 
                src={graphUrl} 
                alt="LangGraph Mermaid Flow" 
                className="max-h-[380px] max-w-full object-contain rounded-md"
                onError={() => setImageError(true)} 
              />
            ) : (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Live PNG graph available when FastAPI backend is running.</p>
                <code className="text-[11px] text-zinc-400 font-mono">http://localhost:8080/graph</code>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
