import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ToolCard } from './components/ToolCard';
import { ConsoleOutput } from './components/ConsoleOutput';
import { ThreatGauge, NetworkActivityChart } from './components/Visualizations';
import { TOOLS } from './constants';
import { ToolDefinition, ScanResult } from './types';
import { runOsintScan } from './services/geminiService';
import { 
  Search, 
  ArrowRight, 
  RotateCcw, 
  AlertTriangle, 
  ChevronRight, 
  Clock, 
  Terminal, 
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Filter,
  SortAsc
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard');
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [targetInput, setTargetInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // History Filter & Sort State
  const [historySearch, setHistorySearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'timestamp' | 'target' | 'tool'; direction: 'asc' | 'desc' }>({
    key: 'timestamp',
    direction: 'desc'
  });

  // Theme Management
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleToolSelect = (tool: ToolDefinition) => {
    setSelectedTool(tool);
    setCurrentResult(null);
    setErrorMsg(null);
    setTargetInput('');
  };

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !targetInput.trim()) return;

    setIsScanning(true);
    setErrorMsg(null);
    setCurrentResult(null);

    try {
      const result = await runOsintScan(selectedTool.id, targetInput);
      setCurrentResult(result);
      setScanHistory(prev => [result, ...prev]);
    } catch (err) {
      setErrorMsg("OPERATION FAILED: UPLINK UNSTABLE OR CREDENTIALS INVALID.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetSelection = () => {
    setSelectedTool(null);
    setCurrentResult(null);
    setTargetInput('');
  };

  const getToolName = () => {
      if (selectedTool) return selectedTool.name;
      if (currentResult) {
          const tool = TOOLS.find(t => t.id === currentResult.tool);
          return tool ? tool.name : 'Unknown Tool';
      }
      return 'Unknown';
  };

  // Group tools by category
  const categories = ['Network', 'Passive', 'Analysis'];
  const groupedTools = categories.reduce((acc, category) => {
    acc[category] = TOOLS.filter(t => t.category === category);
    return acc;
  }, {} as Record<string, ToolDefinition[]>);

  // Filter and Sort History
  const processedHistory = useMemo(() => {
    let data = [...scanHistory];

    // Filter
    if (historySearch) {
      const term = historySearch.toLowerCase();
      data = data.filter(item => 
        item.target.toLowerCase().includes(term) || 
        item.tool.toLowerCase().includes(term)
      );
    }

    // Sort
    data.sort((a, b) => {
      let valA: any = a[sortConfig.key];
      let valB: any = b[sortConfig.key];

      // Normalize string comparisons
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [scanHistory, historySearch, sortConfig]);

  const handleSort = (key: 'timestamp' | 'target' | 'tool') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="flex h-screen bg-cyber-background text-cyber-text font-sans overflow-hidden transition-colors duration-300">
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-14 border-b border-cyber-border flex items-center px-6 bg-cyber-background/95 backdrop-blur-sm z-20 justify-between sticky top-0">
          <div className="flex items-center text-sm font-medium">
            <button onClick={resetSelection} className="flex items-center text-cyber-textSecondary hover:text-cyber-accent transition-colors uppercase tracking-wider text-xs">
              <Terminal size={14} className="mr-2" />
              Ops Center
            </button>
            {selectedTool && (
              <>
                <ChevronRight size={14} className="mx-2 text-cyber-border" />
                <span className="text-cyber-accent bg-cyber-accent/10 px-2 py-0.5 rounded border border-cyber-accent/20 text-xs font-bold uppercase tracking-wide">
                  {selectedTool.name}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded border border-cyber-border bg-cyber-surface">
              <div className={`h-1.5 w-1.5 rounded-full ${isScanning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="text-[10px] font-bold text-cyber-textSecondary tracking-widest uppercase">
                {isScanning ? 'BUSY' : 'READY'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 md:p-8 relative scroll-smooth">
          
          {/* Layout Container */}
          <div className="max-w-8xl mx-auto min-h-full">

            {activeView === 'dashboard' && (
              <>
                {!selectedTool ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mb-8 border-b border-cyber-border pb-6">
                      <h1 className="text-2xl font-bold text-cyber-text tracking-tight mb-2 uppercase font-mono">Active Operations</h1>
                      <p className="text-cyber-textSecondary text-sm max-w-2xl">Select a reconnaissance vector to initialize intelligence gathering sequence.</p>
                    </div>
                    
                    <div className="space-y-8">
                      {categories.map((category) => (
                         groupedTools[category] && groupedTools[category].length > 0 && (
                          <div key={category}>
                            <div className="flex items-center mb-4 space-x-2">
                              <div className="h-px bg-cyber-border flex-1"></div>
                              <span className="text-xs font-bold text-cyber-textSecondary uppercase tracking-widest px-2">{category} Ops</span>
                              <div className="h-px bg-cyber-border flex-1"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {groupedTools[category].map(tool => (
                                <ToolCard key={tool.id} tool={tool} onClick={handleToolSelect} />
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300 h-full">
                    
                    {/* Left Column: Inputs & Controls */}
                    <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
                      <div className="bg-cyber-surface border border-cyber-border rounded-sm p-6 shadow-card">
                        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-cyber-border">
                          <Search size={18} className="text-cyber-accent" />
                          <h2 className="text-sm font-bold text-cyber-text uppercase tracking-wider">Target Acquisition</h2>
                        </div>
                        
                        <form onSubmit={handleRunScan} className="space-y-5">
                          <div>
                            <label className="block text-[10px] font-bold text-cyber-textSecondary mb-2 uppercase tracking-widest">Identifier (IP / Domain)</label>
                            <input 
                              type="text" 
                              value={targetInput}
                              onChange={(e) => setTargetInput(e.target.value)}
                              placeholder="TARGET_ID"
                              className="w-full bg-cyber-background border border-cyber-border focus:border-cyber-accent rounded-sm px-4 py-3 text-cyber-text placeholder-cyber-textSecondary/30 focus:ring-1 focus:ring-cyber-accent outline-none font-mono text-sm transition-all"
                              autoFocus
                            />
                          </div>
                          
                          <button 
                            type="submit"
                            disabled={isScanning || !targetInput}
                            className={`w-full py-3 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all ${
                              isScanning 
                                ? 'bg-cyber-surfaceHover text-cyber-textSecondary cursor-wait border border-cyber-border' 
                                : 'bg-cyber-accent hover:bg-cyber-accentHover text-black border border-transparent shadow-sm hover:shadow-glow'
                            }`}
                          >
                            {isScanning ? (
                              <>
                                <RotateCcw className="animate-spin mr-2" size={14} />
                                EXEC_SCAN...
                              </>
                            ) : (
                              <>
                                INITIALIZE_RECON
                                <ArrowRight className="ml-2" size={14} />
                              </>
                            )}
                          </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-cyber-border">
                           <div className="text-[10px] text-cyber-textSecondary font-bold uppercase tracking-widest mb-2">Protocol Info</div>
                           <p className="text-xs text-cyber-textSecondary leading-relaxed font-mono">{selectedTool.description}</p>
                        </div>
                      </div>

                      {/* Visualization Widgets */}
                      {currentResult && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-100">
                          <div className="rounded-sm overflow-hidden shadow-card border border-cyber-border bg-cyber-surface">
                             <ThreatGauge score={Math.floor(Math.random() * 60) + 20} />
                          </div>
                          <div className="rounded-sm overflow-hidden shadow-card border border-cyber-border bg-cyber-surface">
                             <NetworkActivityChart />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Console Output */}
                    <div className="w-full lg:flex-1 flex flex-col min-h-[600px]">
                      {errorMsg ? (
                        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-sm flex items-start text-red-500 animate-in slide-in-from-right-4">
                          <AlertTriangle className="mr-3 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold mb-1 text-sm font-mono uppercase tracking-wider">System Error</h3>
                            <p className="text-sm font-mono opacity-90">{errorMsg}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col shadow-card rounded-sm overflow-hidden border border-cyber-border bg-black">
                           <ConsoleOutput 
                            output={currentResult?.rawOutput || ''} 
                            sources={currentResult?.sources}
                            isTyping={isScanning}
                            target={currentResult?.target || targetInput}
                            toolName={getToolName()}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeView === 'history' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-6 border-b border-cyber-border gap-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-cyber-text uppercase tracking-tight font-mono">Mission Logs</h2>
                    <span className="text-xs font-bold font-mono text-cyber-accent bg-cyber-accent/10 px-3 py-1 rounded-sm border border-cyber-accent/20">
                      {processedHistory.length} RECORDS
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                     {/* Search Input */}
                    <div className="relative group w-full md:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-textSecondary group-focus-within:text-cyber-accent transition-colors" />
                      <input 
                        type="text" 
                        placeholder="FILTER LOGS..." 
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full bg-cyber-surface border border-cyber-border rounded-sm py-2 pl-9 pr-4 text-xs font-mono text-cyber-text focus:border-cyber-accent focus:ring-0 outline-none uppercase placeholder-cyber-textSecondary/50"
                      />
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center gap-1 bg-cyber-surface p-1 rounded-sm border border-cyber-border">
                      {(['timestamp', 'target', 'tool'] as const).map((key) => (
                        <button
                          key={key}
                          onClick={() => handleSort(key)}
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1 transition-all ${
                            sortConfig.key === key 
                              ? 'bg-cyber-accent text-black' 
                              : 'text-cyber-textSecondary hover:text-cyber-text hover:bg-cyber-background'
                          }`}
                        >
                          {key === 'timestamp' ? 'Date' : key}
                          {sortConfig.key === key && (
                            sortConfig.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-cyber-surface border border-cyber-border rounded-sm overflow-hidden">
                  {processedHistory.length === 0 ? (
                    <div className="text-cyber-textSecondary text-center py-20">
                      {historySearch ? (
                        <>
                           <Filter size={32} className="mx-auto mb-4 opacity-30" />
                           <p className="text-sm font-mono uppercase tracking-widest">No Matches Found</p>
                        </>
                      ) : (
                        <>
                          <Clock size={32} className="mx-auto mb-4 opacity-30" />
                          <p className="text-sm font-mono uppercase tracking-widest">No Data Available</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-cyber-border">
                      {processedHistory.map((scan) => (
                        <div 
                          key={scan.id} 
                          className="p-4 flex items-center justify-between hover:bg-cyber-surfaceHover transition-colors cursor-pointer group" 
                          onClick={() => {
                            const toolDef = TOOLS.find(t => t.id === scan.tool);
                            if (toolDef) {
                                setSelectedTool(toolDef);
                                setCurrentResult(scan);
                                setTargetInput(scan.target);
                                setActiveView('dashboard');
                            }
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-sm bg-cyber-background border border-cyber-border text-cyber-textSecondary group-hover:text-cyber-accent group-hover:border-cyber-accent transition-colors">
                                <ShieldCheck size={16} /> 
                            </div>
                            <div>
                              <div className="text-cyber-text font-mono font-bold text-sm">{scan.target}</div>
                              <div className="text-[10px] text-cyber-textSecondary uppercase tracking-wider mt-0.5">{scan.tool}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-cyber-textSecondary font-mono">{new Date(scan.timestamp).toLocaleTimeString()} <span className="text-cyber-textSecondary/50">|</span> {new Date(scan.timestamp).toLocaleDateString()}</div>
                            <div className="text-[10px] font-bold text-emerald-500 mt-1 tracking-wider">COMPLETE</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}