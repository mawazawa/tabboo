import React, { useState, useEffect } from 'react';
import { CaseMetadata } from './types';
import {
  X, Database, FileText, Sparkles,
  Calendar, Activity, Save, Cloud, User, MapPin
} from '@/icons';

interface IngestionReviewProps {
  data: CaseMetadata | null;
  isLoading: boolean;
  onConfirm: (data: CaseMetadata) => void;
  onCancel: () => void;
}

export const IngestionReview: React.FC<IngestionReviewProps> = ({ data, isLoading, onConfirm, onCancel }) => {
  const [editedData, setEditedData] = useState<CaseMetadata | null>(null);
  const [confidence, setConfidence] = useState(0);

  // Sync local state and simulate confidence score calculation
  useEffect(() => {
    if (data) {
      setEditedData(data);
      // Simulate a "calculation" animation for confidence
      let start = 0;
      const end = 98.5; // Mock high confidence
      const timer = setInterval(() => {
        start += 1.5;
        if (start >= end) {
          setConfidence(end);
          clearInterval(timer);
        } else {
          setConfidence(start);
        }
      }, 20);
      return () => clearInterval(timer);
    }
  }, [data]);

  // Auto-save logic
  useEffect(() => {
    if (editedData && !isLoading) {
      localStorage.setItem('liquid_ingestion_draft', JSON.stringify(editedData));
    }
  }, [editedData, isLoading]);

  const handleChange = (field: keyof CaseMetadata, value: string) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: value });
    }
  };

  const handleConfirmWrapper = () => {
    if (editedData) {
      localStorage.removeItem('liquid_ingestion_draft');
      onConfirm(editedData);
    }
  };

  const handleCancelWrapper = () => {
    localStorage.removeItem('liquid_ingestion_draft');
    onCancel();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse"></div>
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-10 shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full text-center border border-white/50 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-[6px] border-blue-100 border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={32} className="text-blue-600 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-slate-800 tracking-tight">Neural Extraction</h3>
              <p className="text-sm text-slate-600 mt-3 font-medium leading-relaxed">
                Scanning document topology...<br/>Identifying legal entities...
              </p>
            </div>
            <div className="flex gap-2 mt-2">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!editedData) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Main Glass Container */}
      <div className="
        w-full max-w-5xl max-h-[90vh] flex flex-col
        bg-white/60 backdrop-blur-3xl backdrop-saturate-150
        rounded-[2.5rem] shadow-[0_40px_80px_-12px_rgba(0,0,0,0.15)]
        border border-white/60 ring-1 ring-white/20
        overflow-hidden
      ">

        {/* Header & Confidence Meter */}
        <div className="shrink-0 border-b border-white/40 p-8 bg-gradient-to-b from-white/40 to-transparent">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Activity size={28} />
              </div>
              <div>
                <h2 className="font-bold text-2xl text-slate-800 tracking-tight">Review Extraction</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${confidence}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-100/50">
                    {confidence.toFixed(1)}% AI Confidence
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCancelWrapper}
              className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 text-slate-600 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Metadata Cards */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-2">Canonical Metadata</h3>

              <MetadataField
                icon={<FileText size={16} />}
                label="Document Type"
                value={editedData.documentType}
                onChange={v => handleChange('documentType', v)}
              />
              <MetadataField
                icon={<Database size={16} />}
                label="Case Number"
                value={editedData.caseNumber}
                onChange={v => handleChange('caseNumber', v)}
                mono
              />
              <MetadataField
                icon={<Calendar size={16} />}
                label="Filing Date"
                value={editedData.filingDate || new Date().toLocaleDateString()}
                onChange={v => handleChange('filingDate', v)}
              />
              <MetadataField
                icon={<MapPin size={16} />}
                label="Jurisdiction"
                value="California Superior Court"
                readOnly
              />
            </div>

            {/* Right Column: Graph Relationship */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-2 flex items-center gap-2">
                Identified Parties
              </h3>

              {/* Graph Visualization */}
              <div className="bg-white/40 border border-white/60 rounded-3xl p-8 relative overflow-hidden group">
                {/* Animated Connection Line */}
                <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center z-10 shadow-sm text-[10px] font-black text-slate-400 tracking-widest">
                   VS
                </div>

                <div className="flex justify-between items-center relative z-10 gap-8">
                   <PartyNode
                     role="Plaintiff"
                     value={editedData.plaintiff}
                     onChange={v => handleChange('plaintiff', v)}
                     color="blue"
                   />
                   <PartyNode
                     role="Defendant"
                     value={editedData.defendant}
                     onChange={v => handleChange('defendant', v)}
                     color="rose"
                   />
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-white/40 border border-white/60 rounded-3xl p-6 transition-all focus-within:bg-white/60 focus-within:shadow-lg focus-within:border-blue-200/50">
                 <div className="flex items-center gap-2 mb-3 text-slate-500">
                    <Sparkles size={14} className="text-purple-500" />
                    <label className="text-xs font-bold uppercase tracking-wider">Contextual Summary</label>
                 </div>
                 <textarea
                    value={editedData.summary}
                    onChange={e => handleChange('summary', e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-700 leading-relaxed resize-none h-24 placeholder-slate-400/70"
                    placeholder="AI generated summary of the document..."
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Glass Footer */}
        <div className="shrink-0 p-6 border-t border-white/40 bg-white/30 backdrop-blur-md flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-medium px-2">
             <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-100/50">
               <Cloud size={12} />
               <span>Auto-saved to local draft</span>
             </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             <button
               onClick={handleCancelWrapper}
               className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-white/50 hover:text-slate-700 transition-colors"
             >
               Discard
             </button>
             <button
               onClick={handleConfirmWrapper}
               className="
                 flex-1 sm:flex-none group relative px-8 py-3 rounded-2xl text-sm font-bold text-white
                 bg-slate-900 overflow-hidden shadow-[0_8px_20px_-4px_rgba(15,23,42,0.4)]
                 hover:shadow-[0_12px_24px_-6px_rgba(15,23,42,0.5)] transition-all hover:-translate-y-0.5
               "
             >
               <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative flex items-center justify-center gap-2">
                 <Save size={16} />
                 <span>Seal to Data Vault</span>
               </div>
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-components for cleaner render logic

const MetadataField = ({ icon, label, value, onChange, readOnly, mono }: { icon: React.ReactNode, label: string, value: string, onChange?: (v: string) => void, readOnly?: boolean, mono?: boolean }) => (
  <div className="group bg-white/40 border border-white/60 p-4 rounded-2xl transition-all duration-200 hover:bg-white/60 hover:shadow-md focus-within:bg-white/80 focus-within:shadow-lg focus-within:border-blue-200/50">
    <div className="flex items-center gap-2 mb-1.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
      {icon}
      <label className="text-[10px] font-bold uppercase tracking-widest">{label}</label>
    </div>
    {readOnly ? (
      <div className="text-slate-500 font-medium text-sm py-1">{value}</div>
    ) : (
      <input
         value={value}
         onChange={e => onChange?.(e.target.value)}
         className={`w-full bg-transparent outline-none text-slate-800 placeholder-slate-300 transition-all ${mono ? 'font-mono text-base tracking-tight' : 'font-semibold text-base'}`}
      />
    )}
  </div>
);

const PartyNode = ({ role, value, onChange, color }: { role: string, value: string, onChange: (v: string) => void, color: 'blue' | 'rose' }) => {
  const isBlue = color === 'blue';
  const borderColor = isBlue ? 'group-hover:border-blue-300 focus-within:border-blue-400' : 'group-hover:border-rose-300 focus-within:border-rose-400';
  const badgeColor = isBlue ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700';
  const ringColor = isBlue ? 'focus-within:ring-blue-500/20' : 'focus-within:ring-rose-500/20';

  return (
    <div className={`flex-1 group bg-white/50 border border-white/80 rounded-2xl p-5 transition-all duration-300 hover:shadow-md focus-within:shadow-xl ${borderColor} focus-within:ring-4 ${ringColor}`}>
      <div className="flex justify-center mb-3">
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
          {role}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className={`p-3 rounded-full ${isBlue ? 'bg-blue-50 text-blue-400' : 'bg-rose-50 text-rose-400'} group-hover:scale-110 transition-transform`}>
          <User size={20} />
        </div>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full text-center bg-transparent outline-none font-bold text-lg text-slate-800 placeholder-slate-300"
          placeholder="Name..."
        />
      </div>
    </div>
  );
};
