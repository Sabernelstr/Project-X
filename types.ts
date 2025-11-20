export enum ToolType {
  NMAP_ADVISOR = 'NMAP_ADVISOR',
  GENERAL_RECON = 'GENERAL_RECON',
  TECH_STACK = 'TECH_STACK',
  WHOIS_INTEL = 'WHOIS_INTEL',
  SUBDOMAIN_FINDER = 'SUBDOMAIN_FINDER',
  THREAT_INTEL = 'THREAT_INTEL'
}

export interface ToolDefinition {
  id: ToolType;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'Network' | 'Passive' | 'Active' | 'Analysis';
}

export interface ScanResult {
  id: string;
  tool: ToolType;
  target: string;
  timestamp: number;
  rawOutput: string;
  structuredData?: any;
  sources?: { title: string; uri: string }[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fullMark?: number;
}