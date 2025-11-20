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
      className="group relative flex flex-col p-5 bg-cyber-surface border border-cyber-border rounded-sm hover:border-cyber-accent transition-all duration-200 text-left shadow-card hover:shadow-none overflow-hidden h-full"
    >
      {/* Hover Accent Line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-cyber-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex items-start justify-between mb-4 w-full">
        <div className="p-2 rounded-sm bg-cyber-background border border-cyber-border text-cyber-textSecondary group-hover:text-cyber-accent group-hover:border-cyber-accent transition-colors">
          <IconComponent size={18} />
        </div>
        
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm border tracking-wide bg-cyber-background border-cyber-border text-cyber-textSecondary group-hover:text-cyber-text uppercase">
          {tool.category}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-bold text-cyber-text mb-2 group-hover:text-cyber-accent transition-colors uppercase tracking-wide font-mono">
          {tool.name}
        </h3>
        <p className="text-xs text-cyber-textSecondary leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-cyber-border flex items-center justify-between w-full text-[10px] font-bold text-cyber-textSecondary uppercase tracking-widest group-hover:text-cyber-accent transition-colors">
        <span>Execute</span>
        <Icons.ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};