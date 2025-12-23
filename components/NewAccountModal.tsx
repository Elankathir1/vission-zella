
import React, { useState } from 'react';
import { Account, AccountType, DrawdownType } from '../types';

interface NewAccountModalProps {
  onClose: () => void;
  onAdd: (account: Account) => void;
  availablePropFirms: string[];
}

const NewAccountModal: React.FC<NewAccountModalProps> = ({ onClose, onAdd, availablePropFirms }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'PROP' as AccountType,
    balance: '',
    broker: availablePropFirms[0] || 'Tradovate',
    dailyDrawdownLimit: '5',
    overallDrawdownLimit: '10',
    drawdownType: 'EQUITY' as DrawdownType,
    profitTarget: '10',
    maxTradesPerDay: '2', // Default limit
    maxLossPerDay: '',
    maxLots: '',
    maxTradingDays: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount: Account = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.balance) || 0,
      broker: formData.broker,
      dailyDrawdownLimit: parseFloat(formData.dailyDrawdownLimit),
      overallDrawdownLimit: parseFloat(formData.overallDrawdownLimit),
      drawdownType: formData.drawdownType,
      profitTarget: parseFloat(formData.profitTarget),
      maxTradesPerDay: parseInt(formData.maxTradesPerDay) || undefined,
      maxLossPerDay: parseFloat(formData.maxLossPerDay) || undefined,
      maxLots: formData.maxLots ? parseFloat(formData.maxLots) : undefined,
      maxTradingDays: formData.maxTradingDays ? parseInt(formData.maxTradingDays) : undefined
    };
    onAdd(newAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fadeIn p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0b0e11] border border-white/10 rounded-[3.5rem] shadow-2xl overflow-hidden animate-slideInUp my-8">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Connect Portfolio</h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Institutional Terminal Sync</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all flex items-center justify-center">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Account Name</label>
                <input 
                  required 
                  autoFocus
                  className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all" 
                  placeholder="e.g. Prop Evaluation 100K"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Account Category</label>
                <div className="flex bg-[#12151a] p-1.5 rounded-2xl border border-white/5 gap-2">
                  {(['PROP', 'PERSONAL', 'IRA'] as AccountType[]).map(type => (
                    <button 
                      key={type}
                      type="button" 
                      onClick={() => setFormData({...formData, type})}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black tracking-widest transition-all ${
                        formData.type === type ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Prop Firm / Broker</label>
                <select 
                  className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none cursor-pointer appearance-none"
                  value={formData.broker}
                  onChange={e => setFormData({...formData, broker: e.target.value})}
                >
                  {formData.type === 'PROP' ? (
                    availablePropFirms.map(f => <option key={f} value={f}>{f}</option>)
                  ) : (
                    <>
                      <option value="IBKR">IBKR</option>
                      <option value="Schwab">Schwab</option>
                      <option value="Fidelity">Fidelity</option>
                      <option value="Robinhood">Robinhood</option>
                      <option value="Tradovate">Tradovate</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Account Size (Balance)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input 
                    required 
                    type="number" 
                    className="w-full bg-[#12151a] border border-white/5 rounded-2xl pl-10 pr-6 py-4 text-white font-mono font-bold outline-none focus:border-white/20" 
                    value={formData.balance} 
                    onChange={e => setFormData({...formData, balance: e.target.value})} 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Profit Target (%)</label>
                <input 
                  type="number" 
                  className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none"
                  value={formData.profitTarget}
                  onChange={e => setFormData({...formData, profitTarget: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Personal Trading Rules (Limits)</p>
                <span className="text-[8px] font-black text-gray-700 uppercase">Use these to prevent overtrading</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Max Trades Per Day</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 2"
                    className="w-full bg-[#12151a] border border-blue-500/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500/30" 
                    value={formData.maxTradesPerDay} 
                    onChange={e => setFormData({...formData, maxTradesPerDay: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Max Daily Loss ($)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500"
                    className="w-full bg-[#12151a] border border-rose-500/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-rose-500/30" 
                    value={formData.maxLossPerDay} 
                    onChange={e => setFormData({...formData, maxLossPerDay: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {formData.type === 'PROP' && (
              <div className="pt-6 border-t border-white/5 space-y-6">
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Prop Firm Drawdown Specs</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Daily Drawdown (%)</label>
                    <input type="number" className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none" value={formData.dailyDrawdownLimit} onChange={e => setFormData({...formData, dailyDrawdownLimit: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">Overall Drawdown (%)</label>
                    <input type="number" className="w-full bg-[#12151a] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none" value={formData.overallDrawdownLimit} onChange={e => setFormData({...formData, overallDrawdownLimit: e.target.value})} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-5 bg-white/5 text-gray-500 font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-all">
              Initialize Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAccountModal;
