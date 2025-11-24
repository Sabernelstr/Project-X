import React from 'react';
import { Shield, Activity, Clock, Settings, Sun, Moon } from 'lucide-react';

interface SidebarProps {
  onNavigate: (view: 'dashboard' | 'history') => void;
  activeView: 'dashboard' | 'history';
  theme: string;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView, theme, toggleTheme }) => {
  return (
    <div className="w-20 md:w-64 h-screen bg-cyber-900 border-r border-cyber-700 flex flex-col flex-shrink-0 transition-all duration-300">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-cyber-700 transition-colors duration-300">
        <Shield className="text-cyber-accent w-8 h-8" />
        <span className="ml-3 font-mono font-bold text-xl text-slate-900 dark:text-white hidden md:block tracking-tighter transition-colors duration-300">
          PROJECT_<span className="text-cyber-accent">X</span>
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-6 space-y-2 px-2 md:px-4">
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center justify-center md:justify-start space-x-0 md:space-x-3 px-2 md:px-4 py-3 rounded-lg transition-all duration-200 group ${
            activeView === 'dashboard' 
              ? 'bg-cyber-800 text-cyber-accent border border-cyber-700' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-cyber-800/50 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity size={20} />
          <span className="hidden md:block font-medium text-sm">Operations</span>
        </button>

        <button 
          onClick={() => onNavigate('history')}
          className={`w-full flex items-center justify-center md:justify-start space-x-0 md:space-x-3 px-2 md:px-4 py-3 rounded-lg transition-all duration-200 group ${
            activeView === 'history' 
              ? 'bg-cyber-800 text-cyber-accent border border-cyber-700' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-cyber-800/50 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock size={20} />
          <span className="hidden md:block font-medium text-sm">Logs</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-cyber-700 transition-colors duration-300">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-center md:justify-start space-x-3 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="hidden md:block text-xs font-mono uppercase">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
    </div>
  );
};