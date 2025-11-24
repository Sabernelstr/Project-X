import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Terminal, ExternalLink, Copy, Check, Maximize2, Minimize2, Download, FileText, File as FileIcon } from 'lucide-react';
import { jsPDF } from "jspdf";

interface ConsoleOutputProps {
  output: string;
  sources?: { title: string; uri: string }[];
  isTyping?: boolean;
  target?: string;
  toolName?: string;
}

// --- Graph Visualization Components ---

interface GraphNode {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphData {
  nodes: { id: string; label: string; category: string }[];
  edges: { from: string; to: string }[];
}

const TechStackGraph: React.FC<{ data: GraphData }> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<{ source: GraphNode; target: GraphNode }[]>([]);

  // Initialize simulation
  useEffect(() => {
    if (!data.nodes.length) return;

    const width = containerRef.current?.clientWidth || 600;
    const height = 300;
    
    // Initial positions
    const initialNodes = data.nodes.map((n) => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }));

    setNodes(initialNodes);

    // Map edges to node objects
    const nodeMap = new Map(initialNodes.map(n => [n.id, n]));
    const initialEdges = data.edges
      .map(e => ({ source: nodeMap.get(e.from), target: nodeMap.get(e.to) }))
      .filter(e => e.source && e.target) as { source: GraphNode; target: GraphNode }[];
      
    setEdges(initialEdges);

  }, [data]);

  // Force Simulation Loop
  useEffect(() => {
    if (nodes.length === 0) return;

    let animationFrameId: number;
    const width = containerRef.current?.clientWidth || 600;
    const height = 300;

    const tick = () => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(n => ({ ...n }));
        const k = 0.05; // Repulsion constant
        const springLength = 80;
        const springStrength = 0.05;
        const centerStrength = 0.01;

        // Repulsion
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const dx = newNodes[j].x - newNodes[i].x;
            const dy = newNodes[j].y - newNodes[i].y;
            const distSq = dx * dx + dy * dy || 1;
            const dist = Math.sqrt(distSq);
            const force = (k * k) / dist;
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            newNodes[i].vx -= fx;
            newNodes[i].vy -= fy;
            newNodes[j].vx += fx;
            newNodes[j].vy += fy;
          }
        }

        // Springs (Edges)
        edges.forEach(edge => {
           const sNode = newNodes.find(n => n.id === edge.source.id);
           const tNode = newNodes.find(n => n.id === edge.target.id);
           if (sNode && tNode) {
             const dx = tNode.x - sNode.x;
             const dy = tNode.y - sNode.y;
             const dist = Math.sqrt(dx * dx + dy * dy) || 1;
             const force = (dist - springLength) * springStrength;
             
             const fx = (dx / dist) * force;
             const fy = (dy / dist) * force;

             sNode.vx += fx;
             sNode.vy += fy;
             tNode.vx -= fx;
             tNode.vy -= fy;
           }
        });

        // Center Gravity & Damping & Update
        newNodes.forEach(node => {
           const dx = (width / 2) - node.x;
           const dy = (height / 2) - node.y;
           
           node.vx += dx * centerStrength;
           node.vy += dy * centerStrength;

           node.vx *= 0.85; // Damping
           node.vy *= 0.85;

           node.x += node.vx;
           node.y += node.vy;

           // Boundaries
           node.x = Math.max(20, Math.min(width - 20, node.x));
           node.y = Math.max(20, Math.min(height - 20, node.y));
        });

        return newNodes;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    // Run simulation for a fixed duration to settle
    const timeoutId = setTimeout(() => cancelAnimationFrame(animationFrameId), 5000);
    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [edges]); // Depend on edges as they are derived from initial nodes

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      'Frontend': '#0ea5e9', // sky-500
      'Backend': '#10b981', // emerald-500
      'Database': '#f59e0b', // amber-500
      'Infrastructure': '#8b5cf6', // violet-500
      'Utility': '#64748b', // slate-500
    };
    return map[cat] || '#94a3b8';
  };

  return (
    <div ref={containerRef} className="w-full h-[320px] bg-[#0f172a] border border-slate-800 rounded-lg my-4 relative overflow-hidden group">
       <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Tech Stack Topology</div>
       <svg width="100%" height="100%" className="pointer-events-none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="18" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
            </marker>
          </defs>
          {/* Edges */}
          {edges.map((e, i) => {
             // Find current positions from state
             const s = nodes.find(n => n.id === e.source.id);
             const t = nodes.find(n => n.id === e.target.id);
             if (!s || !t) return null;
             return (
               <line 
                 key={i}
                 x1={s.x} y1={s.y}
                 x2={t.x} y2={t.y}
                 stroke="#334155"
                 strokeWidth="1.5"
                 markerEnd="url(#arrowhead)"
               />
             );
          })}
          
          {/* Nodes */}
          {nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}>
               <circle r="14" fill="#0f172a" stroke={getCategoryColor(n.category)} strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
               <circle r="4" fill={getCategoryColor(n.category)} className="animate-pulse" />
               <text y="28" textAnchor="middle" fill="#e2e8f0" className="text-[10px] font-mono font-bold bg-black/50 px-1">{n.label}</text>
               <text y="38" textAnchor="middle" fill={getCategoryColor(n.category)} className="text-[8px] uppercase tracking-wide opacity-70">{n.category}</text>
            </g>
          ))}
       </svg>
    </div>
  );
};

// --- Existing Helper Components ---

const CodeBlock: React.FC<{ content: string; language?: string }> = ({ content, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedContent = useMemo(() => {
    if (!content) return null;
    const lines = content.split('\n');

    // Custom rendering for Nmap-style output
    if (language === 'nmap' || (content.includes('PORT') && content.includes('STATE') && content.includes('SERVICE'))) {
      return lines.map((line, i) => {
        if (line.trim().startsWith('PORT')) {
          return <div key={i} className="text-slate-500 font-bold border-b border-slate-700 inline-block mb-1 w-full">{line}</div>;
        }
        if (/^\d+\/tcp/.test(line.trim())) {
           const parts = line.split(/\s+/);
           // Handle variable spacing in nmap output
           if (parts.length >= 3) {
             return (
               <div key={i} className="grid grid-cols-[80px_80px_1fr] gap-2">
                 <span className="text-emerald-400">{parts[0]}</span>
                 <span className={parts[1] === 'open' ? 'text-green-500 font-bold' : 'text-red-400'}>{parts[1]}</span>
                 <span className="text-amber-300">{parts.slice(2).join(' ')}</span>
               </div>
             );
           }
        }
        return <div key={i} className="text-slate-300">{line}</div>;
      });
    }
    
    // Basic JSON rendering
    if (language === 'json' || (content.trim().startsWith('{') && content.trim().endsWith('}'))) {
      return (
        <pre className="text-amber-100 whitespace-pre-wrap">
          {content}
        </pre>
      );
    }

    return <div className="text-slate-300">{content}</div>;
  }, [content, language]);

  return (
    <div className="relative group my-4 rounded bg-[#0b101b] border border-slate-800 overflow-hidden font-mono text-xs">
      <div className="flex justify-between items-center px-3 py-1.5 bg-slate-900/50 border-b border-slate-800 text-slate-500 select-none">
         <span className="uppercase text-[10px] tracking-wider">{language || 'TEXT'}</span>
         <button onClick={handleCopy} className="hover:text-sky-500 transition-colors" title="Copy to clipboard">
           {copied ? <Check size={12} className="text-emerald-500"/> : <Copy size={12}/>}
         </button>
      </div>
      <div className="p-3 overflow-x-auto">
        {highlightedContent}
      </div>
    </div>
  );
};

const InlineParser: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  // Regex to split by bold (**text**), code (`text`), and links ([text](url))
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded text-xs font-mono mx-0.5 border border-slate-700">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
           const match = part.match(/\[(.*?)\]\((.*?)\)/);
           if (match) {
             return <a key={i} href={match[2]} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline decoration-dotted underline-offset-4">{match[1]}</a>;
           }
        }
        return part;
      })}
    </>
  );
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
   // Split by code blocks: ```language ... ```
   const parts = content.split(/(```[\s\S]*?```)/g);

   return (
     <div className="space-y-1">
       {parts.map((part, index) => {
         if (part.startsWith('```')) {
            const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
            if (match) {
              const language = match[1];
              const code = match[2].trim();

              // Special handling for Tech Stack Graph
              if (language === 'tech_stack_graph') {
                try {
                   const graphData = JSON.parse(code);
                   return <TechStackGraph key={index} data={graphData} />;
                } catch (e) {
                   return <div key={index} className="text-red-500 text-xs">Error parsing graph data</div>;
                }
              }

              return <CodeBlock key={index} language={language} content={code} />;
            }
            return <CodeBlock key={index} content={part.replace(/```/g, '').trim()} />;
         }

         // Process lines for non-code blocks
         return (
           <div key={index}>
             {part.split('\n').map((line, lineIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={lineIdx} className="h-2" />; 
                
                // Headers
                if (line.startsWith('# ')) return <h1 key={lineIdx} className="text-2xl font-bold text-sky-500 mt-6 mb-4 border-b border-slate-800 pb-2 tracking-tight">{line.substring(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={lineIdx} className="text-lg font-bold text-white mt-5 mb-3 flex items-center"><span className="text-sky-500 mr-2">#</span>{line.substring(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={lineIdx} className="text-md font-semibold text-sky-300 mt-4 mb-2">{line.substring(4)}</h3>;

                // Bullet Lists
                if (line.trim().match(/^[-*]\s/)) {
                   return (
                     <div key={lineIdx} className="flex items-start mb-1.5 ml-1 group">
                       <span className="text-slate-700 group-hover:text-sky-500 mr-3 mt-1.5 text-[6px] transition-colors">●</span>
                       <span className="text-slate-300 leading-relaxed"><InlineParser text={line.replace(/^\s*[-*]\s/, '')} /></span>
                     </div>
                   );
                }

                // Numbered Lists
                if (line.trim().match(/^\d+\.\s/)) {
                   return (
                      <div key={lineIdx} className="flex items-start mb-1.5 ml-1">
                         <span className="text-sky-500 font-mono text-xs mr-3 mt-0.5">{line.trim().split('.')[0]}.</span>
                         <span className="text-slate-300 leading-relaxed"><InlineParser text={line.replace(/^\s*\d+\.\s/, '')} /></span>
                      </div>
                   )
                }

                // Key-Value detection (simple heuristic for OSINT reports)
                if (trimmed.match(/^[A-Z][A-Za-z0-9\s\-_]+:/) && trimmed.length < 120 && !trimmed.includes('http')) {
                    const [key, ...rest] = line.split(':');
                    return (
                      <div key={lineIdx} className="mb-1 flex flex-col sm:flex-row sm:items-baseline">
                        <span className="text-slate-500 font-mono text-xs uppercase tracking-wider min-w-[120px]">{key.trim()}:</span>
                        <span className="text-slate-200 flex-1"><InlineParser text={rest.join(':').trim()} /></span>
                      </div>
                    )
                }

                return <div key={lineIdx} className="mb-1 text-slate-300 leading-relaxed"><InlineParser text={line} /></div>;
             })}
           </div>
         );
       })}
     </div>
   );
};

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ output, sources, isTyping, target, toolName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFileName = (ext: string) => {
    const t = target || 'target';
    const tool = toolName || 'tool';
    // Format current date YYYY-MM-DD
    const date = new Date().toISOString().split('T')[0];
    const safeTool = tool.replace(/\s+/g, '_');
    const safeTarget = t.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${safeTarget}_${safeTool}_${date}.${ext}`;
  };

  const handleExportTxt = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName('txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const handleExportPdf = () => {
    if (!output) return;
    try {
        const doc = new jsPDF();
        doc.setFont("courier", "normal");
        doc.setFontSize(10);
        
        // Add header
        doc.setFontSize(14);
        doc.setFont("courier", "bold");
        doc.text(`OSINT Report: ${toolName || 'General'}`, 10, 15);
        
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text(`Target: ${target || 'Unknown'}`, 10, 22);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 27);
        doc.line(10, 30, 200, 30);
        
        // Process Content logic similar to renderer but for PDF text
        // Simple approach: Strip markdown symbols roughly or dump text
        // Note: jsPDF splitTextToSize handles basic wrapping.
        // Ideally we filter out ```blocks``` but raw output is often desired.
        
        const splitText = doc.splitTextToSize(output, 190);
        
        // Chunking to prevent page overflow loop (basic implementation)
        let y = 35;
        const pageHeight = doc.internal.pageSize.height;
        
        for (let i = 0; i < splitText.length; i++) {
            if (y > pageHeight - 10) {
                doc.addPage();
                y = 15;
            }
            doc.text(splitText[i], 10, y);
            y += 5; // line height
        }
        
        doc.save(getFileName('pdf'));
        setShowExport(false);
    } catch (e) {
        console.error("PDF Generation failed", e);
        alert("Failed to generate PDF. Please try exporting as TXT.");
    }
  };

  return (
    <div className={`w-full flex flex-col bg-[#020617] border border-slate-800 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50 shadow-black/90' : 'h-full'}`}>
      {/* Terminal Header */}
      <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <Terminal size={16} className="text-sky-500" />
          <span className="text-xs font-mono text-slate-400 tracking-widest">PROJECT_X_TERMINAL // OUTPUT_STREAM</span>
        </div>
        <div className="flex items-center space-x-4">
          {isTyping && <span className="text-xs text-amber-500 animate-pulse font-mono">RECEIVING_DATA...</span>}
          
          {/* Export Menu */}
          {output && !isTyping && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowExport(!showExport)}
                className="text-slate-500 hover:text-white transition-colors flex items-center space-x-1"
                title="Export Results"
              >
                 <Download size={16} />
              </button>
              
              {showExport && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-slate-900 border border-slate-700 rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <button onClick={handleExportTxt} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-sky-400 flex items-center space-x-2">
                    <FileText size={14} />
                    <span>Export as .TXT</span>
                  </button>
                  <button onClick={handleExportPdf} className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-sky-400 flex items-center space-x-2 border-t border-slate-800">
                    <FileIcon size={14} />
                    <span>Export as .PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-slate-500 hover:text-white transition-colors"
            title={isExpanded ? "Minimize Console" : "Maximize Console"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-6 overflow-auto font-mono text-sm text-slate-300 relative scroll-smooth bg-[#020617]">
        {/* CRT Scanline Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_3px,3px_100%] opacity-40 mix-blend-overlay"></div>
        
        {output ? (
          <div className="relative z-0 pb-10 animate-in fade-in duration-500">
            <MarkdownRenderer content={output} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
            <Terminal size={48} className="mb-4 animate-pulse" />
            <p className="text-xs font-mono tracking-widest uppercase">Awaiting Neural Link...</p>
          </div>
        )}

        {isTyping && (
           <div className="inline-block w-2.5 h-5 bg-sky-500 ml-1 animate-pulse align-middle shadow-[0_0_10px_#0ea5e9]"></div>
        )}
      </div>

      {/* Sources Footer */}
      {sources && sources.length > 0 && (
        <div className="bg-[#020617] p-3 border-t border-slate-800 text-xs shrink-0 z-20">
          <div className="text-slate-500 mb-2 font-bold uppercase tracking-wider flex items-center">
            <ExternalLink size={12} className="mr-2" />
            Intel Sources ({sources.length})
          </div>
          <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
            {sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500 text-slate-400 hover:text-sky-500 px-3 py-1.5 rounded transition-all duration-200 group"
              >
                <span className="truncate max-w-[200px] font-mono">{source.title}</span>
                <ExternalLink size={10} className="opacity-50 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};