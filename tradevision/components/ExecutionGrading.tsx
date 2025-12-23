
import React, { useState, useEffect } from 'react';
import { gradePortfolioExecution } from '../services/geminiService';
import { Trade, Account } from '../types';

interface ExecutionGradingProps {
  trades: Trade[];
  account?: Account;
}

interface GradingResult {
  overallGrade: string;
  qualityScore: number;
  summary: string;
  tradeGrades: Array<{
    tradeId: string;
    grade: string;
    reason: string;
  }>;
}

const ExecutionGrading: React.FC<ExecutionGradingProps> = ({ trades, account }) => {
  const [grading, setGrading] = useState<GradingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runGrading = async () => {
    if (trades.length === 0) return;
    setLoading(true);
    const result = await gradePortfolioExecution(trades, account);
    setGrading(result);
    setLoading(false);
  };

  useEffect(() => {
    if (!grading && trades.length > 0) {
      runGrading();
    }
  }, [trades]);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (grade.startsWith('B')) return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
    if (grade.startsWith('C')) return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  const overtrades = trades.filter(t => t.tradeSequenceNum && account?.maxTradesPerDay && t.tradeSequenceNum > account.maxTradesPerDay);

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">AI Execution <span className="text-blue-500">Grade</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">Institutional Grade Quality Audit</p>
        </div>
        <button 
          onClick={runGrading}
          disabled={loading || trades.length === 0}
          className="px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
          {loading ? 'Auditing Performance...' : 'Run New Audit'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-[#12151a] p-8 rounded-[3rem] border border-white/5 flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${overtrades.length > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
               <i className={`fa-solid ${overtrades.length > 0 ? 'fa-triangle-exclamation' : 'fa-check-double'}`}></i>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Overtrading Check</p>
               <h3 className="text-lg font-black text-white uppercase">
                 {overtrades.length > 0 ? `${overtrades.length} Violations Found` : 'Perfect Rule Adherence'}
               </h3>
               <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">Daily Limit: {account?.maxTradesPerDay || 2} Trades</p>
            </div>
         </div>
      </div>

      {grading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-[#12151a] p-12 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Zella Overall Grade</p>
            <div className={`w-40 h-40 rounded-full border-8 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,0,0,0.3)] ${getGradeColor(grading.overallGrade)}`}>
              <span className="text-7xl font-black tracking-tighter">{grading.overallGrade}</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-white tracking-tight">{grading.qualityScore}%</p>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Quality Match Score</p>
            </div>
            <div className="mt-12 p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i className="fa-solid fa-shield-halved"></i> Risk Manager Feedback
              </p>
              <p className="text-xs text-gray-400 leading-relaxed italic">"{grading.summary}"</p>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
             <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-4 mb-4">Detailed Execution Logs</h3>
             <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                {grading.tradeGrades.map((tg) => {
                  const trade = trades.find(t => t.id === tg.tradeId);
                  if (!trade) return null;
                  const isOvertrade = trade.tradeSequenceNum && account?.maxTradesPerDay && trade.tradeSequenceNum > account.maxTradesPerDay;
                  return (
                    <div key={tg.tradeId} className={`bg-[#12151a] p-6 rounded-[2.5rem] border flex items-center gap-8 hover:border-white/10 transition-all shadow-xl group ${isOvertrade ? 'border-rose-500/20 bg-rose-500/5' : 'border-white/5'}`}>
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-inner ${getGradeColor(tg.grade)}`}>
                          {tg.grade}
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-4 mb-1">
                             <p className="text-sm font-black text-white uppercase tracking-widest">{trade.symbol}</p>
                             {isOvertrade && <span className="text-[8px] font-black px-2 py-0.5 bg-rose-600 text-white rounded-md uppercase tracking-widest animate-pulse">RULE VIOLATION: OVERTRADE</span>}
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{tg.reason}</p>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionGrading;
