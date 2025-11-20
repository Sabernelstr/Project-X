import { ToolType, ToolDefinition } from './types';

export const TOOLS: ToolDefinition[] = [
  {
    id: ToolType.GENERAL_RECON,
    name: 'General Recon',
    description: 'Aggregates public data, business details, and online footprint.',
    icon: 'Globe',
    category: 'Passive'
  },
  {
    id: ToolType.WHOIS_INTEL,
    name: 'Whois Intel',
    description: 'Retrieves domain registration details, registrar info, and contact data.',
    icon: 'FileText',
    category: 'Passive'
  },
  {
    id: ToolType.NMAP_ADVISOR,
    name: 'Port Intel Advisor',
    description: 'Analyzes target for likely open services and generates Nmap strategies.',
    icon: 'Activity',
    category: 'Network'
  },
  {
    id: ToolType.TECH_STACK,
    name: 'Stack Analyzer',
    description: 'Identifies frameworks, CMS, hosting providers, and libraries used.',
    icon: 'Layers',
    category: 'Analysis'
  },
  {
    id: ToolType.THREAT_INTEL,
    name: 'Threat Landscape',
    description: 'Searches for associated CVEs, breaches, and reputation scores.',
    icon: 'ShieldAlert',
    category: 'Analysis'
  },
  {
    id: ToolType.SUBDOMAIN_FINDER,
    name: 'Subdomain Scout',
    description: 'Uses search operators to find indexed subdomains and hidden pages.',
    icon: 'Search',
    category: 'Passive'
  }
];

export const SYSTEM_INSTRUCTION = `You are Project X, an elite automated OSINT (Open Source Intelligence) analyst. 
Your goal is to provide detailed, accurate, and actionable intelligence on provided targets (domains, IPs, or organizations).
You MUST use the Google Search tool to gather real-time information. Do not hallucinate. If information is not found, state it clearly.
Format your response in clean Markdown. Use headers, bullet points, and code blocks for readability.
Maintain a professional, cybersecurity-focused tone.`;

export const getPromptForTool = (tool: ToolType, target: string): string => {
  switch (tool) {
    case ToolType.NMAP_ADVISOR:
      return `Perform a passive port and service analysis for the target: "${target}". 
      1. Search for public documentation, job listings, or technical reports that indicate what technologies and ports might be exposed (e.g., ssh, http, database ports).
      2. Provide a list of likely open ports and services based on standard configurations for the discovered tech stack.
      3. Generate 3 specific Nmap commands ranging from "Stealth" to "Aggressive" that a security researcher could use to audit this target. Explain the flags used.`;
    
    case ToolType.GENERAL_RECON:
      return `Conduct a comprehensive general reconnaissance on: "${target}".
      1. Identify the organization's industry, headquarters, and key personnel if public.
      2. Summarize their digital footprint (social media presence, public code repositories).
      3. Identify key partners or subsidiary domains found in search results.`;

    case ToolType.WHOIS_INTEL:
      return `Perform a detailed Whois analysis for the domain: "${target}".
      1. Identify the Registrar and the creation/expiration dates.
      2. Look for any public registrant information (Organization, Name, Country).
      3. Identify the Name Servers and check if they reveal the hosting provider.
      4. Check for any history of ownership changes if available in search results.`;

    case ToolType.TECH_STACK:
      return `Analyze the technical stack of: "${target}".
      1. Identify the likely frontend frameworks (React, Vue, Angular, etc.).
      2. Identify backend technologies (Node.js, Python, PHP, etc.) and web servers (Nginx, Apache).
      3. Identify cloud providers (AWS, GCP, Azure) or CDN services (Cloudflare) used.
      4. Look for "built with" evidence in job postings or tech blogs.`;

    case ToolType.THREAT_INTEL:
      return `Perform a preliminary threat intelligence assessment for: "${target}".
      1. Check for any publicly reported data breaches, defacements, or security incidents associated with this domain.
      2. List any recent CVEs associated with the technologies they are known to use (e.g., if they use WordPress, list recent critical WP vulnerabilities).
      3. Provide a "Reputation Score" estimation (Low/Medium/High Risk) based on search sentiment and security reports.`;
      
    case ToolType.SUBDOMAIN_FINDER:
      return `Perform a passive subdomain enumeration for: "${target}" using search operators.
      1. List discovered subdomains (e.g., api., dev., mail.).
      2. Identify any interesting public directories or login portals indexed by search engines.
      3. Categorize the findings by likely function (e.g., "Mail Server", "Development", "Admin Panel").`;

    default:
      return `Analyze ${target}`;
  }
};