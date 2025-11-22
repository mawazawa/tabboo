import React, { useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useKnowledgeGraph, GraphNode } from '@/hooks/use-knowledge-graph';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, X, Info, Database } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface KnowledgeGraphExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KnowledgeGraphExplorer({ isOpen, onClose }: KnowledgeGraphExplorerProps) {
  const { data, isLoading, error, fetchGraph } = useKnowledgeGraph();
  const { toast } = useToast();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphRef = useRef<any>();
  
  // Initial fetch when opened
  useEffect(() => {
    if (isOpen) {
      fetchGraph();
    }
  }, [isOpen, fetchGraph]);

  // Handle warning toast
  useEffect(() => {
    if (data.warning && isOpen) {
      toast({
        title: "Demo Mode Active",
        description: data.warning,
        variant: "destructive", // Using destructive to grab attention
      });
    }
  }, [data.warning, isOpen, toast]);

  // Auto-zoom on load
  useEffect(() => {
    if (data.nodes.length > 0 && graphRef.current) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 20);
      }, 500);
    }
  }, [data.nodes.length]);

  // Color generation based on label
  const getNodeColor = (node: GraphNode) => {
    if (node.color) return node.color;
    
    // Deterministic color hash
    let hash = 0;
    for (let i = 0; i < node.label.length; i++) {
      hash = node.label.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg">Knowledge Graph Explorer</span>
          <Badge variant="outline" className="ml-2">God Mode</Badge>
          {data.nodes.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {data.nodes.length} Nodes
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchGraph} 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Graph Canvas */}
        <div className="flex-1 relative bg-slate-950 cursor-move">
          {isLoading && data.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Querying Knowledge Graph...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <Card className="w-96 bg-destructive/10 border-destructive/20 pointer-events-auto">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <Info className="w-5 h-5" /> Error
                  </CardTitle>
                  <CardDescription className="text-destructive-foreground">
                    {error}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}
          
          <ForceGraph2D
            ref={graphRef}
            graphData={data}
            nodeLabel="label"
            nodeColor={getNodeColor}
            nodeRelSize={6}
            linkColor={() => 'rgba(255,255,255,0.2)'}
            backgroundColor="#020617" // slate-950
            onNodeClick={(node) => {
              setSelectedNode(node as GraphNode);
              // Zoom to node
              graphRef.current.centerAt(node.x, node.y, 1000);
              graphRef.current.zoom(2.5, 2000);
            }}
            cooldownTicks={100}
            onEngineStop={() => graphRef.current.zoomToFit(400)}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.properties?.name || node.id;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#000';
              ctx.fillText(label, node.x, node.y);

              node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
            }}
            nodePointerAreaPaint={(node: any, color, ctx) => {
               ctx.fillStyle = color;
               const bckgDimensions = node.__bckgDimensions;
               bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
            }}
          />
        </div>

        {/* Detail Panel */}
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-96 bg-background/95 backdrop-blur border-l shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden flex flex-col",
          selectedNode ? "translate-x-0" : "translate-x-full"
        )}>
          {selectedNode && (
            <>
              <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                   <div 
                     className="w-3 h-3 rounded-full" 
                     style={{ backgroundColor: getNodeColor(selectedNode) }} 
                   />
                   <span className="font-bold truncate max-w-[200px]">
                     {selectedNode.label}
                   </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">ID</h4>
                    <p className="font-mono text-xs bg-muted p-2 rounded select-all">
                      {selectedNode.id}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Properties</h4>
                    {selectedNode.properties ? (
                      <div className="space-y-2">
                        {Object.entries(selectedNode.properties).map(([key, value]) => (
                          <div key={key} className="text-sm grid grid-cols-[100px_1fr] gap-2 border-b pb-2 last:border-0">
                            <span className="font-medium text-muted-foreground truncate" title={key}>
                              {key}
                            </span>
                            <span className="break-words font-mono text-xs">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No properties</p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

