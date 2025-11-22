import React, { useState, useEffect } from 'react';
import { ConfidenceCenterIcon } from './ConfidenceCenterIcon';
import { ConfidenceCenter } from './ConfidenceCenter';
import type { ClarificationCandidate } from '../../lib/ai/clarification-engine';

const API_URL = '/api/clarification-api'; // Using a proxy to the Supabase function

/**
 * A controller component that manages the state and logic for the 
 * Confidence Center feature. It fetches candidates and handles user interactions.
 */
export const ConfidenceCenterController: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [candidates, setCandidates] = useState<ClarificationCandidate[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Failed to fetch candidates: ${response.statusText}`);
                }
                const data = await response.json();
                setCandidates(data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching clarification candidates:", err);
            }
        };
        
        fetchCandidates();
        // Optional: Poll for new candidates periodically
        const intervalId = setInterval(fetchCandidates, 60000); // every 60 seconds
        return () => clearInterval(intervalId);
    }, []);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleSubmitAnswer = async (candidateId: string, answer: string, recalibrate: boolean) => {
        console.log({
            message: `Submitting answer for candidate ${candidateId}`,
            answer,
            recalibrate,
        });

        // Remove the answered candidate from the list optimistically
        setCandidates(prev => prev.filter(c => c.id !== candidateId));

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId, answer, recalibrate }),
            });

            if (!response.ok) {
                throw new Error(`Failed to submit answer: ${response.statusText}`);
                // Here you might want to add the candidate back to the list
            }
        } catch (err) {
            setError(err.message);
            console.error("Error submitting answer:", err);
            // TODO: Add logic to revert the optimistic update on failure
        }
    };

    if (error) {
        // You could render a small error indicator instead of nothing
        console.error("Confidence Center Error:", error)
        return null;
    }

    return (
        <>
            <ConfidenceCenterIcon 
                onClick={handleOpen} 
                candidateCount={candidates.length} 
            />
            <ConfidenceCenter 
                isOpen={isOpen} 
                onClose={handleClose}
                candidates={candidates}
                onSubmitAnswer={handleSubmitAnswer}
            />
        </>
    );
};
