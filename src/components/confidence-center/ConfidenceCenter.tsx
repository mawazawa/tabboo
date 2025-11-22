import React from 'react';
import { X } from 'lucide-react';
import { ClarificationCard } from './ClarificationCard';
import type { ClarificationCandidate } from '../../lib/ai/clarification-engine';

interface ConfidenceCenterProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: ClarificationCandidate[];
  onSubmitAnswer: (candidateId: string, answer: string, recalibrate: boolean) => void;
}

/**
 * The main panel for the Confidence Center. It displays a list of
 * clarification questions for the user to answer.
 */
export const ConfidenceCenter: React.FC<ConfidenceCenterProps> = ({ isOpen, onClose, candidates, onSubmitAnswer }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-end">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-800">AI Confidence Center</h2>
            <span className="px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded-full">
              {candidates.length}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Question List */}
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          {candidates.map((candidate) => (
            <ClarificationCard 
              key={candidate.id} 
              candidate={candidate}
              onSubmit={onSubmitAnswer} 
            />
          ))}
        </div>

         {/* Footer */}
         <div className="p-4 border-t bg-gray-50 text-center">
            <p className="text-xs text-gray-500">
                Answering these questions helps the AI improve its accuracy.
            </p>
        </div>
      </div>
    </div>
  );
};
