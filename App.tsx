import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ToolCard } from './components/ToolCard';
import { ConsoleOutput } from './components/ConsoleOutput';
import { ThreatGauge, NetworkActivityChart } from './components/Visualizations';
import { TOOLS } from './constants';
import { ToolDefinition, ScanResult, ToolType } from './types';
import { runOsintScan } from './services/geminiService';
import { Search, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard');
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [targetInput, setTargetInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
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
      setErrorMsg("Connection interrupted. Neural link unstable. Ensure API credentials are valid.");
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

  // Define category order
  const toolCategories = ['Passive', 'Network', 'Analysis', 'Active'];

  return (
    <div className="flex h-screen bg-cyber-950 text-slate-800 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300">
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-cyber-700 flex items-center px-8 bg-cyber-900/50 backdrop-blur-sm z-20 justify-between transition-colors duration-300">
          <div className="flex items-center space-x-4">
            {selectedTool ? (
              <>
                <button onClick={resetSelection} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Dashboard
                </button>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <span className="text-cyber-accent font-mono font-bold">{selectedTool.name}</span>
              </>
            ) : (
              <span className="text-slate-900 dark:text-white font-semibold tracking-wide">Command Center</span>
            )}
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono text-emerald-500">
            <span className="animate-pulse">●</span>
            <span>SYSTEM ONLINE</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 relative">
          {/* Decorative Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none z-0"></div>

          {activeView === 'dashboard' && (
            <>
              {!selectedTool ? (
                <div className="max-w-7xl mx-auto relative z-10">
                  <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Select Operation</h1>
                    <p className="text-slate-500 dark:text-slate-400">Choose an intelligence module to begin reconnaissance.</p>
                  </div>
                  
                  {toolCategories.map(category => {
                    const toolsInCategory = TOOLS.filter(t => t.category === category);
                    if (toolsInCategory.length === 0) return null;

                    return (
                      <div key={category} className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center mb-5">
                          <h2 className="text-sm font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-3 ${
                                category === 'Passive' ? 'bg-sky-500' :
                                category === 'Network' ? 'bg-emerald-500' :
                                category === 'Analysis' ? 'bg-amber-500' :
                                'bg-slate-500'
                            }`}></span>
                            {category} Operations
                          </h2>
                          <div className="ml-4 h-px bg-slate-200 dark:bg-cyber-800 flex-1"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {toolsInCategory.map(tool => (
                            <ToolCard key={tool.id} tool={tool} onClick={handleToolSelect} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col lg:flex-row gap-6 relative z-10">
                  {/* Left Column: Inputs & Controls */}
                  <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-cyber-900 border border-cyber-700 rounded-xl p-6 shadow-lg transition-colors duration-300">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                        <Search size={18} className="mr-2 text-cyber-accent" />
                        Target Configuration
                      </h2>
                      
                      <form onSubmit={handleRunScan} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase">Target Domain / IP</label>
                          <input 
                            type="text" 
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            placeholder="example.com"
                            className="w-full bg-cyber-950 border border-cyber-700 rounded p-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent outline-none font-mono transition-all"
                            autoFocus
                          />
                        </div>
                        
                        <button 
                          type="submit"
                          disabled={isScanning || !targetInput}
                          className={`w-full py-3 rounded font-bold font-mono uppercase tracking-wider flex items-center justify-center transition-all ${
                            isScanning 
                              ? 'bg-cyber-800 text-slate-500 cursor-not-allowed' 
                              : 'bg-cyber-accent hover:bg-cyan-400 text-white dark:text-cyber-900 shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                          }`}
                        >
                          {isScanning ? (
                            <>
                              <RotateCcw className="animate-spin mr-2" size={16} />
                              Processing...
                            </>
                          ) : (
                            <>
                              Execute Scan
                              <ArrowRight className="ml-2" size={16} />
                            </>
                          )}
                        </button>
                      </form>

                      <div className="mt-6 p-4 bg-cyber-950 rounded border border-cyber-700/50 transition-colors duration-300">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Module Info</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{selectedTool.description}</p>
                      </div>
                    </div>

                    {/* Visualization Widgets (Only visible if result exists) */}
                    {currentResult && (
                      <>
                        <ThreatGauge score={Math.floor(Math.random() * 60) + 20} />
                        <NetworkActivityChart />
                      </>
                    )}
                  </div>

                  {/* Right Column: Console Output */}
                  <div className="w-full lg:w-2/3 flex flex-col min-h-[500px]">
                    {errorMsg ? (
                      <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-900/50 p-6 rounded-lg flex items-start text-red-600 dark:text-red-400">
                        <AlertTriangle className="mr-3 flex-shrink-0" />
                        <div>
                          <h3 className="font-bold mb-1">Execution Error</h3>
                          <p>{errorMsg}</p>
                        </div>
                      </div>
                    ) : (
                      <ConsoleOutput 
                        output={currentResult?.rawOutput || ''} 
                        sources={currentResult?.sources}
                        isTyping={isScanning}
                        target={currentResult?.target || targetInput}
                        toolName={getToolName()}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeView === 'history' && (
            <div className="max-w-5xl mx-auto relative z-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Operation Logs</h2>
              <div className="space-y-4">
                {scanHistory.length === 0 ? (
                  <div className="text-slate-500 text-center py-12 border border-dashed border-cyber-700 rounded-lg">
                    No operations recorded in this session.
                  </div>
                ) : (
                  scanHistory.map((scan) => (
                    <div key={scan.id} className="bg-cyber-900 border border-cyber-700 p-4 rounded-lg flex items-center justify-between hover:border-cyber-accent/30 transition-colors cursor-pointer shadow-sm" onClick={() => {
                        // Reopen result
                        const toolDef = TOOLS.find(t => t.id === scan.tool);
                        if (toolDef) {
                            setSelectedTool(toolDef);
                            setCurrentResult(scan);
                            setTargetInput(scan.target);
                            setActiveView('dashboard');
                        }
                    }}>
                      <div className="flex items-center space-x-4">
                         <div className={`p-2 rounded-md bg-cyber-800 text-cyber-accent`}>
                             <RotateCcw size={16} /> 
                         </div>
                         <div>
                           <div className="text-slate-900 dark:text-white font-mono font-bold">{scan.target}</div>
                           <div className="text-xs text-slate-500 uppercase">{scan.tool}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{new Date(scan.timestamp).toLocaleTimeString()}</div>
                         <div className="text-xs text-emerald-600 dark:text-emerald-500">COMPLETED</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}