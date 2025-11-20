import React from 'react';
import { OrgNode } from './types';
import { MapPin, Gavel, User, Scale } from '@/icons';

interface OrgChartProps {
  data: OrgNode;
  onNodeClick: (node: OrgNode) => void;
}

const NodeCard: React.FC<{ node: OrgNode; onClick: () => void }> = ({ node, onClick }) => {
  const Icon = node.role.includes('Judge') ? Gavel : node.type === 'CIVIL' ? Scale : User;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="
        group
        relative w-[280px] bg-white/80 backdrop-filter backdrop-blur-lg
        border border-slate-200 rounded-xl p-4 shadow-lg
        transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:scale-105 hover:shadow-xl hover:border-blue-300 cursor-pointer
        z-10 active:scale-95
      "
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`
          text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border
          ${node.type === 'ADMIN' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
          ${node.type === 'CIVIL' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
          ${node.type === 'FAMILY' ? 'bg-rose-50 text-rose-600 border-rose-200' : ''}
          ${node.type === 'CRIMINAL' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
        `}>
          {node.type}
        </span>

        {node.lat && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md animate-bounce z-20">
             <MapPin size={12} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-1">
         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Icon size={16} />
         </div>
         <div>
            <h3 className="font-bold text-sm text-slate-800 leading-tight">{node.judge}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Dept {node.dept}</p>
         </div>
      </div>

      <p className="text-xs text-slate-500 mt-2 pl-1 border-l-2 border-slate-200">
        {node.role}
        {node.desc && <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{node.desc}</span>}
      </p>
    </div>
  );
};

export const OrgChart: React.FC<OrgChartProps> = ({ data, onNodeClick }) => {
  const renderTree = (node: OrgNode) => (
    <li key={node.id}>
      <NodeCard node={node} onClick={() => onNodeClick(node)} />
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map(renderTree)}
        </ul>
      )}
    </li>
  );

  return (
    <div className="tree pl-32 pt-32">
      <style>{`
        .tree ul {
          padding-top: 20px;
          position: relative;
          transition: all 0.5s;
        }
        .tree li {
          float: left;
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 5px 0 5px;
          transition: all 0.5s;
        }
        .tree li::before, .tree li::after {
          content: '';
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 2px solid #e2e8f0;
          width: 50%;
          height: 20px;
        }
        .tree li::after {
          right: auto;
          left: 50%;
          border-left: 2px solid #e2e8f0;
        }
        .tree li:only-child::after, .tree li:only-child::before {
          display: none;
        }
        .tree li:only-child {
          padding-top: 0;
        }
        .tree li:first-child::before, .tree li:last-child::after {
          border: 0 none;
        }
        .tree li:last-child::before {
          border-right: 2px solid #e2e8f0;
          border-radius: 0 5px 0 0;
        }
        .tree li:first-child::after {
          border-radius: 5px 0 0 0;
        }
        .tree ul ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 2px solid #e2e8f0;
          width: 0;
          height: 20px;
        }
      `}</style>
      <ul>{renderTree(data)}</ul>
    </div>
  );
};
