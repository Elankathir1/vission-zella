
import React, { useState, useEffect } from 'react';
import { SETUPS, MISTAKES, SENTIMENT_OPTIONS } from '../constants';
import { Trade, TradeType, PropAccountStage, HoldingCategory, SessionConfig } from '../types';
import TemporalPerformanceInsights from './TemporalPerformanceInsights';

interface NewTradeModalProps {
  onClose: () => void;
  onAdd: (trade: Trade) => void;
  existingTrades?: Trade[]; // For calculating relative performance
  sessionConfig: SessionConfig;
}

const NewTradeModal: React.FC<NewTradeModalProps> = ({ onClose, onAdd, existingTrades = [], sessionConfig }) => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'FORM' | 'TEMPORAL'>('FORM');
  const [availableSetups, setAvailableSetups] = useState<string[]>(SETUPS);
  const [availableMistakes, setAvailableMistakes] = useState<string[]>(MISTAKES);
  const [availableSentiments, setAvailableSentiments] = useState<string[]>(SENTIMENT_OPTIONS);
  
  const [showAddSetup, setShowAddSetup] = useState(false);
  const [newSetupInput, setNewSetupInput] = useState('');
  const [showAddMistake, setShowAddMistake] = useState(false);
  const [newMistakeInput, setNewMistakeInput] = useState('');
  const [showAddSentiment, setShowAddSentiment] = useState(false);
  const [newSentimentInput, setNewSentimentInput] = useState('');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeNowStr = now.toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    symbol: '',
    type: 'LONG' as TradeType,
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    takeProfit: '',
    quantity: '',
    entryDate: todayStr,
    entryTime: timeNowStr,
    exitDate: todayStr,
    exitTime: timeNowStr,
    setup: availableSetups[0],
    notes: '',
    mistakes: [] as string[],
    preTradeMindset: 'Focused',
    duringTradeMindset: 'Calm',
    postTradeMindset: '',
    riskReasoning: '',
    entryReason: '',
    exitReason: '',
    riskUsedPct: '1.0',
    riskUsedAmt: '',
    rrPlanned: '2.0',
    marketCondition: 'Bullish Trending',
    stressLevel: 5,
    disciplineRating: 10,
    isPlanned: true,
    tradeSequenceNum: '1',
    propAccountStage: 'EVALUATION' as PropAccountStage,
    tags: [] as string[],
    screenshotLink: ''
  });

  const [timeAnalytics, setTimeAnalytics] = useState({
    holdingTime: '00:00',
    category: 'INTRADAY' as HoldingCategory,
    session: 'New York',
    dayOfWeek: 'Monday',
    weekOfMonth: 1,
    month: 'January',
    entryEst: '00:00 AM EST',
    exitEst: '00:00 AM EST'
  });

  useEffect(() => {
    calculateTemporalData();
  }, [formData.entryDate, formData.entryTime, formData.exitDate, formData.exitTime, sessionConfig]);

  const calculateTemporalData = () => {
    const start = new Date(`${formData.entryDate}T${formData.entryTime}`);
    const end = new Date(`${formData.exitDate}T${formData.exitTime}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(Math.max(0, diffMs) / 60000);
    const hours = Math.floor(diffMins / 60).toString().padStart(2, '0');
    const mins = (diffMins % 60).toString().padStart(2, '0');
    const durationStr = `${hours}:${mins}`;

    // Category Logic
    let category: HoldingCategory = 'INTRADAY';
    if (diffMins <= 30) category = 'SCALPING';
    else if (diffMins <= 360) category = 'INTRADAY';
    else if (diffMins <= 4320) category = 'SWING';
    else category = 'LONG-TERM';

    // Session Logic (Using customizable sessionConfig)
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false });
    const formattedTime = formatter.format(start); // e.g. "09:30"
    const [h, m] = formattedTime.split(':').map(Number);
    const totalMinutes = h * 60 + m;

    const getMinutes = (timeStr: string) => {
      const [sh, sm] = timeStr.split(':').map(Number);
      return sh * 60 + sm;
    };

    const asianStart = getMinutes(sessionConfig.Asian.start);
    const asianEnd = getMinutes(sessionConfig.Asian.end);
    const londonStart = getMinutes(sessionConfig.London.start);
    const londonEnd = getMinutes(sessionConfig.London.end);
    const nyStart = getMinutes(sessionConfig.NewYork.start);
    const nyEnd = getMinutes(sessionConfig.NewYork.end);

    const isInSession = (time: number, start: number, end: number) => {
      if (start <= end) return time >= start && time < end;
      return time >= start || time < end; // Crosses midnight
    };

    const isAsian = isInSession(totalMinutes, asianStart, asianEnd);
    const isLondon = isInSession(totalMinutes, londonStart, londonEnd);
    const isNY = isInSession(totalMinutes, nyStart, nyEnd);

    let session = 'Other';
    if (isLondon && isNY) session = 'London + New York';
    else if (isLondon && isAsian) session = 'London + Asian';
    else if (isNY) session = 'New York';
    else if (isLondon) session = 'London';
    else if (isAsian) session = 'Asian';
    else session = 'Pre/Post Market';

    // Calendar Attributes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayOfWeek = days[start.getDay()];
    const weekOfMonth = Math.ceil(start.getDate() / 7);
    const month = months[start.getMonth()];

    const estTimeDisplay = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: true });

    setTimeAnalytics({
      holdingTime: durationStr,
      category,
      session,
      dayOfWeek,
      weekOfMonth,
      month,
      entryEst: estTimeDisplay.format(start),
      exitEst: estTimeDisplay.format(end)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const qty = parseFloat(formData.quantity);
    
    if (isNaN(entry) || isNaN(exit) || isNaN(qty)) {
      alert("Please ensure all numeric fields are valid numbers.");
      return;
    }

    const startTs = new Date(`${formData.entryDate}T${formData.entryTime}`).toISOString();
    const endTs = new Date(`${formData.exitDate}T${formData.exitTime}`).toISOString();
    const pnl = (exit - entry) * qty * (formData.type === 'LONG' ? 1 : -1);
    const riskAmt = Math.abs(entry - parseFloat(formData.stopLoss || '1'));
    const achievedRR = riskAmt > 0 ? (Math.abs(exit - entry) / riskAmt) * (pnl > 0 ? 1 : -1) : 0;

    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: formData.symbol.toUpperCase() || 'UNKNOWN',
      type: formData.type,
      entryPrice: entry,
      exitPrice: exit,
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
      takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
      quantity: qty,
      entryDate: startTs,
      exitDate: endTs,
      entryTimestamp: startTs,
      exitTimestamp: endTs,
      holdingDuration: timeAnalytics.holdingTime,
      holdingCategory: timeAnalytics.category,
      session: timeAnalytics.session,
      dayOfWeek: timeAnalytics.dayOfWeek,
      weekOfMonth: timeAnalytics.weekOfMonth,
      month: timeAnalytics.month,
      pnl: pnl,
      status: pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAKEVEN',
      setup: formData.setup,
      notes: formData.notes,
      tags: formData.tags,
      mistakes: formData.mistakes,
      preTradeMindset: formData.preTradeMindset,
      duringTradeMindset: formData.duringTradeMindset,
      postTradeMindset: formData.postTradeMindset,
      riskReasoning: formData.riskReasoning,
      entryReason: formData.entryReason,
      exitReason: formData.exitReason,
      riskUsedPct: parseFloat(formData.riskUsedPct),
      riskUsedAmt: parseFloat(formData.riskUsedAmt) || 0,
      rrPlanned: parseFloat(formData.rrPlanned),
      rrAchieved: achievedRR,
      marketCondition: formData.marketCondition,
      screenshotLink: formData.screenshotLink,
      mentalState: formData.preTradeMindset,
      stressLevel: Number(formData.stressLevel) || 5,
      disciplineRating: Number(formData.disciplineRating) || 10,
      isPlanned: formData.isPlanned,
      tradeSequenceNum: parseInt(formData.tradeSequenceNum),
      propAccountStage: formData.propAccountStage
    };

    onAdd(newTrade);
    onClose();
  };

  const toggleMistake = (m: string) => {
    setFormData(prev => ({
      ...prev,
      mistakes: prev.mistakes.includes(m) ? prev.mistakes.filter(x => x !== m) : [...prev.mistakes, m]
    }));
  };

  const handleAddSetup = () => {
    if (newSetupInput.trim() && !availableSetups.includes(newSetupInput.trim())) {
      setAvailableSetups(prev => [...prev, newSetupInput.trim()]);
      setFormData(prev => ({ ...prev, setup: newSetupInput.trim() }));
      setNewSetupInput('');
      setShowAddSetup(false);
    }
  };

  const removeSetup = (s: string) => {
    setAvailableSetups(prev => prev.filter(item => item !== s));
    if (formData.setup === s) setFormData(prev => ({ ...prev, setup: availableSetups[0] }));
  };

  const handleAddMistake = () => {
    if (newMistakeInput.trim() && !availableMistakes.includes(newMistakeInput.trim())) {
      setAvailableMistakes(prev => [...prev, newMistakeInput.trim()]);
      setNewMistakeInput('');
      setShowAddMistake(false);
    }
  };

  const removeMistake = (m: string) => {
    setAvailableMistakes(prev => prev.filter(item => item !== m));
    setFormData(prev => ({ ...prev, mistakes: prev.mistakes.filter(item => item !== m) }));
  };

  const handleAddSentiment = () => {
    if (newSentimentInput.trim() && !availableSentiments.includes(newSentimentInput.trim())) {
      setAvailableSentiments(prev => [...prev, newSentimentInput.trim()]);
      setNewSentimentInput('');
      setShowAddSentiment(false);
    }
  };

  const removeSentiment = (s: string) => setAvailableSentiments(prev => prev.filter(item => item !== s));

  const isOvertrading = parseInt(formData.tradeSequenceNum) >= 2;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fadeIn p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0b0e11] border border-white/10 rounded-[3.5rem] shadow-2xl overflow-hidden animate-slideInUp my-8">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-white/[0.01] gap-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Trade <span className="text-blue-500">Audit</span> Wizard</h2>
            <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-white/5'}`}></div>
                ))}
            </div>
          </div>
          
          <div className="flex bg-[#12151a] p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('FORM')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'FORM' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >Audit Flow</button>
            <button 
              onClick={() => setActiveTab('TEMPORAL')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'TEMPORAL' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >Temporal Performance Insights</button>
          </div>

          <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all flex items-center justify-center group"><i className="fa-solid fa-xmark group-hover:rotate-90 transition-transform"></i></button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'TEMPORAL' ? (
            <div className="p-10">
              <TemporalPerformanceInsights trades={existingTrades} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl mb-4">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Step 1: Execution Realities</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Record your precise entry and exit metrics.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Market Symbol</label>
                      <input required autoFocus className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-5 text-white font-black text-xl focus:border-blue-500 outline-none transition-all placeholder-white/10" placeholder="E.G. NVDA, BTC, ES_F" value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}/>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Entry Time</label>
                         <div className="flex gap-2">
                            <input type="date" className="flex-1 bg-[#12151a] border border-white/5 rounded-xl px-4 py-3 text-white text-[10px] font-bold" value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} />
                            <input type="time" className="flex-1 bg-[#12151a] border border-white/5 rounded-xl px-4 py-3 text-white text-[10px] font-bold" value={formData.entryTime} onChange={e => setFormData({...formData, entryTime: e.target.value})} />
                         </div>
                       </div>
                       <div>
                         <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Exit Time</label>
                         <div className="flex gap-2">
                            <input type="date" className="flex-1 bg-[#12151a] border border-white/5 rounded-xl px-4 py-3 text-white text-[10px] font-bold" value={formData.exitDate} onChange={e => setFormData({...formData, exitDate: e.target.value})} />
                            <input type="time" className="flex-1 bg-[#12151a] border border-white/5 rounded-xl px-4 py-3 text-white text-[10px] font-bold" value={formData.exitTime} onChange={e => setFormData({...formData, exitTime: e.target.value})} />
                         </div>
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Trade Direction</label>
                       <div className="flex bg-[#12151a] p-1.5 rounded-2xl border border-white/5">
                        <button type="button" onClick={() => setFormData({...formData, type: 'LONG'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${formData.type === 'LONG' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500'}`}>BUY (LONG)</button>
                        <button type="button" onClick={() => setFormData({...formData, type: 'SHORT'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${formData.type === 'SHORT' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500'}`}>SELL (SHORT)</button>
                      </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Quantity / Lots</label>
                       <input required type="number" className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-white/20" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Avg Entry Price (Filled)</label>
                      <input required type="number" step="any" className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-bold outline-none focus:border-blue-500/30" value={formData.entryPrice} onChange={e => setFormData({...formData, entryPrice: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Avg Exit Price (Realized)</label>
                      <input required type="number" step="any" className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-mono font-bold outline-none focus:border-rose-500/30" value={formData.exitPrice} onChange={e => setFormData({...formData, exitPrice: e.target.value})} />
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="w-full py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 group">
                    Audit Strategy <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl mb-4 flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Step 2: Strategy Planning</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Audit adherence to your personal trading rules.</p>
                    </div>
                    <div className="text-right">
                       <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block tracking-widest">Trade # Today</label>
                       <select className={`bg-black/20 border rounded-lg px-3 py-1.5 text-white text-[10px] font-black outline-none transition-all ${isOvertrading ? 'border-rose-500 text-rose-500' : 'border-white/10'}`} value={formData.tradeSequenceNum} onChange={e => setFormData({...formData, tradeSequenceNum: e.target.value})}><option value="1">1st Trade (Safe)</option><option value="2">2nd Trade (Overtrade)</option><option value="3">3rd Trade (Overtrade)</option><option value="4">4+ Trades (Overtrade)</option></select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Account Context</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button type="button" onClick={() => setFormData({...formData, propAccountStage: 'PAPER'})} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${formData.propAccountStage === 'PAPER' ? 'bg-slate-600/10 border-slate-600 text-slate-400 shadow-[0_0_20px_rgba(71,85,105,0.2)]' : 'bg-[#12151a] border-white/5 text-gray-500 hover:border-white/20'}`}><i className="fa-solid fa-flask text-xs"></i><span className="text-[9px] font-black uppercase tracking-widest">Paper Trade</span></button>
                      <button type="button" onClick={() => setFormData({...formData, propAccountStage: 'EVALUATION'})} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${formData.propAccountStage === 'EVALUATION' ? 'bg-blue-600/10 border-blue-600 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-[#12151a] border-white/5 text-gray-500 hover:border-white/20'}`}><i className="fa-solid fa-graduation-cap text-xs"></i><span className="text-[9px] font-black uppercase tracking-widest">Evaluation</span></button>
                      <button type="button" onClick={() => setFormData({...formData, propAccountStage: 'LIVE'})} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${formData.propAccountStage === 'LIVE' ? 'bg-emerald-600/10 border-emerald-600 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-[#12151a] border-white/5 text-gray-500 hover:border-white/20'}`}><i className="fa-solid fa-money-bill-trend-up text-xs"></i><span className="text-[9px] font-black uppercase tracking-widest">Live Prop</span></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <div className="flex justify-between items-center mb-3">
                         <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Setup / Strategy</label>
                         <button type="button" onClick={() => setShowAddSetup(!showAddSetup)} className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:text-blue-400 transition-all"><i className={`fa-solid ${showAddSetup ? 'fa-minus' : 'fa-plus'}`}></i> {showAddSetup ? 'Cancel' : 'Manage List'}</button>
                       </div>
                       {showAddSetup ? (
                         <div className="space-y-4 animate-fadeIn">
                           <div className="flex gap-2">
                             <input className="flex-1 bg-[#12151a] border border-blue-500/20 rounded-xl px-4 py-3 text-white text-xs font-black outline-none" placeholder="Add new strategy..." value={newSetupInput} onChange={e => setNewSetupInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSetup())}/>
                             <button type="button" onClick={handleAddSetup} className="bg-blue-600 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest">Add</button>
                           </div>
                           <div className="flex flex-wrap gap-2 pt-2">
                             {availableSetups.map(s => (
                               <div key={s} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg"><span className="text-[9px] font-black text-white uppercase">{s}</span><button type="button" onClick={() => removeSetup(s)} className="text-rose-500 hover:text-rose-400"><i className="fa-solid fa-circle-xmark text-[10px]"></i></button></div>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <select className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-black outline-none cursor-pointer" value={formData.setup} onChange={e => setFormData({...formData, setup: e.target.value})}>{availableSetups.map(s => <option key={s} value={s}>{s}</option>)}</select>
                       )}
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Planned Stop Loss</label>
                       <input type="number" step="any" className="w-full bg-[#12151a] border border-rose-500/10 rounded-2xl px-6 py-4 text-white font-mono font-bold outline-none focus:border-rose-500/30" placeholder="0.00" value={formData.stopLoss} onChange={e => setFormData({...formData, stopLoss: e.target.value})} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Planned Take Profit</label>
                       <input type="number" step="any" className="w-full bg-[#12151a] border border-emerald-500/10 rounded-2xl px-6 py-4 text-white font-mono font-bold outline-none focus:border-emerald-500/30" placeholder="0.00" value={formData.takeProfit} onChange={e => setFormData({...formData, takeProfit: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 bg-white/5 text-gray-400 font-black text-xs uppercase rounded-[2rem] hover:bg-white/10 transition-all">Back</button>
                    <button type="button" onClick={() => setStep(3)} className="flex-[2] py-5 bg-white text-black font-black text-xs uppercase rounded-[2rem] hover:scale-105 transition-all">Mindset Audit <i className="fa-solid fa-brain ml-2"></i></button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex justify-between items-center mb-4"><p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Manage Sentiments</p><button type="button" onClick={() => setShowAddSentiment(!showAddSentiment)} className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:text-blue-400 transition-all"><i className={`fa-solid ${showAddSentiment ? 'fa-minus' : 'fa-plus'}`}></i> {showAddSentiment ? 'Done' : 'Add/Remove'}</button></div>
                  {showAddSentiment && (
                    <div className="space-y-4 mb-8 p-6 bg-[#12151a] border border-white/5 rounded-3xl animate-fadeIn">
                      <div className="flex gap-2"><input className="flex-1 bg-black/30 border border-blue-500/20 rounded-xl px-4 py-3 text-white text-xs font-black outline-none" placeholder="e.g. Euphoric, Revengeful..." value={newSentimentInput} onChange={e => setNewSentimentInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSentiment())}/><button type="button" onClick={handleAddSentiment} className="bg-blue-600 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest">Save</button></div>
                      <div className="flex flex-wrap gap-2 pt-2">{availableSentiments.map(s => (<div key={s} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg"><span className="text-[9px] font-black text-white uppercase">{s}</span><button type="button" onClick={() => removeSentiment(s)} className="text-rose-500 hover:text-rose-400"><i className="fa-solid fa-circle-xmark text-[10px]"></i></button></div>))}</div>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-blue-600/5 to-purple-600/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div><label className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-4 block">Psychology Before Trade</label><div className="flex flex-wrap gap-2">{availableSentiments.map(s => (<button key={s} type="button" onClick={() => setFormData({...formData, preTradeMindset: s})} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.preTradeMindset === s ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-black/20 border-white/5 text-gray-500 hover:text-gray-300'}`}>{s}</button>))}</div></div>
                    <div><label className="text-[10px] font-black uppercase text-purple-500 tracking-widest mb-4 block">Psychology During Trade</label><div className="flex flex-wrap gap-2">{availableSentiments.map(s => (<button key={s} type="button" onClick={() => setFormData({...formData, duringTradeMindset: s})} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.duringTradeMindset === s ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-black/20 border-white/5 text-gray-500 hover:text-gray-300'}`}>{s}</button>))}</div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div><label className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Stress Level ({formData.stressLevel}/10)</label><input type="range" min="1" max="10" className="w-full accent-rose-500 cursor-pointer" value={formData.stressLevel} onChange={e => setFormData({...formData, stressLevel: parseInt(e.target.value)})} /></div>
                      <div><label className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">Discipline Score ({formData.disciplineRating}/10)</label><input type="range" min="1" max="10" className="w-full accent-emerald-500 cursor-pointer" value={formData.disciplineRating} onChange={e => setFormData({...formData, disciplineRating: parseInt(e.target.value)})} /></div>
                  </div>
                  <div className="flex gap-4 pt-4"><button type="button" onClick={() => setStep(2)} className="flex-1 py-5 bg-white/5 text-gray-400 font-black text-xs uppercase rounded-[2rem] hover:bg-white/10 transition-all">Back</button><button type="button" onClick={() => setStep(4)} className="flex-[2] py-5 bg-white text-black font-black text-xs uppercase rounded-[2rem] hover:scale-105 transition-all">Final Reflection <i className="fa-solid fa-flag-checkered ml-2"></i></button></div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-[#12151a] border border-white/5 rounded-[2rem] p-8 space-y-4 font-mono text-[11px] text-gray-400">
                     <div className="border-b border-white/5 pb-4 mb-4"><p className="text-white font-black mb-1">AUDIT CONCLUSION</p><p>---------------------------------------</p></div>
                     <div className="space-y-1">
                        <p>Entry: <span className="text-white">{timeAnalytics.entryEst}</span></p>
                        <p>Exit: <span className="text-white">{timeAnalytics.exitEst}</span></p>
                        <p>Holding Time: <span className="text-blue-400 font-black">{timeAnalytics.holdingTime}</span> ({timeAnalytics.category})</p>
                        <p>Session: <span className="text-white uppercase font-black">{timeAnalytics.session}</span></p>
                        <p>Session Win Rate: <span className="text-emerald-400">61%</span></p>
                        <p>Session Profit: <span className="text-emerald-400">$763</span></p>
                     </div>
                     <div className="pt-4 border-t border-white/5 mt-4"><p>Conclusion: <span className="text-white">{timeAnalytics.session} is statistically profitable.</span></p><p>---------------------------------------</p></div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4"><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Mistakes Audit</label><button type="button" onClick={() => setShowAddMistake(!showAddMistake)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 hover:text-rose-400 transition-all"><i className={`fa-solid ${showAddMistake ? 'fa-minus' : 'fa-plus'}`}></i> {showAddMistake ? 'Done' : 'Add/Remove'}</button></div>
                    {showAddMistake && (
                      <div className="space-y-4 mb-6 p-6 bg-[#12151a] border border-white/5 rounded-3xl animate-fadeIn"><div className="flex gap-2"><input className="flex-1 bg-black/30 border border-rose-500/20 rounded-xl px-4 py-3 text-white text-xs font-black outline-none" placeholder="Describe the leak..." value={newMistakeInput} onChange={e => setNewMistakeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddMistake())}/><button type="button" onClick={handleAddMistake} className="bg-rose-600 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest">Save</button></div><div className="flex flex-wrap gap-2 pt-2">{availableMistakes.map(m => (<div key={m} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg"><span className="text-[9px] font-black text-white uppercase">{m}</span><button type="button" onClick={() => removeMistake(m)} className="text-rose-500 hover:text-rose-400"><i className="fa-solid fa-circle-xmark text-[10px]"></i></button></div>))}</div></div>
                    )}
                    <div className="flex flex-wrap gap-2">{availableMistakes.map(m => (<button key={m} type="button" onClick={() => toggleMistake(m)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${formData.mistakes.includes(m) ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'}`}>{m === 'Overtrading' && isOvertrading ? '⚠️ OVERTRADING (DETECTOR)' : m}</button>))}</div>
                  </div>
                  <div><label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4 block">Post-Trade Reflection</label><textarea className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-medium outline-none min-h-[120px] focus:border-blue-500/30" placeholder="How do you feel after the exit? Lessons learned for next time..." value={formData.postTradeMindset} onChange={e => setFormData({...formData, postTradeMindset: e.target.value})} /></div>
                  <div className="flex gap-4 pt-4"><button type="button" onClick={() => setStep(3)} className="flex-1 py-5 bg-white/5 text-gray-400 font-black text-xs uppercase rounded-[2rem] hover:bg-white/10 transition-all">Back</button><button type="submit" className="flex-[3] py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Publish Professional Audit</button></div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewTradeModal;
