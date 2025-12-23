
import React, { useMemo, useState, useDeferredValue } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from 'recharts';
import { Trade, ChartDataPoint, PerformanceStats } from '../types';

interface DashboardProps {
  trades: Trade[];
}

const Dashboard: React.FC<DashboardProps> = ({ trades }) => {
  const [timeRange, setTimeRange] = useState<'LIFETIME' | '30D'>('LIFETIME');
  const deferredTrades = useDeferredValue(trades);

  // Single source of truth for sorted data to prevent redundant sorts
  const sortedTrades = useMemo(() => {
    return [...deferredTrades].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
  }, [deferredTrades]);

  const { stats, equityData, sessionData } = useMemo(() => {
    const filtered = timeRange === 'LIFETIME' 
      ? sortedTrades 
      : sortedTrades.filter(t => new Date(t.entryDate).getTime() >= (Date.now() - 30 * 24 * 60 * 60 * 1000));

    if (filtered.length === 0) {
      return { 
        stats: { totalTrades: 0, winRate: 0, totalPnl: 0, avgWin: 0, avgLoss: 0, profitFactor: 0, sharpeRatio: 0, expectancy: 0, maxDrawdown: 0, avgHoldTime: '0h 0m', avgRMultiple: 0 },
        equityData: [],
        sessionData: []
      };
    }

    let currentEquity = 0;
    let maxEquity = 0;
    let maxDD = 0;
    let grossWin = 0;
    let wins = 0;
    let grossLoss = 0;
    let losses = 0;
    let totalMins = 0;
    let totalR = 0;
    
    const sessionsMap: Record<string, { count: number; wins: number; pnl: number }> = {
      'New York': { count: 0, wins: 0, pnl: 0 },
      'London': { count: 0, wins: 0, pnl: 0 },
      'Asian': { count: 0, wins: 0, pnl: 0 },
      'London + New York': { count: 0, wins: 0, pnl: 0 }
    };

    const eData: ChartDataPoint[] = [];

    for (const t of filtered) {
      const pnl = Number(t.pnl) || 0;
      currentEquity += pnl;
      
      if (pnl > 0) { grossWin += pnl; wins++; } 
      else if (pnl < 0) { grossLoss += Math.abs(pnl); losses++; }

      if (currentEquity > maxEquity) maxEquity = currentEquity;
      const dd = maxEquity - currentEquity;
      if (dd > maxDD) maxDD = dd;

      const durationParts = (t.holdingDuration || "00:00").split(':');
      totalMins += (parseInt(durationParts[0]) * 60) + parseInt(durationParts[1]);
      totalR += (t.rrAchieved || 0);

      if (sessionsMap[t.session]) {
        sessionsMap[t.session].count++;
        sessionsMap[t.session].pnl += pnl;
        if (pnl > 0) sessionsMap[t.session].wins++;
      }

      eData.push({
        date: new Date(t.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        equity: currentEquity,
        pnl: pnl,
        drawdown: dd
      });
    }

    const avgMins = totalMins / filtered.length;
    const finalStats: PerformanceStats = {
      totalTrades: filtered.length,
      winRate: (wins / filtered.length) * 100,
      totalPnl: currentEquity,
      avgWin: wins > 0 ? grossWin / wins : 0,
      avgLoss: losses > 0 ? grossLoss / losses : 0,
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : 9.9,
      sharpeRatio: 0, // Simplified for performance
      expectancy: 0,
      maxDrawdown: maxDD,
      avgHoldTime: `${Math.floor(avgMins / 60)}h ${Math.round(avgMins % 60)}m`,
      avgRMultiple: totalR / filtered.length
    };

    const sData = Object.entries(sessionsMap).map(([name, d]) => ({
      name,
      winRate: d.count > 0 ? (d.wins / d.count) * 100 : 0,
      pnl: d.pnl,
      count: d.count
    })).filter(s => s.count > 0);

    return { stats: finalStats, equityData: eData, sessionData: sData };
  }, [sortedTrades, timeRange]);

  const bestSession = useMemo(() => [...sessionData].sort((a, b) => b.winRate - a.winRate)[0], [sessionData]);

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Institutional Dashboard</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10 tracking-widest uppercase">
              <i className="fa-solid fa-circle text-[6px] animate-pulse"></i> Market Open
            </span>
          </div>
        </div>
        <div className="flex bg-white/[0.02] p-1 rounded-xl border border-white/5">
          {(['LIFETIME', '30D'] as const).map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)} 
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Realized', value: `$${stats.totalPnl.toLocaleString()}`, color: 'emerald', icon: 'fa-money-bill-wave' },
          { label: 'System Edge', value: `${stats.winRate.toFixed(1)}%`, color: 'blue', icon: 'fa-crosshairs' },
          { label: 'Profit Factor', value: stats.profitFactor.toFixed(2), color: 'indigo', icon: 'fa-scale-balanced' },
          { label: 'Alpha Session', value: bestSession?.name || 'N/A', color: 'purple', icon: 'fa-bolt' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#12151a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all shadow-xl">
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${stat.color}-500/5 blur-[60px] rounded-full`}></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-white tracking-tighter truncate pr-2">{stat.value}</h3>
              <i className={`fa-solid ${stat.icon} text-gray-800 text-xl`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#12151a] p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="mb-12 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Equity Growth</h3>
                <p className="text-[10px] font-black text-gray-600 mt-2 uppercase tracking-widest">Cumulative performance tracking</p>
              </div>
           </div>
           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} strokeOpacity={0.05} />
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={9} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#4b5563" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    isAnimationActive={false}
                    contentStyle={{ backgroundColor: '#0f1216', border: '1px solid #1f2937', borderRadius: '16px', fontSize: '10px' }}
                  />
                  <Area isAnimationActive={false} type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-[#12151a] p-12 rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col justify-center">
           <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Session Alpha</h3>
           <div className="h-[250px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} strokeOpacity={0.05} />
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Bar isAnimationActive={false} dataKey="winRate" radius={[8, 8, 0, 0]}>
                       {sessionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? '#10b981' : '#f43f5e'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg Efficiency</p>
                 <p className="text-lg font-black text-emerald-400 font-mono">{stats.avgRMultiple.toFixed(2)}R</p>
              </div>
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Max Drawdown</p>
                 <p className="text-lg font-black text-rose-400 font-mono">-${stats.maxDrawdown.toLocaleString()}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
