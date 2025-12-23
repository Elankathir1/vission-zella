
import React, { useMemo, useDeferredValue } from 'react';
import { Trade, TemporalStats } from '../types';

interface TemporalPerformanceInsightsProps {
  trades: Trade[];
}

const TemporalPerformanceInsights: React.FC<TemporalPerformanceInsightsProps> = ({ trades }) => {
  const deferredTrades = useDeferredValue(trades);
  
  const calculateGrade = (winRate: number, profit: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (winRate >= 65 && profit > 0) return 'A';
    if (winRate >= 50 && profit > 0) return 'B';
    if (winRate >= 40 || profit > 0) return 'C';
    if (winRate < 40 && profit <= 0) return 'D';
    return 'F';
  };

  const getFinalStats = (count: number, wins: number, pnl: number, totalR: number): TemporalStats => {
    if (count === 0) return { winRate: 0, lossRate: 0, totalPnl: 0, avgRR: 0, tradeCount: 0, grade: 'F' };
    const winRate = (wins / count) * 100;
    return {
      winRate,
      lossRate: 100 - winRate,
      totalPnl: pnl,
      avgRR: totalR / count,
      tradeCount: count,
      grade: calculateGrade(winRate, pnl)
    };
  };

  const temporalBuckets = useMemo(() => {
    console.time('Temporal_Buckets_Audit');
    const buckets: any = {
      sessions: {},
      days: {},
      weeks: {},
      months: {}
    };

    const sessionKeys = ['New York', 'London', 'Asian', 'London + New York', 'London + Asian'];
    const dayKeys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekKeys = [1, 2, 3, 4];
    const monthKeys = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const init = (obj: any, keys: any[]) => keys.forEach(k => obj[k] = { count: 0, wins: 0, pnl: 0, rr: 0 });
    init(buckets.sessions, sessionKeys);
    init(buckets.days, dayKeys);
    init(buckets.weeks, weekKeys);
    init(buckets.months, monthKeys);

    for (const t of deferredTrades) {
      const pnl = Number(t.pnl) || 0;
      const isWin = pnl > 0;
      const rr = t.rrAchieved || 0;

      if (buckets.sessions[t.session]) {
        buckets.sessions[t.session].count++;
        buckets.sessions[t.session].pnl += pnl;
        buckets.sessions[t.session].rr += rr;
        if (isWin) buckets.sessions[t.session].wins++;
      }
      if (buckets.days[t.dayOfWeek]) {
        buckets.days[t.dayOfWeek].count++;
        buckets.days[t.dayOfWeek].pnl += pnl;
        buckets.days[t.dayOfWeek].rr += rr;
        if (isWin) buckets.days[t.dayOfWeek].wins++;
      }
      if (buckets.weeks[t.weekOfMonth]) {
        buckets.weeks[t.weekOfMonth].count++;
        buckets.weeks[t.weekOfMonth].pnl += pnl;
        buckets.weeks[t.weekOfMonth].rr += rr;
        if (isWin) buckets.weeks[t.weekOfMonth].wins++;
      }
      if (buckets.months[t.month]) {
        buckets.months[t.month].count++;
        buckets.months[t.month].pnl += pnl;
        buckets.months[t.month].rr += rr;
        if (isWin) buckets.months[t.month].wins++;
      }
    }

    const sessionStats = sessionKeys.map(k => ({ name: k, stats: getFinalStats(buckets.sessions[k].count, buckets.sessions[k].wins, buckets.sessions[k].pnl, buckets.sessions[k].rr) }));
    const weekdayStats = dayKeys.map(k => ({ name: k, stats: getFinalStats(buckets.days[k].count, buckets.days[k].wins, buckets.days[k].pnl, buckets.days[k].rr) }));
    const weekOfMonthStats = weekKeys.map(k => ({ name: `Week ${k}`, stats: getFinalStats(buckets.weeks[k].count, buckets.weeks[k].wins, buckets.weeks[k].pnl, buckets.weeks[k].rr) }));
    const monthlyStats = monthKeys.map(k => ({ name: k, stats: getFinalStats(buckets.months[k].count, buckets.months[k].wins, buckets.months[k].pnl, buckets.months[k].rr) }))
                                  .filter(m => m.stats.tradeCount > 0);

    console.timeEnd('Temporal_Buckets_Audit');
    return { sessionStats, weekdayStats, weekOfMonthStats, monthlyStats };
  }, [deferredTrades]);

  const { sessionStats, weekdayStats, weekOfMonthStats, monthlyStats } = temporalBuckets;

  const bestDay = useMemo(() => [...weekdayStats].sort((a, b) => b.stats.winRate - a.stats.winRate)[0], [weekdayStats]);
  const worstDay = useMemo(() => [...weekdayStats].sort((a, b) => a.stats.winRate - b.stats.winRate)[0], [weekdayStats]);
  const bestSession = useMemo(() => [...sessionStats].sort((a, b) => b.stats.winRate - a.stats.winRate)[0], [sessionStats]);
  const worstSession = useMemo(() => [...sessionStats].sort((a, b) => a.stats.winRate - b.stats.winRate)[0], [sessionStats]);

  const getHeatmapColor = (pnl: number, tradeCount: number) => {
    if (tradeCount === 0) return 'bg-[#12151a] border-white/5 text-gray-800';
    if (pnl > 0) return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
    if (pnl < 0) return 'bg-rose-500/20 border-rose-500/30 text-rose-400';
    return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  };

  return (
    <div className="space-y-16 animate-fadeIn pb-20">
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Market Session Scorecards</h3>
           <div className="flex gap-2">
              <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded uppercase">Best: {bestSession?.name}</span>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sessionStats.map(s => (
            <div key={s.name} className="bg-[#12151a] p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between group hover:border-blue-500/30 transition-all shadow-xl will-change-transform">
              <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 truncate">{s.name}</p>
                <h4 className="text-2xl font-black text-white">{s.stats.winRate.toFixed(0)}% <span className="text-[8px] text-gray-600 font-bold uppercase">WR</span></h4>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className={`text-sm font-black font-mono ${s.stats.totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {s.stats.totalPnl >= 0 ? '+' : ''}${s.stats.totalPnl.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] px-2">Day of Week Analytics</h3>
          <div className="space-y-3">
            {weekdayStats.map(d => (
              <div key={d.name} className="bg-[#12151a] p-5 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/[0.01] transition-colors will-change-transform">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[12px] border ${d.stats.winRate >= 50 ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-rose-500/5 text-rose-500 border-rose-500/10'}`}>
                    {d.name.slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">{d.name}</p>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{d.stats.tradeCount} Trades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black font-mono ${d.stats.totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    ${d.stats.totalPnl.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] px-2">Week of Month Cycles</h3>
          <div className="grid grid-cols-2 gap-4">
            {weekOfMonthStats.map(w => (
              <div key={w.name} className="bg-[#12151a] p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-all shadow-lg will-change-transform">
                <p className="text-[10px] font-black text-gray-600 uppercase mb-6 tracking-widest">{w.name}</p>
                <h4 className={`text-3xl font-black font-mono tracking-tighter ${w.stats.totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                   ${Math.abs(w.stats.totalPnl).toLocaleString()}
                </h4>
                <p className="text-[9px] font-bold text-gray-600 uppercase mt-2 tracking-widest">{w.stats.winRate.toFixed(0)}% Probability</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TemporalPerformanceInsights;
