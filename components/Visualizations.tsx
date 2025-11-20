import React from 'react';
import { 
  RadialBarChart, 
  RadialBar, 
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
      fill: score > 75 ? '#b91c1c' : score > 40 ? '#f59e0b' : '#0f766e', // Red, Amber, Teal (darker)
    },
    {
      name: 'Max',
      uv: 100,
      fill: 'var(--surface-hover)',
    }
  ];

  return (
    <div className="w-full bg-surface p-4 flex flex-col items-center justify-center relative" style={{ height: '16rem' }}>
      <h4 className="absolute top-0 left-0 m-4 text-secondary font-bold font-mono uppercase tracking-widest" style={{ fontSize: '10px' }}>Threat Probability</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" barSize={8} data={data} startAngle={180} endAngle={0}>
          <RadialBar
            background
            dataKey="uv"
            cornerRadius={0}
          />
          <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-primary text-3xl font-bold font-mono tracking-tight">
            {score}%
          </text>
          <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-secondary font-bold uppercase tracking-widest" style={{ fontSize: '10px' }}>
            Risk Factor
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const NetworkActivityChart: React.FC = () => {
  const data = Array.from({ length: 12 }, (_, i) => ({
    name: `T${i}`,
    traffic: Math.floor(Math.random() * 800) + 200,
    anomalies: Math.floor(Math.random() * 100)
  }));

  return (
    <div className="w-full bg-surface p-4 mt-4" style={{ height: '16rem' }}>
      <h4 className="mb-4 text-secondary font-bold font-mono uppercase tracking-widest" style={{ fontSize: '10px' }}>Network Traffic [Real-time]</h4>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="1 1" vertical={false} stroke="var(--border)" opacity={0.3} />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontSize: '12px', borderRadius: '2px' }}
            itemStyle={{ color: 'var(--accent)' }}
            cursor={{fill: 'var(--surface-hover)', opacity: 0.5}}
          />
          <Bar dataKey="traffic" fill="var(--accent)" opacity={0.8} radius={[1, 1, 0, 0]} />
          <Bar dataKey="anomalies" fill="var(--error)" radius={[1, 1, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};