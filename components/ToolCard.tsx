import React from 'react';
import * as Icons from 'lucide-react';
import { ToolDefinition } from '../types';

interface ToolCardProps {
  tool: ToolDefinition;
  onClick: (tool: ToolDefinition) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  // Dynamically render icon
  const IconComponent = (Icons as any)[tool.icon] || Icons.Activity;

  return (
    <button 
      onClick={() => onClick(tool)}
      className="group relative flex flex-col p-6 bg-cyber-800 border border-cyber-700 rounded-xl hover:border-cyber-accent transition-all duration-300 text-left overflow-hidden hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] shadow-md"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-20 transition-opacity text-slate-900 dark:text-white">
        <IconComponent size={64} />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-cyber-900 rounded-lg border border-cyber-700 group-hover:border-cyber-accent/50 group-hover:text-cyber-accent text-slate-500 dark:text-slate-400 transition-colors">
          <IconComponent size={24} />
        </div>
        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded border ${
          tool.category === 'Network' ? 'border-emerald-900 text-emerald-600 dark:text-emerald-500 bg-emerald-900/10 dark:bg-emerald-900/20' :
          tool.category === 'Analysis' ? 'border-amber-900 text-amber-600 dark:text-amber-500 bg-amber-900/10 dark:bg-amber-900/20' :
          'border-blue-900 text-blue-600 dark:text-blue-500 bg-blue-900/10 dark:bg-blue-900/20'
        }`}>
          {tool.category}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyber-accent transition-colors font-mono">
        {tool.name}
      </h3>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {tool.description}
      </p>

      <div className="mt-6 flex items-center text-xs font-mono text-slate-500 group-hover:text-cyber-accent transition-colors">
        <span className="mr-2">INITIALIZE MODULE</span>
        <Icons.ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};