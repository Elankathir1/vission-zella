
import React, { useMemo, useState, useTransition } from 'react';
import { Trade } from '../types';

interface CalendarProps {
  trades: Trade[];
}

const Calendar: React.FC<CalendarProps> = ({ trades }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const today = new Date();
  const TEN_YEARS_AGO = new Date();
  TEN_YEARS_AGO.setFullYear(today.getFullYear() - 10);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Navigation Handlers
  const handlePrevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    if (newDate < TEN_YEARS_AGO) {
      alert("No data beyond 10 years.");
      return;
    }
    startTransition(() => {
      setViewDate(newDate);
      setSelectedDay(null);
    });
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    const maxFuture = new Date();
    maxFuture.setFullYear(today.getFullYear() + 1);
    if (newDate > maxFuture) return;
    startTransition(() => {
      setViewDate(newDate);
      setSelectedDay(null);
    });
  };

  const jumpToToday = () => {
    startTransition(() => {
      setViewDate(new Date());
      setSelectedDay(null);
    });
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    if (newDate < TEN_YEARS_AGO) {
      alert("No data beyond 10 years.");
      return;
    }
    startTransition(() => {
      setViewDate(newDate);
      setSelectedDay(null);
    });
  };

  // Monthly Data Filtering (Performance Optimized)
  const monthlyData = useMemo(() => {
    const stats: Record<number, { pnl: number, trades: Trade[] }> = {};
    trades.forEach(t => {
      const d = new Date(t.entryDate);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const dateNum = d.getDate();
        if (!stats[dateNum]) stats[dateNum] = { pnl: 0, trades: [] };
        stats[dateNum].pnl += Number(t.pnl) || 0;
        stats[dateNum].trades.push(t);
      }
    });
    return stats;
  }, [trades, currentMonth, currentYear]);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(viewDate);
  const years = Array.from({ length: 12 }, (_, i) => today.getFullYear() + 1 - i);

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
              {monthName} <span className="text-blue-500">{currentYear}</span>
            </h1>
            <p className="text-[10px] font-black text-gray-500 mt-1 uppercase tracking-[0.3em]">Temporal Audit Ledger</p>
          </div>

          <div className="flex bg-[#12151a] p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button onClick={jumpToToday} className="px-4 text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest">Today</button>
            <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <select 
              value={currentYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="bg-[#12151a] border border-white/10 text-white font-black text-xs px-6 py-3 rounded-2xl outline-none appearance-none cursor-pointer hover:border-blue-500/50 transition-all pr-12"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <i className="fa-solid fa-calendar-days absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"></i>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className={`lg:col-span-2 bg-[#12151a] rounded-[3.5rem] border border-white/5 p-10 shadow-2xl transition-opacity duration-300 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid grid-cols-7 gap-4 mb-8">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-gray-700 tracking-[0.4em]">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const data = monthlyData[dayNum];
              const isSelected = selectedDay === dayNum;
              const isActualToday = today.getDate() === dayNum && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
              
              return (
                <div 
                  key={dayNum} 
                  onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                  className={`aspect-square rounded-[1.8rem] border transition-all duration-300 cursor-pointer group flex flex-col p-4 relative ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-8 ring-offset-[#0b0e11] scale-95' : 'hover:scale-105'
                  } ${
                    isActualToday ? 'today-highlight' : ''
                  } ${
                    data === undefined ? (isActualToday ? '' : 'bg-white/[0.01] border-white/5') :
                    data.pnl > 0 ? 'bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5' :
                    data.pnl < 0 ? 'bg-rose-500/10 border-rose-500/20 shadow-lg shadow-rose-500/5' :
                    'bg-amber-500/10 border-amber-500/20 shadow-lg shadow-amber-500/5'
                  }`}
                >
                  <span className={`text-[10px] font-black ${data ? 'text-white' : 'text-gray-700'} ${isActualToday ? 'text-orange-400 underline underline-offset-4' : ''}`}>
                    {dayNum.toString().padStart(2, '0')}
                  </span>
                  
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {data && (
                      <div className="text-center animate-fadeIn">
                        <p className={`text-[11px] font-black font-mono ${data.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {data.pnl > 0 ? '+' : ''}{data.pnl >= 1000 ? (data.pnl/1000).toFixed(1) + 'k' : data.pnl.toLocaleString()}
                        </p>
                        <div className="mt-2 flex justify-center gap-1">
                          {data.trades.slice(0, 3).map((t, idx) => (
                            <div key={idx} className={`w-1 h-1 rounded-full ${t.pnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          ))}
                          {data.trades.length > 3 && <div className="w-1 h-1 rounded-full bg-gray-500"></div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl min-h-[500px] flex flex-col">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass-chart text-blue-500"></i>
              Execution Inspector
            </h3>
            
            {selectedDay && monthlyData[selectedDay] ? (
              <div className="space-y-6 animate-fadeIn flex-1">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                  <div>
                    <span className="text-3xl font-black text-white">{selectedDay} {monthName}</span>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Audit Log</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black font-mono ${monthlyData[selectedDay].pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${monthlyData[selectedDay].pnl.toLocaleString()}
                    </p>
                    <span className="text-[9px] font-black text-gray-600 uppercase">Daily Delta</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {monthlyData[selectedDay].trades.map((t) => (
                    <div key={t.id} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex justify-between items-center group cursor-pointer hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${t.pnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {t.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{t.symbol}</p>
                          <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">{t.type} • {t.setup}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-mono font-black ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.pnl >= 0 ? '+' : ''}{t.pnl}
                        </span>
                        <i className="fa-solid fa-chevron-right text-[10px] text-gray-800 ml-3 group-hover:text-blue-500 transition-colors"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <i className="fa-solid fa-hand-pointer text-4xl"></i>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest px-12">Select an active session day to inspect detailed execution logs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
