import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GraphNode {
  id: string;
  label: string;
  color?: string;
  val?: number;
  properties?: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  warning?: string;
}

export const useKnowledgeGraph = () => {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: responseData, error: functionError } = await supabase.functions.invoke('get-knowledge-graph');

      if (functionError) {
        throw functionError;
      }

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      setData(responseData);
    } catch (err: any) {
      console.error('Error fetching knowledge graph:', err);
      setError(err.message || 'Failed to fetch graph data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchGraph };
};

