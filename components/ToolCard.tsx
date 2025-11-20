import React from 'react';
import * as Icons from 'lucide-react';
import { ToolDefinition } from '../types';

interface ToolCardProps {
  tool: ToolDefinition;
  onClick: (tool: ToolDefinition) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const IconComponent = (Icons as any)[tool.icon] || Icons.Activity;

  return (
    <button 
      onClick={() => onClick(tool)}
      className="group relative flex flex-col p-5 bg-surface border rounded-sm hover-border-accent transition-all text-left shadow-card h-full overflow-hidden w-full"
    >
      {/* Hover Accent Line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-accent opacity-0 group-hover-opacity-100 transition-all"></div>

      <div className="flex items-start justify-between mb-4 w-full">
        <div className="p-2 rounded-sm bg-background border text-secondary group-hover-text-accent group-hover-border-accent transition-colors">
          <IconComponent size={18} />
        </div>
        
        <span className="font-bold px-2 py-0.5 rounded-sm border tracking-wide bg-background text-secondary group-hover-text-primary uppercase" style={{ fontSize: '10px' }}>
          {tool.category}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-bold text-primary mb-2 group-hover-text-accent transition-colors uppercase tracking-wide font-mono">
          {tool.name}
        </h3>
        <p className="text-xs text-secondary" style={{ lineHeight: '1.6' }}>
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between w-full font-bold text-secondary uppercase tracking-widest group-hover-text-accent transition-colors" style={{ fontSize: '10px' }}>
        <span>Execute</span>
        <Icons.ArrowRight size={12} className="group-hover-translate-x transition-all" />
      </div>
    </button>
  );
};