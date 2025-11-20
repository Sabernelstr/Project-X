import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Terminal, ExternalLink, Copy, Check, Maximize2, Minimize2, Download, FileText, File as FileIcon, ChevronRight } from 'lucide-react';
import { jsPDF } from "jspdf";

interface ConsoleOutputProps {
  output: string;
  sources?: { title: string; uri: string }[];
  isTyping?: boolean;
  target?: string;
  toolName?: string;
}

// --- Graph Visualization Components (Unchanged Logic, Updated Styling) ---

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

  useEffect(() => {
    if (!data.nodes.length) return;

    const width = containerRef.current?.clientWidth || 600;
    const height = 300;
    
    const initialNodes = data.nodes.map((n) => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }));

    setNodes(initialNodes);

    const nodeMap = new Map(initialNodes.map(n => [n.id, n]));
    const initialEdges = data.edges
      .map(e => ({ source: nodeMap.get(e.from), target: nodeMap.get(e.to) }))
      .filter(e => e.source && e.target) as { source: GraphNode; target: GraphNode }[];
      
    setEdges(initialEdges);

  }, [data]);

  useEffect(() => {
    if (nodes.length === 0) return;
    let animationFrameId: number;
    const width = containerRef.current?.clientWidth || 600;
    const height = 300;
    const tick = () => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(n => ({ ...n }));
        const k = 0.05;
        const springLength = 80;
        const springStrength = 0.05;
        const centerStrength = 0.01;
        
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
        newNodes.forEach(node => {
           const dx = (width / 2) - node.x;
           const dy = (height / 2) - node.y;
           node.vx += dx * centerStrength;
           node.vy += dy * centerStrength;
           node.vx *= 0.85;
           node.vy *= 0.85;
           node.x += node.vx;
           node.y += node.vy;
           node.x = Math.max(20, Math.min(width - 20, node.x));
           node.y = Math.max(20, Math.min(height - 20, node.y));
        });
        return newNodes;
      });
      animationFrameId = requestAnimationFrame(tick);
    };
    const timeoutId = setTimeout(() => cancelAnimationFrame(animationFrameId), 5000);
    tick();
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [edges]);

  const getCategoryColor = (cat: string) => {
    // Amber monochrome scale
    const map: Record<string, string> = {
      'Frontend': '#f59e0b', // Amber 500
      'Backend': '#d97706', // Amber 600
      'Database': '#b45309', // Amber 700
      'Infrastructure': '#78350f', // Amber 900
      'Utility': '#52525b', // Zinc 600
    };
    return map[cat] || '#52525b';
  };

  return (
    <div ref={containerRef} className="w-full bg-black border rounded-sm my-4 relative overflow-hidden group" style={{ height: '320px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
       <div className="absolute top-2 left-3 font-mono text-secondary uppercase tracking-wider z-10 px-2 rounded" style={{ fontSize: '10px', backgroundColor: 'rgba(0,0,0,0.5)' }}>Topology Map</div>
       <svg width="100%" height="100%" className="relative z-0" style={{ pointerEvents: 'none' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="18" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3f3f46" />
            </marker>
          </defs>
          {edges.map((e, i) => {
             const s = nodes.find(n => n.id === e.source.id);
             const t = nodes.find(n => n.id === e.target.id);
             if (!s || !t) return null;
             return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#27272a" strokeWidth="1" markerEnd="url(#arrowhead)" />;
          })}
          {nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}>
               <circle r="10" fill="#09090b" stroke={getCategoryColor(n.category)} strokeWidth="2" />
               <text y="24" textAnchor="middle" fill="#a1a1aa" className="font-mono uppercase tracking-tight px-1" style={{ fontSize: '9px', backgroundColor: 'rgba(0,0,0,0.7)' }}>{n.label}</text>
            </g>
          ))}
       </svg>
    </div>
  );
};

// --- Helper Components ---

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
    if (language === 'nmap' || (content.includes('PORT') && content.includes('STATE') && content.includes('SERVICE'))) {
      return lines.map((line, i) => {
        if (line.trim().startsWith('PORT')) {
          return <div key={i} className="text-accent font-bold border-b inline-block mb-1 w-full" style={{ borderColor: '#27272a' }}>{line}</div>;
        }
        if (/^\d+\/tcp/.test(line.trim())) {
           const parts = line.split(/\s+/);
           if (parts.length >= 3) {
             return (
               <div key={i} className="grid gap-2 border-b py-0.5 hover-bg-surface" style={{ gridTemplateColumns: '80px 80px 1fr', borderColor: 'rgba(39, 39, 42, 0.5)' }}>
                 <span className="font-bold" style={{ color: '#fbbf24' }}>{parts[0]}</span>
                 <span className={`font-bold uppercase ${parts[1] === 'open' ? 'text-emerald' : 'text-red'}`}>{parts[1]}</span>
                 <span className="text-secondary" style={{ opacity: 0.8 }}>{parts.slice(2).join(' ')}</span>
               </div>
             );
           }
        }
        return <div key={i} className="text-secondary">{line}</div>;
      });
    }
    if (language === 'json' || (content.trim().startsWith('{') && content.trim().endsWith('}'))) {
      return <pre className="whitespace-pre-wrap text-xs" style={{ color: '#fef3c7' }}>{content}</pre>;
    }
    return <div style={{ color: '#d4d4d8' }}>{content}</div>;
  }, [content, language]);

  return (
    <div className="relative group my-4 rounded-sm bg-black border font-mono text-xs overflow-hidden">
      <div className="flex justify-between items-center px-3 py-2 border-b text-secondary" style={{ backgroundColor: 'rgba(24, 24, 27, 0.5)', userSelect: 'none' }}>
         <span className="uppercase tracking-wider font-bold text-accent" style={{ fontSize: '10px' }}>{language || 'RAW_DATA'}</span>
         <button onClick={handleCopy} className="hover-text-accent transition-colors">
           {copied ? <Check size={12} className="text-emerald"/> : <Copy size={12}/>}
         </button>
      </div>
      <div className="p-4 overflow-x-auto">{highlightedContent}</div>
    </div>
  );
};

const InlineParser: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="text-accent px-1.5 py-0.5 rounded-sm text-xs font-mono mx-0.5 border" style={{ backgroundColor: '#18181b' }}>{part.slice(1, -1)}</code>;
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
           const match = part.match(/\[(.*?)\]\((.*?)\)/);
           if (match) return <a key={i} href={match[2]} target="_blank" rel="noreferrer" className="text-accent hover-text-white underline decoration-dotted underline-offset-4">{match[1]}</a>;
        }
        return part;
      })}
    </>
  );
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
   const parts = content.split(/(```[\s\S]*?```)/g);
   return (
     <div className="space-y-1">
       {parts.map((part, index) => {
         if (part.startsWith('```')) {
            const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
            if (match) {
              const language = match[1];
              const code = match[2].trim();
              if (language === 'tech_stack_graph') {
                try {
                   const graphData = JSON.parse(code);
                   return <TechStackGraph key={index} data={graphData} />;
                } catch (e) { return null; }
              }
              return <CodeBlock key={index} language={language} content={code} />;
            }
            return <CodeBlock key={index} content={part.replace(/```/g, '').trim()} />;
         }
         return (
           <div key={index}>
             {part.split('\n').map((line, lineIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={lineIdx} style={{ height: '0.5rem' }} />; 
                if (line.startsWith('# ')) return <h1 key={lineIdx} className="text-lg font-bold text-white mt-6 mb-4 border-b pb-2 font-mono uppercase tracking-tight">{line.substring(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={lineIdx} className="text-sm font-bold text-accent mt-4 mb-3 flex items-center uppercase tracking-wider"><ChevronRight size={14} className="mr-1"/>{line.substring(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={lineIdx} className="text-xs font-bold text-secondary mt-4 mb-2 uppercase" style={{ color: '#d4d4d8' }}>{line.substring(4)}</h3>;
                if (line.trim().match(/^[-*]\s/)) {
                   return <div key={lineIdx} className="flex items-start mb-2 ml-1 group"><span className="mr-3 mt-1.5 text-accent opacity-50 group-hover-opacity-100" style={{ fontSize: '6px' }}>●</span><span className="text-secondary text-sm" style={{ lineHeight: '1.6' }}><InlineParser text={line.replace(/^\s*[-*]\s/, '')} /></span></div>;
                }
                if (line.trim().match(/^\d+\.\s/)) {
                   return <div key={lineIdx} className="flex items-start mb-2 ml-1"><span className="text-accent font-mono text-xs mr-3 mt-0.5">{line.trim().split('.')[0]}.</span><span className="text-secondary text-sm" style={{ lineHeight: '1.6' }}><InlineParser text={line.replace(/^\s*\d+\.\s/, '')} /></span></div>
                }
                if (trimmed.match(/^[A-Z][A-Za-z0-9\s\-_]+:/) && trimmed.length < 120 && !trimmed.includes('http')) {
                    const [key, ...rest] = line.split(':');
                    return <div key={lineIdx} className="mb-1 flex flex-col md-flex-row md-items-center"><span className="text-secondary font-mono uppercase tracking-widest" style={{ fontSize: '10px', minWidth: '140px' }}>{key.trim()}:</span><span className="text-secondary grow text-sm" style={{ color: '#d4d4d8' }}><InlineParser text={rest.join(':').trim()} /></span></div>
                }
                return <div key={lineIdx} className="mb-1 text-secondary text-sm" style={{ lineHeight: '1.6' }}><InlineParser text={line} /></div>;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isTyping) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, isTyping]);

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
        doc.text(`OSINT Report: ${toolName || 'General'}`, 10, 15);
        doc.text(`Target: ${target || 'Unknown'}`, 10, 22);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 27);
        doc.line(10, 30, 200, 30);
        const splitText = doc.splitTextToSize(output, 190);
        let y = 35;
        const pageHeight = doc.internal.pageSize.height;
        for (let i = 0; i < splitText.length; i++) {
            if (y > pageHeight - 10) {
                doc.addPage();
                y = 15;
            }
            doc.text(splitText[i], 10, y);
            y += 5; 
        }
        doc.save(getFileName('pdf'));
        setShowExport(false);
    } catch (e) {
        alert("Failed to generate PDF. Please try exporting as TXT.");
    }
  };

  return (
    <div className={`w-full flex flex-col h-full bg-black transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50 shadow-2xl border rounded-lg' : ''}`}>
      {/* Terminal Header */}
      <div className="px-4 py-2 flex items-center justify-between border-b shrink-0" style={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', userSelect: 'none' }}>
        <div className="flex items-center space-x-3">
          <Terminal size={14} className="text-accent" />
          <span className="font-bold font-mono text-secondary tracking-widest uppercase" style={{ fontSize: '10px' }}>/var/log/console_out</span>
        </div>
        <div className="flex items-center space-x-4">
          {isTyping && <span className="text-accent font-mono animate-pulse" style={{ fontSize: '10px' }}>RECEIVING_STREAM...</span>}
          {output && !isTyping && (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setShowExport(!showExport)} className="text-secondary hover-text-white transition-colors flex items-center space-x-1" title="Export Results">
                 <Download size={14} />
                 <span className="font-bold uppercase" style={{ fontSize: '10px' }}>Export</span>
              </button>
              {showExport && (
                <div className="absolute mt-2 w-40 bg-surface border rounded-sm shadow-2xl z-50 overflow-hidden" style={{ right: 0, top: '100%' }}>
                  <button onClick={handleExportTxt} className="w-full text-left px-3 py-2 text-xs text-secondary hover-bg-black hover-text-accent flex items-center space-x-2">
                    <FileText size={12} /><span>RAW .TXT</span>
                  </button>
                  <button onClick={handleExportPdf} className="w-full text-left px-3 py-2 text-xs text-secondary hover-bg-black hover-text-accent flex items-center space-x-2 border-t">
                    <FileIcon size={12} /><span>REPORT .PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-secondary hover-text-white transition-colors">
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-auto font-mono text-sm relative bg-black" style={{ scrollBehavior: 'smooth', color: '#d4d4d8' }}>
        {output ? (
          <div className="relative z-0 pb-8 animate-in fade-in duration-300">
            <MarkdownRenderer content={output} />
            {isTyping && (
               <div className="mt-2 w-2 h-4 bg-accent animate-pulse inline-block"></div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-secondary">
            <Terminal size={48} className="mb-4 opacity-20" strokeWidth={1} />
            <p className="text-xs font-mono tracking-widest uppercase opacity-40" style={{ letterSpacing: '0.2em' }}>Awaiting Input Signal</p>
          </div>
        )}
      </div>

      {/* Sources Footer */}
      {sources && sources.length > 0 && (
        <div className="p-3 border-t text-xs shrink-0 z-20" style={{ backgroundColor: 'rgba(24, 24, 27, 0.5)' }}>
          <div className="flex flex-wrap gap-2">
            <span className="text-secondary font-bold uppercase tracking-wider flex items-center mr-2" style={{ fontSize: '10px', alignSelf: 'center' }}>Intel Sources:</span>
            {sources.map((source, idx) => (
              <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 bg-black hover-bg-surface border hover-border-accent text-secondary hover-text-accent px-2 py-1 rounded-sm transition-all duration-200" style={{ maxWidth: '200px' }}>
                <span className="truncate font-mono" style={{ fontSize: '10px' }}>{source.title}</span>
                <ExternalLink size={8} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};