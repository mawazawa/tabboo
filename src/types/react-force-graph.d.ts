declare module 'react-force-graph-2d' {
  import { Component } from 'react';

  export interface GraphData {
    nodes: any[];
    links: any[];
  }

  export interface ForceGraph2DProps {
    graphData: GraphData;
    width?: number;
    height?: number;
    backgroundColor?: string;
    nodeRelSize?: number;
    nodeId?: string;
    nodeLabel?: string | ((node: any) => string);
    nodeColor?: string | ((node: any) => string);
    nodeAutoColorBy?: string;
    linkColor?: string | ((link: any) => string);
    linkWidth?: number | ((link: any) => number);
    onNodeClick?: (node: any, event: any) => void;
    onNodeRightClick?: (node: any, event: any) => void;
    onNodeHover?: (node: any | null, previousNode: any | null) => void;
    onLinkClick?: (link: any, event: any) => void;
    onLinkRightClick?: (link: any, event: any) => void;
    onLinkHover?: (link: any | null, previousLink: any | null) => void;
    onEngineStop?: () => void;
    cooldownTicks?: number;
    nodeCanvasObject?: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    nodePointerAreaPaint?: (node: any, color: string, ctx: CanvasRenderingContext2D) => void;
    ref?: any;
  }

  export default class ForceGraph2D extends Component<ForceGraph2DProps> {}
}

