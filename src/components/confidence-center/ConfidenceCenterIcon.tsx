import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface ConfidenceCenterIconProps {
  onClick: () => void;
  candidateCount: number;
}

/**
 * A persistent icon that shows the number of pending clarifications
 * and opens the Confidence Center panel when clicked.
 */
export const ConfidenceCenterIcon: React.FC<ConfidenceCenterIconProps> = ({ onClick, candidateCount }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
      aria-label="Open AI Confidence Center"
    >
      <BrainCircuit className="w-7 h-7" />
      {candidateCount > 0 && (
        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold ring-2 ring-gray-900">
          {candidateCount}
        </span>
      )}
    </button>
  );
};
