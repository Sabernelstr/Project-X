import React from 'react';
import { Shield, Activity, Clock, Sun, Moon, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  onNavigate: (view: 'dashboard' | 'history') => void;
  activeView: 'dashboard' | 'history';
  theme: string;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView, theme, toggleTheme }) => {
  return (
    <div className="w-16 md:w-64 h-screen bg-cyber-surface border-r border-cyber-border flex flex-col flex-shrink-0 transition-all duration-300 z-30">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-center md:justify-start md:px-6 border-b border-cyber-border bg-cyber-background/50">
        <div className="flex items-center gap-3 text-cyber-text">
          <div className="p-1 rounded bg-cyber-accent text-black">
            <Shield className="w-5 h-5" strokeWidth={3} />
          </div>
          <span className="hidden md:block font-bold text-base tracking-wide uppercase font-mono">
            Project_X
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1">
        <div className="hidden md:block px-6 mb-4 text-[10px] font-bold uppercase tracking-widest text-cyber-textSecondary">
          Main Modules
        </div>
        
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center justify-center md:justify-start space-x-0 md:space-x-4 px-6 py-3 border-l-2 transition-all duration-200 group ${
            activeView === 'dashboard' 
              ? 'border-cyber-accent bg-cyber-background text-cyber-text' 
              : 'border-transparent text-cyber-textSecondary hover:bg-cyber-surfaceHover hover:text-cyber-text'
          }`}
        >
          <LayoutGrid size={18} className={activeView === 'dashboard' ? 'text-cyber-accent' : ''} />
          <span className="hidden md:block font-medium text-xs uppercase tracking-wider">Ops Dashboard</span>
        </button>

        <button 
          onClick={() => onNavigate('history')}
          className={`w-full flex items-center justify-center md:justify-start space-x-0 md:space-x-4 px-6 py-3 border-l-2 transition-all duration-200 group ${
            activeView === 'history' 
              ? 'border-cyber-accent bg-cyber-background text-cyber-text' 
              : 'border-transparent text-cyber-textSecondary hover:bg-cyber-surfaceHover hover:text-cyber-text'
          }`}
        >
          <Clock size={18} className={activeView === 'history' ? 'text-cyber-accent' : ''} />
          <span className="hidden md:block font-medium text-xs uppercase tracking-wider">Audit Logs</span>
        </button>
      </nav>

      {/* Footer / User Config */}
      <div className="p-4 border-t border-cyber-border bg-cyber-background/30">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-center md:justify-start space-x-3 px-4 py-2 rounded-sm text-cyber-textSecondary hover:text-cyber-accent hover:bg-cyber-surfaceHover transition-colors border border-transparent hover:border-cyber-border"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span className="hidden md:block text-xs font-bold uppercase tracking-wide">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
    </div>
  );
};