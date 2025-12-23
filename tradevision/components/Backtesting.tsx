
import React, { useState } from 'react';

const Backtesting: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);

  const mockSessions = [
    { id: 1, name: 'Q3 Breakout Test', trades: 45, winRate: 62, pnl: 4200, status: 'Completed' },
    { id: 2, name: 'VWAP Fade Strategy', trades: 12, winRate: 45, pnl: -120, status: 'Active' },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Backtest Engine</h1>
          <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Validate your edge with historical data</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-8 py-4 bg-blue-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all"
        >
          Create New Session
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#12151a] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Sessions</h3>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {mockSessions.map(session => (
                <div key={session.id} className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-flask"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white tracking-tight">{session.name}</h4>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{session.trades} Trades Logged</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${session.status === 'Completed' ? 'text-emerald-500' : 'text-blue-400'}`}>{session.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black font-mono ${session.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {session.pnl >= 0 ? '+' : ''}${session.pnl.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{session.winRate}% Win Rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
             <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Pro Tip: Backtesting</h4>
             <p className="text-blue-50 font-medium text-sm leading-relaxed mb-8">
               "A backtest of 50 trades provides 90% more statistical significance than 10 trades. Aim for consistency over perfection."
             </p>
             <button className="w-full py-4 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/20 transition-all">
               View Strategy Guide
             </button>
          </div>
          <div className="bg-[#12151a] p-8 rounded-[2.5rem] border border-white/5">
             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Historical Data Source</h4>
             <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
               <i className="fa-solid fa-cloud-arrow-down text-blue-500"></i>
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Feed: Polygon.io</span>
             </div>
          </div>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0b0e11] border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-slideInUp">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">New Session</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Strategy Name</label>
                <input className="w-full bg-[#12151a] border border-white/5 rounded-2xl p-4 text-white font-bold outline-none" placeholder="e.g. Mean Reversion EMA" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Starting Balance</label>
                <input type="number" className="w-full bg-[#12151a] border border-white/5 rounded-2xl p-4 text-white font-bold outline-none" defaultValue="50000" />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsCreating(false)} className="flex-1 py-4 bg-white/5 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-xl">Cancel</button>
                <button onClick={() => setIsCreating(false)} className="flex-[2] py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20">Initialize session</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backtesting;
