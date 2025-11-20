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
    <div className="h-screen bg-surface border-r flex flex-col shrink-0 transition-all z-30 w-16 md-w-64">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-center md-justify-start md-px-6 border-b" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
        <div className="flex items-center gap-3 text-primary">
          <div className="p-1 rounded bg-accent text-black">
            <Shield className="w-5 h-5" strokeWidth={3} />
          </div>
          <span className="hidden md-block font-bold text-base tracking-wide uppercase font-mono">
            Project_X
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1">
        <div className="hidden md-block px-6 mb-4 font-bold uppercase tracking-widest text-secondary" style={{ fontSize: '10px' }}>
          Main Modules
        </div>
        
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center justify-center md-justify-start px-6 py-3 border-l-2 transition-all group ${
            activeView === 'dashboard' 
              ? 'border-accent bg-background text-primary' 
              : 'border-transparent text-secondary hover-bg-surface-hover hover-text-primary'
          }`}
        >
          <div className="md-mr-3">
             <LayoutGrid size={18} className={activeView === 'dashboard' ? 'text-accent' : ''} />
          </div>
          <span className="hidden md-block font-medium text-xs uppercase tracking-wider">Ops Dashboard</span>
        </button>

        <button 
          onClick={() => onNavigate('history')}
          className={`w-full flex items-center justify-center md-justify-start px-6 py-3 border-l-2 transition-all group ${
            activeView === 'history' 
              ? 'border-accent bg-background text-primary' 
              : 'border-transparent text-secondary hover-bg-surface-hover hover-text-primary'
          }`}
        >
          <div className="md-mr-3">
            <Clock size={18} className={activeView === 'history' ? 'text-accent' : ''} />
          </div>
          <span className="hidden md-block font-medium text-xs uppercase tracking-wider">Audit Logs</span>
        </button>
      </nav>

      {/* Footer / User Config */}
      <div className="p-4 border-t" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-center md-justify-start space-x-3 px-4 py-2 rounded-sm text-secondary hover-text-accent hover-bg-surface-hover transition-colors border border-transparent"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span className="hidden md-block text-xs font-bold uppercase tracking-wide ml-2">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
    </div>
  );
};