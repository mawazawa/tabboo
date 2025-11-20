import React, { useState } from 'react';
import { ProceduralPhase } from './types';
import { FileText, ArrowRight, ChevronDown, Circle } from '@/icons';
import { cn } from '@/lib/utils';
import type { FormType } from '@/components/FormViewer';

interface ProceduralTimelineProps {
  phases: ProceduralPhase[];
  onFormClick: (formType: FormType, cardPosition: { x: number; y: number; width: number; height: number }) => void;
}

export const ProceduralTimeline: React.FC<ProceduralTimelineProps> = ({ phases, onFormClick }) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const toggleStep = (stepTitle: string) => {
    setExpandedStep(curr => curr === stepTitle ? null : stepTitle);
  };

  const handleFormClick = (e: React.MouseEvent, formType: string) => {
    e.stopPropagation();
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    onFormClick(formType as FormType, {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    });
  };

  return (
    <div className="flex gap-16 pl-32 pt-32 pb-64 min-w-max">
      {phases.map((phase, i) => (
        <div key={i} className="relative min-w-[340px] group">
          
          {/* Phase Header */}
          <div className="absolute -top-16 left-2 flex flex-col gap-1">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-slate-900/20">
                   {i + 1}
                </div>
                <span className="font-mono text-sm font-bold text-slate-400 uppercase tracking-widest">{phase.phase}</span>
             </div>
          </div>

          {/* The "Tube" Line */}
          <div className="absolute top-0 bottom-0 left-[18px] w-[3px] bg-slate-200 group-last:bg-gradient-to-b group-last:from-slate-200 group-last:to-transparent rounded-full"></div>

          <div className="space-y-8 relative z-10">
            {phase.steps.map((step, j) => {
              const isExpanded = expandedStep === step.title;
              
              return (
                  <div 
                    key={j} 
                    className={cn(
                      "ml-10 liquid-glass rounded-2xl cursor-pointer overflow-hidden relative spring-smooth",
                      isExpanded 
                        ? 'border-blue-400/50 shadow-[var(--shadow-ultra-hover)] scale-105 z-20' 
                        : 'shadow-[var(--shadow-diffused)] hover:shadow-[var(--shadow-diffused-hover)] hover:scale-[1.02]'
                    )}
                    onClick={() => toggleStep(step.title)}
                  >
                  {/* Connector dot */}
                  <div className={`
                    absolute top-8 -left-[27px] w-4 h-4 rounded-full bg-white border-[3px] transition-all duration-300
                    ${isExpanded ? 'border-blue-500 scale-110' : 'border-slate-300 group-hover:border-blue-400'}
                  `}></div>

                  {/* Main Card Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold text-lg transition-colors ${isExpanded ? 'text-blue-700' : 'text-slate-800'}`}>
                        {step.title}
                      </h4>
                      <div className={`transform transition-transform duration-500 ${isExpanded ? 'rotate-180 text-blue-500' : 'text-slate-300'}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 font-medium mb-1">{step.desc}</p>

                    {/* Form Tags (Collapsed View) */}
                    {!isExpanded && step.forms.length > 0 && (
                      <div className="flex gap-1 mt-3">
                         {step.forms.map(f => (
                           <div key={f} className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                         ))}
                      </div>
                    )}
                  </div>

                  {/* Nested Children Cards (Micro Tasks) */}
                  <div 
                    className={`
                      bg-slate-50 border-t border-slate-100 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      ${isExpanded ? 'max-h-[500px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'}
                    `}
                  >
                     <div className="space-y-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1 mb-2">Sub-Tasks</div>
                        
                        {step.micro.map((m, k) => (
                           <div key={k} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:scale-[1.02] transition-transform">
                              <div className="text-slate-300"><Circle size={14} /></div>
                              <span className="text-xs font-medium text-slate-600">{m}</span>
                           </div>
                        ))}

                        {step.forms.length > 0 && (
                          <div className="pt-2">
                             <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1 mb-2">Required Forms</div>
                             <div className="grid grid-cols-2 gap-2">
                                {step.forms.map(form => (
                                  <div 
                                    key={form}
                                    onClick={(e) => handleFormClick(e, form)}
                                    className="
                                      flex flex-col items-center justify-center gap-2 p-3 
                                      liquid-glass rounded-xl 
                                      text-amber-800 hover:scale-105 transition-all spring-snappy
                                      active:scale-95 cursor-pointer group/form-mini
                                      shadow-[var(--shadow-diffused)] hover:shadow-[var(--shadow-diffused-hover)]
                                      border-amber-200/50
                                    "
                                  >
                                     <FileText size={18} className="group-hover/form-mini:scale-110 transition-transform spring-snappy text-amber-700" />
                                     <span className="font-mono text-[10px] font-bold">{form}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                     </div>
                  </div>

                </div>
              );
            })}
          </div>
          
          {/* Flow Arrow */}
          {i < phases.length - 1 && (
            <div className="absolute top-1/2 -right-12 text-slate-300/50">
              <ArrowRight size={32} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
