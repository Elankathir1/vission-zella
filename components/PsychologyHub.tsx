
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Trade } from '../types';

interface PsychologyHubProps {
  trades: Trade[];
}

const PsychologyHub: React.FC<PsychologyHubProps> = ({ trades }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

  const mindsetMatrixData = useMemo(() => {
    const stats: Record<string, { count: number; pnl: number; winRate: number; wins: number }> = {};
    
    trades.forEach(t => {
      const state = t.mentalState || 'Unknown';
      const pnl = Number(t.pnl) || 0;
      
      if (!stats[state]) {
        stats[state] = { count: 0, pnl: 0, winRate: 0, wins: 0 };
      }
      stats[state].count++;
      stats[state].pnl += pnl;
      if (pnl > 0) stats[state].wins++;
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      winRate: (data.wins / data.count) * 100
    })).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const lossTriggerAudit = useMemo(() => {
    const triggerStats: Record<string, { count: number; loss: number; avgLoss: number; maxLoss: number }> = {};
    
    trades.filter(t => (Number(t.pnl) || 0) < 0).forEach(t => {
      const state = t.mentalState || 'Unknown';
      if (!triggerStats[state]) {
        triggerStats[state] = { count: 0, loss: 0, avgLoss: 0, maxLoss: 0 };
      }
      triggerStats[state].count++;
      const absPnl = Math.abs(Number(t.pnl) || 0);
      triggerStats[state].loss += absPnl;
      if (absPnl > triggerStats[state].maxLoss) triggerStats[state].maxLoss = absPnl;
    });

    return Object.entries(triggerStats)
      .map(([name, data]) => ({
        name,
        ...data,
        avgLoss: data.loss / data.count
      }))
      .sort((a, b) => b.loss - a.loss);
  }, [trades]);

  const disciplineMetrics = useMemo(() => {
    const planned = trades.filter(t => t.isPlanned);
    const impulsive = trades.filter(t => !t.isPlanned);
    
    const plannedPnl = planned.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);
    const impulsivePnl = impulsive.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);
    
    const plannedWr = planned.length ? (planned.filter(t => (Number(t.pnl) || 0) > 0).length / planned.length) * 100 : 0;
    const impulsiveWr = impulsive.length ? (impulsive.filter(t => (Number(t.pnl) || 0) > 0).length / impulsive.length) * 100 : 0;

    const totalDiscipline = trades.reduce((acc, t) => acc + (Number(t.disciplineRating) || 0), 0);
    const totalStress = trades.reduce((acc, t) => acc + (Number(t.stressLevel) || 0), 0);
    const count = trades.length || 1;

    return {
      plannedCount: planned.length,
      impulsiveCount: impulsive.length,
      plannedPnl,
      impulsivePnl,
      plannedWr,
      impulsiveWr,
      avgDiscipline: totalDiscipline / count,
      avgStress: totalStress / count
    };
  }, [trades]);

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Psychology <span className="text-blue-500">Hub</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">Institutional Mindset Auditing & Emotional Variance</p>
        </div>
        <div className="flex items-center gap-4 bg-[#12151a] p-3 rounded-3xl border border-white/5 shadow-2xl">
           <div className="px-6 text-center border-r border-white/10">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Global Discipline</p>
              <p className="text-2xl font-black text-emerald-400">
                {isNaN(disciplineMetrics.avgDiscipline) ? '0.0' : disciplineMetrics.avgDiscipline.toFixed(1)}
              </p>
           </div>
           <div className="px-6 text-center">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Global Stress</p>
              <p className="text-2xl font-black text-rose-400">
                {isNaN(disciplineMetrics.avgStress) ? '0.0' : disciplineMetrics.avgStress.toFixed(1)}
              </p>
           </div>
        </div>
      </header>

      {/* Dominant Mindset Matrix */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Dominant Mindset <span className="text-blue-500">Matrix</span></h2>
           <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Performance by Psychological State</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {mindsetMatrixData.map((mindset, idx) => (
             <div key={mindset.name} className="bg-[#12151a] p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <i className={`fa-solid ${mindset.pnl >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-5xl text-white`}></i>
                </div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">{mindset.name}</h3>
                </div>
                <div className="space-y-4 relative z-10">
                   <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Total P&L</p>
                      <p className={`text-2xl font-black ${mindset.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {mindset.pnl >= 0 ? '+' : ''}${mindset.pnl.toLocaleString()}
                      </p>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div>
                         <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Win Rate</p>
                         <p className="text-xs font-black text-white">{mindset.winRate.toFixed(1)}%</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Executions</p>
                         <p className="text-xs font-black text-white">{mindset.count}</p>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Discipline Efficiency Chart */}
        <div className="lg:col-span-2 bg-[#12151a] p-10 rounded-[4rem] border border-white/5 shadow-2xl">
          <div className="mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Discipline Efficiency <span className="text-blue-500">Audit</span></h3>
            <p className="text-[10px] font-black text-gray-600 mt-1 uppercase tracking-widest">Financial P&L split: System vs Emotion</p>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Planned', pnl: disciplineMetrics.plannedPnl, fill: '#3b82f6' },
                { name: 'Impulsive', pnl: disciplineMetrics.impulsivePnl, fill: '#f43f5e' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} dy={10} fontStyle="black" />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} fontStyle="black" tickFormatter={(val) => `$${val}`} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                   contentStyle={{ backgroundColor: '#0f1216', border: '1px solid #1f2937', borderRadius: '16px', fontSize: '10px' }}
                />
                <Bar dataKey="pnl" radius={[16, 16, 0, 0]}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f43f5e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex justify-around border-t border-white/5 pt-8">
             <div className="text-center">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Planned Accuracy</p>
                <p className="text-2xl font-black text-blue-500">{disciplineMetrics.plannedWr.toFixed(1)}%</p>
             </div>
             <div className="text-center">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Impulsive Accuracy</p>
                <p className="text-2xl font-black text-rose-500">{disciplineMetrics.impulsiveWr.toFixed(1)}%</p>
             </div>
          </div>
        </div>

        {/* Mindset Pie Chart Summary */}
        <div className="bg-[#12151a] p-10 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col justify-center">
           <div className="mb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Emotional <span className="text-blue-500">Skew</span></h3>
              <p className="text-[10px] font-black text-gray-600 mt-1 uppercase tracking-widest">Psychological state frequency</p>
           </div>
           <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={mindsetMatrixData}
                       cx="50%"
                       cy="50%"
                       innerRadius={65}
                       outerRadius={100}
                       paddingAngle={10}
                       dataKey="count"
                    >
                       {mindsetMatrixData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                       ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f1216', border: '1px solid #1f2937', borderRadius: '16px', fontSize: '10px' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-2 mt-6">
              {mindsetMatrixData.slice(0, 3).map((m, i) => (
                 <div key={m.name} className="flex justify-between items-center px-4 py-2 bg-white/[0.02] rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-white uppercase">
                      {trades.length > 0 ? Math.round((m.count / trades.length) * 100) : 0}%
                    </span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Loss Trigger Auditing */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Loss Trigger <span className="text-blue-500">Auditing</span></h2>
           <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Drawdown Identification by Trigger</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {lossTriggerAudit.length > 0 ? lossTriggerAudit.map((trigger, idx) => (
              <div key={trigger.name} className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-[#12151a] border border-white/5 group hover:border-rose-500/30 transition-all shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <i className="fa-solid fa-triangle-exclamation text-4xl text-rose-500"></i>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 text-xl font-black shadow-inner">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-white uppercase tracking-widest mb-1">{trigger.name}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Total Capital Leak: <span className="text-rose-400">-${trigger.loss.toLocaleString()}</span></p>
                </div>
                <div className="text-right border-l border-white/5 pl-8">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Avg Loss</p>
                  <p className="text-lg font-black text-white font-mono">-${trigger.avgLoss.toFixed(0)}</p>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center bg-[#12151a] rounded-[2.5rem] border border-dashed border-white/10">
                 <p className="text-gray-500 font-black uppercase tracking-widest">No Loss Triggers Identified</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-12 rounded-[4rem] border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -bottom-20 -right-20 p-20 opacity-10">
                <i className="fa-solid fa-brain text-[15rem] text-white"></i>
             </div>
             <div className="relative z-10">
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-8">Performance <br/>Psychologist Audit</h3>
                <div className="space-y-8">
                   <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                      <p className="text-blue-50 text-base font-medium leading-relaxed italic border-l-4 border-blue-300 pl-6 py-2">
                        "The primary performance bottleneck is identified as <span className="font-black text-blue-200 uppercase">{lossTriggerAudit[0]?.name || 'Impulsive Action'}</span>. Your loss-per-execution increases significantly when entering in this state."
                      </p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-black/20 rounded-2xl border border-white/5">
                         <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-2">Max Leak Event</p>
                         <p className="text-xl font-black text-white">-${lossTriggerAudit[0]?.maxLoss.toLocaleString() || '0'}</p>
                      </div>
                      <div className="p-5 bg-black/20 rounded-2xl border border-white/5">
                         <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-2">Efficiency Gain</p>
                         <p className="text-xl font-black text-emerald-400">
                          +{disciplineMetrics.plannedPnl !== 0 ? ((lossTriggerAudit[0]?.loss / Math.abs(disciplineMetrics.plannedPnl || 1)) * 100).toFixed(1) : '0.0'}%
                         </p>
                      </div>
                   </div>
                </div>
             </div>
             <button className="relative z-10 mt-12 w-full py-5 bg-white text-black rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                Download Full Psychology Report
             </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PsychologyHub;
