
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Trade } from '../types';

interface PerformanceAuditProps {
  trades: Trade[];
}

const PerformanceAudit: React.FC<PerformanceAuditProps> = ({ trades }) => {
  const [viewMode, setViewMode] = useState<'PERIODIC' | 'GROWTH'>('PERIODIC');
  
  const monthlyStats = useMemo(() => {
    const months: Record<string, { pnl: number; count: number; wins: number; volume: number; name: string; timestamp: number }> = {};
    
    trades.forEach(t => {
      const date = new Date(t.entryDate);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const name = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
      
      if (!months[key]) {
        months[key] = { pnl: 0, count: 0, wins: 0, volume: 0, name, timestamp: date.getTime() };
      }
      
      months[key].pnl += Number(t.pnl) || 0;
      months[key].count++;
      months[key].volume += Number(t.quantity) || 0;
      if ((Number(t.pnl) || 0) > 0) months[key].wins++;
    });

    return Object.entries(months)
      .map(([key, data]) => ({
        key,
        ...data,
        winRate: (data.wins / data.count) * 100,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [trades]);

  const growthData = useMemo(() => {
    const sortedTrades = [...trades].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    let cumulativePnl = 0;
    
    return sortedTrades.map((t, idx) => {
      cumulativePnl += Number(t.pnl) || 0;
      return {
        index: idx + 1,
        date: new Date(t.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        equity: cumulativePnl,
        tradePnl: t.pnl,
        symbol: t.symbol
      };
    });
  }, [trades]);

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Performance <span className="text-blue-500">Audit</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">Institutional Grade Execution History</p>
        </div>
        <div className="flex bg-[#12151a] p-1.5 rounded-2xl border border-white/5">
           <button 
            onClick={() => setViewMode('PERIODIC')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'PERIODIC' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-gray-500 hover:text-gray-300'}`}
           >
             Periodic View
           </button>
           <button 
            onClick={() => setViewMode('GROWTH')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'GROWTH' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-gray-500 hover:text-gray-300'}`}
           >
             Growth Curve
           </button>
        </div>
      </header>

      <section className="bg-[#12151a] p-12 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <i className={`fa-solid ${viewMode === 'PERIODIC' ? 'fa-calendar-check' : 'fa-chart-line'} text-[10rem] text-white`}></i>
        </div>
        
        <div className="mb-12">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">
            {viewMode === 'PERIODIC' ? 'Monthly' : 'Equity'} <span className="text-blue-500">Trajectory</span>
          </h3>
          <p className="text-[10px] font-black text-gray-600 mt-2 uppercase tracking-widest">
            {viewMode === 'PERIODIC' ? 'Aggregate P&L and Win-Rate Correlation' : 'Cumulative Realized Profit Progression'}
          </p>
        </div>

        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'PERIODIC' ? (
              <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#0f1216', border: '1px solid #1f2937', borderRadius: '24px', fontSize: '10px' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="pnl" radius={[12, 12, 0, 0]}>
                  {monthlyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1216', border: '1px solid #1f2937', borderRadius: '24px', fontSize: '10px' }}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Total Profit']}
                />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorEquity)" 
                  animationDuration={1500}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {viewMode === 'GROWTH' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slideInUp">
           <div className="bg-[#12151a] p-10 rounded-[3rem] border border-white/5 shadow-xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Compounded Edge</p>
              <h4 className="text-3xl font-black text-white">+{(growthData[growthData.length-1]?.equity / (Math.abs(growthData[0]?.equity) || 1) * 100).toFixed(1)}%</h4>
           </div>
           <div className="bg-[#12151a] p-10 rounded-[3rem] border border-white/5 shadow-xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Max Run-up</p>
              <h4 className="text-3xl font-black text-emerald-400">${Math.max(...growthData.map(d => d.equity)).toLocaleString()}</h4>
           </div>
           <div className="bg-[#12151a] p-10 rounded-[3rem] border border-white/5 shadow-xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Current Drawdown</p>
              <h4 className="text-3xl font-black text-rose-400">0.0%</h4>
           </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAudit;
