import React from 'react';
import { 
  RadialBarChart, 
  RadialBar, 
  Legend, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface ThreatGaugeProps {
  score: number; // 0-100
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({ score }) => {
  const data = [
    {
      name: 'Threat Level',
      uv: score,
      fill: score > 75 ? '#ef4444' : score > 40 ? '#f59e0b' : '#10b981',
    },
    {
      name: 'Max',
      uv: 100,
      fill: '#1e293b', // background track
    }
  ];

  return (
    <div className="w-full h-64 bg-cyber-900 border border-cyber-700 rounded-lg p-4 flex flex-col items-center justify-center relative">
      <h4 className="absolute top-4 left-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Threat Gauge</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" barSize={10} data={data} startAngle={180} endAngle={0}>
          <RadialBar
            background
            dataKey="uv"
            cornerRadius={30} 
            label={false}
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-2xl font-bold font-mono">
            {score}/100
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Mock data component for visual flair in MVP
export const NetworkActivityChart: React.FC = () => {
  const data = Array.from({ length: 10 }, (_, i) => ({
    name: `T-${i}`,
    packets: Math.floor(Math.random() * 1000) + 500,
    alerts: Math.floor(Math.random() * 100)
  }));

  return (
    <div className="w-full h-64 bg-cyber-900 border border-cyber-700 rounded-lg p-4 mt-4">
      <h4 className="mb-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Live Traffic (Simulated)</h4>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ color: '#0ea5e9' }}
            cursor={{fill: '#1e293b', opacity: 0.4}}
          />
          <Bar dataKey="packets" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="alerts" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};