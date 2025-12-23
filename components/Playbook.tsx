
import React, { useMemo } from 'react';
import { Trade, SetupStats } from '../types';

interface PlaybookProps {
  trades: Trade[];
}

const Playbook: React.FC<PlaybookProps> = ({ trades }) => {
  const setupPerformance: SetupStats[] = useMemo(() => {
    const map: Record<string, { trades: number; wins: number; pnl: number }> = {};
    
    trades.forEach(t => {
      if (!map[t.setup]) map[t.setup] = { trades: 0, wins: 0, pnl: 0 };
      map[t.setup].trades++;
      if (t.status === 'WIN') map[t.setup].wins++;
      map[t.setup].pnl += t.pnl;
    });

    return Object.entries(map).map(([name, stats]) => ({
      name,
      trades: stats.trades,
      winRate: (stats.wins / stats.trades) * 100,
      pnl: stats.pnl
    })).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const mistakeImpact = useMemo(() => {
    const map: Record<string, { count: number; pnl: number }> = {};
    trades.forEach(t => {
      t.mistakes?.forEach(m => {
        if (!map[m]) map[m] = { count: 0, pnl: 0 };
        map[m].count++;
        map[m].pnl += t.pnl;
      });
    });
    return Object.entries(map).sort((a, b) => a[1].pnl - b[1].pnl);
  }, [trades]);

  return (
    <div className="space-y-10 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Playbook</h1>
        <p className="text-gray-500 mt-1">Which setups are actually making you money?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {setupPerformance.map((setup) => (
          <div key={setup.name} className="bg-[#12151a] p-8 rounded-[2rem] border border-gray-800/50 hover:border-blue-500/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white">{setup.name}</h3>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                setup.pnl >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {setup.pnl >= 0 ? 'PROFITABLE' : 'UNPROFITABLE'}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Total P&L</span>
                <span className={`font-bold ${setup.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${setup.pnl.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Trade Count</span>
                <span className="text-white font-bold">{setup.trades}</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-tighter">
                  <span>Win Rate</span>
                  <span>{setup.winRate.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-700" 
                    style={{ width: `${setup.winRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#12151a] rounded-[2rem] border border-gray-800/50 p-8">
        <h3 className="text-xl font-bold text-white mb-6">Mistake Analysis</h3>
        <div className="space-y-6">
          {mistakeImpact.length > 0 ? mistakeImpact.map(([name, data]) => (
            <div key={name} className="flex items-center gap-6">
              <div className="w-48 text-sm font-bold text-gray-400 truncate">{name}</div>
              <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden relative">
                 <div 
                  className="h-full bg-rose-500/50" 
                  style={{ width: `${Math.min(100, (Math.abs(data.pnl) / 1000) * 100)}%` }}
                 ></div>
              </div>
              <div className="w-32 text-right">
                <p className="text-sm font-bold text-rose-400">-${Math.abs(data.pnl).toLocaleString()}</p>
                <p className="text-[10px] text-gray-600 font-bold uppercase">{data.count} occurrences</p>
              </div>
            </div>
          )) : (
            <div className="py-10 text-center text-gray-500 italic">No mistakes logged! Great discipline.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playbook;
