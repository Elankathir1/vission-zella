
import React, { useState, useDeferredValue, useMemo } from 'react';
import { Trade } from '../types';

interface TradeLogProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
}

const TradeLog: React.FC<TradeLogProps> = ({ trades, onSelectTrade }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // PERFORMANCE: Defer search term to keep input responsive
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredTrades = useMemo(() => {
    if (!deferredSearchTerm.trim()) return trades;
    const lowerSearch = deferredSearchTerm.toLowerCase();
    return trades.filter(t => 
      t.symbol.toLowerCase().includes(lowerSearch) || 
      t.setup.toLowerCase().includes(lowerSearch) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
    );
  }, [trades, deferredSearchTerm]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Symbol,Type,PNL,Status,Date"].join(",") + "\n"
      + trades.map(t => `${t.symbol},${t.type},${t.pnl},${t.status},${t.entryDate}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "visionzella_trades.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#12151a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-fadeIn">
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.01]">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Trade Ledger</h3>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Audit execution history</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm"></i>
            <input 
              type="text" 
              placeholder="Search Symbol or Setup..." 
              className="w-full pl-12 pr-4 py-3 bg-[#0b0e11] border border-white/5 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleExport}
            className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-file-export"></i> Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-600 text-[10px] font-black uppercase tracking-widest bg-[#0b0e11]/50 border-b border-white/5">
              <th className="px-8 py-5">Asset</th>
              <th className="px-8 py-5">Execution</th>
              <th className="px-8 py-5">Setup</th>
              <th className="px-8 py-5 text-right">Volume</th>
              <th className="px-8 py-5 text-right">Net Return</th>
              <th className="px-8 py-5 text-right">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filteredTrades.map((trade) => (
              <tr 
                key={trade.id} 
                onClick={() => onSelectTrade(trade)}
                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-[10px] text-blue-400">
                      {trade.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-black text-white text-sm tracking-tight">{trade.symbol}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{new Date(trade.entryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border ${
                    trade.type === 'LONG' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-rose-500/5 text-rose-500 border-rose-500/10'
                  }`}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{trade.setup}</span>
                </td>
                <td className="px-8 py-6 text-right font-mono text-xs text-gray-500 font-bold">{trade.quantity.toLocaleString()}</td>
                <td className={`px-8 py-6 text-right font-black font-mono text-sm ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                      trade.status === 'WIN' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/5 text-rose-500 border-rose-500/10 group-hover:bg-rose-500/20'
                    }`}>
                      <i className={`fa-solid ${trade.status === 'WIN' ? 'fa-check' : 'fa-xmark'}`}></i>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredTrades.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-magnifying-glass text-gray-700 text-3xl"></i>
          </div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No matching executions found</p>
        </div>
      )}
    </div>
  );
};

export default TradeLog;
