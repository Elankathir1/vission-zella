
import React from 'react';
import { Trade } from '../types';
import TradingViewChart from './TradingViewChart';

interface TradeDetailModalProps {
  trade: Trade;
  onClose: () => void;
}

const TradeDetailModal: React.FC<TradeDetailModalProps> = ({ trade, onClose }) => {
  const roi = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100 * (trade.type === 'LONG' ? 1 : -1);
  
  const plannedMove = Math.abs((trade.takeProfit || trade.exitPrice) - trade.entryPrice);
  const actualMove = Math.abs(trade.exitPrice - trade.entryPrice);
  const efficiency = trade.pnl > 0 ? (actualMove / (plannedMove || 1)) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl h-full bg-[#0b0e11] border-l border-white/10 shadow-2xl overflow-y-auto animate-slideInRight custom-scrollbar">
        <div className="sticky top-0 bg-[#0b0e11]/90 backdrop-blur-xl p-10 border-b border-white/5 flex justify-between items-center z-10">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-inner ${
              trade.status === 'WIN' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-rose-500/10 text-rose-500 border border-rose-500/10'
            }`}>
              {trade.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{trade.symbol}</h2>
                {trade.propAccountStage && (
                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                    trade.propAccountStage === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {trade.propAccountStage} ACCOUNT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${trade.type === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{trade.type === 'LONG' ? 'BUY / LONG' : 'SELL / SHORT'}</span>
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">EXECUTED: {new Date(trade.entryDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-[1.5rem] transition-all flex items-center justify-center group">
            <i className="fa-solid fa-xmark text-white text-xl group-hover:rotate-90 transition-transform"></i>
          </button>
        </div>

        <div className="p-10 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Market Context</h3>
               <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Live 15m Chart</span>
            </div>
            <TradingViewChart symbol={trade.symbol} height={400} />
          </section>

          <div className="bg-[#12151a] rounded-[4rem] p-12 border border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 text-right">
              <p className={`text-6xl font-black tracking-tighter ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-600 font-black mt-3 uppercase tracking-[0.3em]">{roi.toFixed(2)}% REALIZED ROI</p>
            </div>
            
            <div className="pt-4">
              <div className="flex gap-4 mb-10">
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${trade.isPlanned ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'bg-rose-600/10 text-rose-400 border-rose-600/20'}`}>
                   {trade.isPlanned ? 'Planned Execution' : 'Impulsive Entry'}
                 </span>
                 {trade.marketCondition && (
                   <span className="px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border bg-white/5 text-gray-400 border-white/10">
                     {trade.marketCondition}
                   </span>
                 )}
              </div>
              <div className="grid grid-cols-2 gap-16">
                <div>
                  <p className="text-[10px] text-gray-600 mb-3 font-black uppercase tracking-[0.2em]">Filled Entry</p>
                  <p className="text-3xl font-mono font-black text-white">${trade.entryPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 mb-3 font-black uppercase tracking-[0.2em]">Realized Exit</p>
                  <p className="text-3xl font-mono font-black text-white">${trade.exitPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">Planning Efficiency Audit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-8 bg-[#12151a] border border-white/5 rounded-[2.5rem] flex flex-col justify-between">
                <div>
                   <p className="text-[9px] font-black text-gray-600 uppercase mb-4 tracking-widest">Planned Targets</p>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-gray-400 uppercase">Target (TP)</span>
                         <span className="text-sm font-black text-emerald-400 font-mono">${trade.takeProfit?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-gray-400 uppercase">Invalidation (SL)</span>
                         <span className="text-sm font-black text-rose-400 font-mono">${trade.stopLoss?.toFixed(2) || 'N/A'}</span>
                      </div>
                   </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                   <p className="text-[9px] font-black text-gray-600 uppercase mb-2">Planned RR</p>
                   <p className="text-2xl font-black text-white">{trade.rrPlanned || 0}R</p>
                </div>
              </div>

              <div className="p-8 bg-[#12151a] border border-white/5 rounded-[2.5rem] flex flex-col justify-between">
                <div>
                   <p className="text-[9px] font-black text-gray-600 uppercase mb-4 tracking-widest">Realized Efficiency</p>
                   <div className="relative h-24 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-black text-blue-500">{efficiency.toFixed(0)}%</p>
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Capture Rate</p>
                      </div>
                   </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                   <p className="text-[9px] font-black text-gray-600 uppercase mb-2">Achieved RR</p>
                   <p className={`text-2xl font-black ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.rrAchieved?.toFixed(2) || 0}R
                   </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5 text-center">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Capital Risk Profile</p>
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <p className="text-2xl font-black text-white">${trade.riskUsedAmt?.toLocaleString() || 0}</p>
                   <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Risk Amount ($)</p>
                </div>
                <div>
                   <p className="text-2xl font-black text-white">{trade.riskUsedPct || 0}%</p>
                   <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Risk Percentage (%)</p>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">Psychological Journey</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-[#12151a] border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <i className="fa-solid fa-hourglass-start text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Psychology Before Trade</p>
                    <p className="text-sm font-black text-white">{trade.preTradeMindset || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-[#12151a] border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                    <i className="fa-solid fa-wave-square text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-purple-500 uppercase mb-1">Psychology During Trade</p>
                    <p className="text-sm font-black text-white">{trade.duringTradeMindset || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-[#12151a] border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <i className="fa-solid fa-flag-checkered text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Psychology After Trade</p>
                    <p className="text-sm font-black text-white">{trade.postTradeMindset || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div className="bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Entry Logic</p>
                <p className="text-xs text-gray-300 font-medium leading-relaxed pl-4 border-l-2 border-blue-500">
                  {trade.entryReason || 'No specific entry reason provided.'}
                </p>
             </div>
             <div className="bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Exit Logic</p>
                <p className="text-xs text-gray-300 font-medium leading-relaxed pl-4 border-l-2 border-rose-500">
                  {trade.exitReason || 'No specific exit reason provided.'}
                </p>
             </div>
          </div>

          <div className="bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5 flex flex-col justify-center">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Execution & Discipline Audit</p>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-600">Discipline Rating</span>
                  <span className="text-emerald-400">{trade.disciplineRating}/10</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-600">Stress Intensity</span>
                  <span className="text-rose-400">{trade.stressLevel}/10</span>
               </div>
               <div className="pt-4 border-t border-white/5">
                  <p className="text-[8px] font-black text-gray-600 uppercase mb-2">Setup / Strategy</p>
                  <span className="text-[10px] font-black text-white uppercase">{trade.setup}</span>
               </div>
            </div>
          </div>

          <div className="bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Reflective Notes</h4>
            <div className="p-8 bg-white/[0.01] border border-white/5 rounded-3xl relative">
                <i className="fa-solid fa-quote-left absolute top-4 left-4 text-white/5 text-4xl"></i>
                <p className="text-gray-400 leading-relaxed font-medium text-sm relative z-10">
                  {trade.notes || 'No notes logged for this execution.'}
                </p>
            </div>
          </div>

          <div className="flex gap-4 pt-10 pb-20">
             <button className="flex-1 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                Download Analysis
             </button>
             <button className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-white/10 transition-all">
                Share Setup
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDetailModal;
