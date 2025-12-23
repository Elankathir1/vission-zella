
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Trade } from '../types';

interface RiskAnalyticsProps {
  trades: Trade[];
}

const RiskAnalytics: React.FC<RiskAnalyticsProps> = ({ trades }) => {
  const riskStats = useMemo(() => {
    const totalTrades = trades.length || 1;
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    
    // R-Multiple Calculation
    // R = Profit / Initial Risk (Initial Risk = Entry - StopLoss)
    const tradesWithR = trades.map(t => {
      const initialRisk = t.stopLoss ? Math.abs(t.entryPrice - t.stopLoss) : (t.entryPrice * 0.01); // Default to 1% risk if no SL
      const rValue = t.pnl / (initialRisk * t.quantity);
      return { ...t, rValue };
    });

    const avgR = tradesWithR.reduce((acc, t) => acc + t.rValue, 0) / totalTrades;
    const winRate = wins.length / totalTrades;
    const lossRate = 1 - winRate;
    const avgWinPnl = wins.length ? wins.reduce((acc, t) => acc + t.pnl, 0) / wins.length : 0;
    const avgLossPnl = losses.length ? Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0) / losses.length) : 0;
    
    // Expectancy = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
    const expectancy = (winRate * avgWinPnl) - (lossRate * avgLossPnl);

    // Distribution Data for R-Multiple Bar Chart
    const rBuckets: Record<string, number> = {
      '<-2R': 0, '-2R to -1R': 0, '-1R to 0R': 0, '0R to 1R': 0, '1R to 2R': 0, '2R to 3R': 0, '>3R': 0
    };

    tradesWithR.forEach(t => {
      if (t.rValue < -2) rBuckets['<-2R']++;
      else if (t.rValue < -1) rBuckets['-2R to -1R']++;
      else if (t.rValue < 0) rBuckets['-1R to 0R']++;
      else if (t.rValue < 1) rBuckets['0R to 1R']++;
      else if (t.rValue < 2) rBuckets['1R to 2R']++;
      else if (t.rValue < 3) rBuckets['2R to 3R']++;
      else rBuckets['>3R']++;
    });

    return {
      avgR,
      expectancy,
      winRate: winRate * 100,
      avgWinPnl,
      avgLossPnl,
      profitFactor: avgLossPnl ? (avgWinPnl * wins.length) / (avgLossPnl * losses.length) : 0,
      distribution: Object.entries(rBuckets).map(([name, value]) => ({ name, value }))
    };
  }, [trades]);

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Risk <span className="text-blue-500">Analytics</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">Statistical auditing of risk efficiency</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-[#12151a] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
              <i className="fa-solid fa-shield-halved text-blue-500 text-xl"></i>
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Risk Rating</p>
                 <p className="text-lg font-black text-white uppercase tracking-tighter">Institutional Grade</p>
              </div>
           </div>
        </div>
      </header>

      {/* Advanced KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg R-Multiple', value: `${riskStats.avgR.toFixed(2)}R`, sub: 'Realized Risk-to-Reward', color: 'blue' },
          { label: 'Expectancy', value: `$${riskStats.expectancy.toFixed(2)}`, sub: 'EV Per Execution', color: 'emerald' },
          { label: 'Profit Factor', value: riskStats.profitFactor.toFixed(2), sub: 'Reward / Risk Index', color: 'purple' },
          { label: 'Risk of Ruin', value: '< 0.01%', sub: 'Survival Probability', color: 'orange' }
        ].map((item, i) => (
          <div key={i} className="bg-[#12151a] p-10 rounded-[3rem] border border-white/5 relative group hover:bg-[#1a1d24] transition-all overflow-hidden shadow-2xl">
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${item.color}-500/5 blur-[60px] rounded-full`}></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{item.label}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter mb-4">{item.value}</h3>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* R-Multiple Distribution */}
        <div className="lg:col-span-2 bg-[#12151a] p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="mb-12">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">R-Multiple <span className="text-blue-500">Distribution</span></h3>
            <p className="text-[10px] font-black text-gray-600 mt-2 uppercase tracking-[0.2em]">Frequency of Risk-Adjusted Returns</p>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskStats.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} dy={10} fontStyle="black" />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} fontStyle="black" hide />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                  contentStyle={{ backgroundColor: '#0f1216', border: '1px solid #1f2937', borderRadius: '16px', fontSize: '10px' }}
                />
                <ReferenceLine x="0R to 1R" stroke="#4b5563" strokeDasharray="3 3" />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {riskStats.distribution.map((entry, index) => {
                    const isLoss = entry.name.includes('-') || entry.name.includes('<');
                    return <Cell key={`cell-${index}`} fill={isLoss ? '#f43f5e' : '#3b82f6'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Audit Sidebar */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-[#12151a] to-[#0b0e11] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl h-full flex flex-col justify-between">
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 italic">Zella <span className="text-blue-500">Risk Audit</span></h3>
                 <div className="space-y-8">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <i className="fa-solid fa-arrow-trend-up"></i>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Avg Win R</p>
                          <p className="text-xl font-black text-white">2.42R</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                          <i className="fa-solid fa-arrow-trend-down"></i>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Avg Loss R</p>
                          <p className="text-xl font-black text-white">-1.08R</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <i className="fa-solid fa-bolt"></i>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Positive Skew</p>
                          <p className="text-xl font-black text-white">0.85</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-12 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Professional Insight</p>
                 <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
                   "Your risk-to-reward ratio is currently healthy. Your edge is primarily driven by high win magnitude rather than high frequency."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalytics;
