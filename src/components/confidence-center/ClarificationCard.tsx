import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ClarificationCandidate } from '../../lib/ai/clarification-engine';

interface ClarificationCardProps {
  candidate: ClarificationCandidate;
  onSubmit: (candidateId: string, answer: string, recalibrate: boolean) => void;
}

const importanceColorMap = {
    high: 'border-red-500',
    medium: 'border-yellow-500',
    low: 'border-blue-500',
};

const getImportance = (score: number) => {
    if (score > 7) return 'high';
    if (score > 4) return 'medium';
    return 'low';
}

/**
 * A card that displays a single clarification question and its options.
 */
export const ClarificationCard: React.FC<ClarificationCardProps> = ({ candidate, onSubmit }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const importance = getImportance(candidate.importance);

    const handleApplyNext = () => {
        if (selectedAnswer) {
            onSubmit(candidate.id, selectedAnswer, false);
        }
    };

    const handleApplyNow = () => {
        if (selectedAnswer) {
            onSubmit(candidate.id, selectedAnswer, true);
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-md border-l-4 ${importanceColorMap[importance]}`}>
            <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-3">{candidate.question}</p>
                
                {/* Answer Options */}
                <div className="space-y-2">
                    {candidate.suggestedAnswers.map((answer: string) => (
                        <button
                            key={answer}
                            onClick={() => setSelectedAnswer(answer)}
                            className={`w-full text-left p-2 rounded-md text-sm transition-colors
                                ${selectedAnswer === answer 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }
                            `}
                        >
                            {answer}
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                {selectedAnswer && (
                    <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={handleApplyNext}>
                            Apply Next
                        </Button>
                        <Button variant="default" size="sm" onClick={handleApplyNow}>
                            Apply Now & Recalibrate
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
