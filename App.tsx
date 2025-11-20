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
    <div className="flex h-screen bg-background text-primary font-sans overflow-hidden transition-colors duration-300">
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="border-b flex items-center px-6 bg-background backdrop-blur-sm z-20 justify-between sticky top-0" style={{ height: '3.5rem' }}>
          <div className="flex items-center text-sm font-medium">
            <button onClick={resetSelection} className="flex items-center text-secondary hover-text-accent transition-colors uppercase tracking-wider text-xs">
              <Terminal size={14} className="mr-2" />
              Ops Center
            </button>
            {selectedTool && (
              <>
                <ChevronRight size={14} className="mx-2 text-secondary" />
                <span className="text-accent bg-surface px-2 py-1 rounded border border-accent text-xs font-bold uppercase tracking-wide" style={{ borderColor: 'rgba(245, 158, 11, 0.2)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  {selectedTool.name}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md-flex items-center space-x-2 px-3 py-1 rounded border bg-surface">
              <div className={`rounded-full ${isScanning ? 'animate-pulse' : ''}`} style={{ width: '6px', height: '6px', backgroundColor: isScanning ? 'var(--warning)' : 'var(--success)' }}></div>
              <span className="text-xs font-bold text-secondary tracking-widest uppercase" style={{ fontSize: '10px' }}>
                {isScanning ? 'BUSY' : 'READY'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 md-px-6 relative" style={{ scrollBehavior: 'smooth' }}>
          
          {/* Layout Container */}
          <div className="max-w-8xl mx-auto h-full">

            {activeView === 'dashboard' && (
              <>
                {!selectedTool ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 border-b pb-6">
                      <h1 className="text-2xl font-bold text-primary tracking-tight mb-2 uppercase font-mono">Active Operations</h1>
                      <p className="text-secondary text-sm max-w-2xl">Select a reconnaissance vector to initialize intelligence gathering sequence.</p>
                    </div>
                    
                    <div className="space-y-8">
                      {categories.map((category) => (
                         groupedTools[category] && groupedTools[category].length > 0 && (
                          <div key={category}>
                            <div className="flex items-center mb-4 space-x-2">
                              <div className="flex-1 border-b"></div>
                              <span className="text-xs font-bold text-secondary uppercase tracking-widest px-2">{category} Ops</span>
                              <div className="flex-1 border-b"></div>
                            </div>
                            <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
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
                  <div className="flex flex-col lg-flex-row gap-6 animate-in fade-in duration-300 h-full">
                    
                    {/* Left Column: Inputs & Controls */}
                    <div className="w-full lg-w-400 flex flex-col gap-6 shrink-0">
                      <div className="bg-surface border rounded-sm p-6 shadow-card">
                        <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                          <Search size={18} className="text-accent" />
                          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Target Acquisition</h2>
                        </div>
                        
                        <form onSubmit={handleRunScan} className="space-y-5">
                          <div>
                            <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-widest" style={{ fontSize: '10px' }}>Identifier (IP / Domain)</label>
                            <input 
                              type="text" 
                              value={targetInput}
                              onChange={(e) => setTargetInput(e.target.value)}
                              placeholder="TARGET_ID"
                              className="w-full bg-background border focus-ring rounded-sm px-4 py-3 text-primary outline-none font-mono text-sm transition-all"
                              autoFocus
                            />
                          </div>
                          
                          <button 
                            type="submit"
                            disabled={isScanning || !targetInput}
                            className={`w-full py-3 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all border ${
                              isScanning 
                                ? 'bg-surface text-secondary' 
                                : 'bg-accent text-black hover-bg-surface border-transparent'
                            }`}
                            style={{ cursor: isScanning ? 'wait' : 'pointer' }}
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

                        <div className="mt-6 pt-4 border-t">
                           <div className="text-secondary font-bold uppercase tracking-widest mb-2" style={{ fontSize: '10px' }}>Protocol Info</div>
                           <p className="text-xs text-secondary font-mono" style={{ lineHeight: '1.6' }}>{selectedTool.description}</p>
                        </div>
                      </div>

                      {/* Visualization Widgets */}
                      {currentResult && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
                          <div className="rounded-sm overflow-hidden shadow-card border bg-surface">
                             <ThreatGauge score={Math.floor(Math.random() * 60) + 20} />
                          </div>
                          <div className="rounded-sm overflow-hidden shadow-card border bg-surface">
                             <NetworkActivityChart />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Console Output */}
                    <div className="w-full lg-flex-1 flex flex-col" style={{ minHeight: '600px' }}>
                      {errorMsg ? (
                        <div className="border p-6 rounded-sm flex items-start text-red animate-in slide-in-from-right-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                          <AlertTriangle className="mr-3 shrink-0" />
                          <div>
                            <h3 className="font-bold mb-1 text-sm font-mono uppercase tracking-wider">System Error</h3>
                            <p className="text-sm font-mono opacity-90">{errorMsg}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col shadow-card rounded-sm overflow-hidden border bg-black">
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
                <div className="flex flex-col md-flex-row items-start md-items-center justify-between mb-6 pb-6 border-b gap-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-primary uppercase tracking-tight font-mono">Mission Logs</h2>
                    <span className="text-xs font-bold font-mono text-accent px-3 py-1 rounded-sm border border-accent" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                      {processedHistory.length} RECORDS
                    </span>
                  </div>

                  <div className="flex flex-col md-flex-row w-full md-w-auto gap-3">
                     {/* Search Input */}
                    <div className="relative group w-full md-w-64">
                      <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary group-hover-text-accent transition-colors" style={{ marginTop: '-1px' }} />
                      <input 
                        type="text" 
                        placeholder="FILTER LOGS..." 
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full bg-surface border rounded-sm py-2 pl-9 pr-4 text-xs font-mono text-primary focus-ring outline-none uppercase"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center gap-1 bg-surface p-1 rounded-sm border">
                      {(['timestamp', 'target', 'tool'] as const).map((key) => (
                        <button
                          key={key}
                          onClick={() => handleSort(key)}
                          className={`px-3 py-1.5 font-bold uppercase tracking-wider rounded-sm flex items-center gap-1 transition-all ${
                            sortConfig.key === key 
                              ? 'bg-accent text-black' 
                              : 'text-secondary hover-text-primary hover-bg-surface'
                          }`}
                          style={{ fontSize: '10px' }}
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
                
                <div className="bg-surface border rounded-sm overflow-hidden">
                  {processedHistory.length === 0 ? (
                    <div className="text-secondary text-center" style={{ padding: '5rem 0' }}>
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
                    <div className="flex flex-col">
                      {processedHistory.map((scan) => (
                        <div 
                          key={scan.id} 
                          className="p-4 flex items-center justify-between hover-bg-surface-hover transition-colors cursor-pointer group border-b" 
                          style={{ borderColor: 'var(--border)' }}
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
                            <div className="p-2 rounded-sm bg-background border text-secondary group-hover-text-accent group-hover-border-accent transition-colors">
                                <ShieldCheck size={16} /> 
                            </div>
                            <div>
                              <div className="text-primary font-mono font-bold text-sm">{scan.target}</div>
                              <div className="text-secondary uppercase tracking-wider mt-1" style={{ fontSize: '10px' }}>{scan.tool}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-secondary font-mono">{new Date(scan.timestamp).toLocaleTimeString()} <span className="opacity-50">|</span> {new Date(scan.timestamp).toLocaleDateString()}</div>
                            <div className="font-bold text-emerald mt-1 tracking-wider" style={{ fontSize: '10px' }}>COMPLETE</div>
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