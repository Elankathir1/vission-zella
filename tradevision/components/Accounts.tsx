
import React from 'react';
import { Account } from '../types';

interface AccountsProps {
  accounts: Account[];
  onAddAccount: () => void;
}

const Accounts: React.FC<AccountsProps> = ({ accounts, onAddAccount }) => {
  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Multi-Account <span className="text-blue-500">Terminal</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">Aggregate performance across all portfolios</p>
        </div>
        <button 
          onClick={onAddAccount}
          className="px-8 py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-plus mr-2"></i> Add Account
        </button>
      </header>

      {/* Global Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Equity', value: `$${accounts.reduce((a, b) => a + b.balance, 0).toLocaleString()}`, sub: 'Across All Accounts', icon: 'fa-vault', color: 'blue' },
          { label: 'Active Funding', value: `${accounts.length} Accounts`, sub: 'Verified External Links', icon: 'fa-link', color: 'emerald' },
          { label: 'Portfolio Diversity', value: `${[...new Set(accounts.map(a => a.type))].length} Types`, sub: 'Strategic Allocation', icon: 'fa-chart-pie', color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${stat.color}-500/5 blur-[60px] rounded-full`}></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{stat.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tight mb-2">{stat.value}</h3>
            <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {accounts.map((acc, idx) => (
          <div key={acc.id || idx} className="bg-[#12151a] p-10 rounded-[4rem] border border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-all shadow-2xl">
             <div className="absolute top-0 right-0 p-10 z-10">
                <span className="text-[9px] font-black px-4 py-1.5 rounded-full border tracking-widest bg-emerald-500/5 text-emerald-400 border-emerald-500/10 uppercase">ACTIVE</span>
             </div>
             
             <div className="relative z-10">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">{acc.type} ACCOUNT</p>
                <h3 className="text-2xl font-black text-white mb-10 tracking-tighter">{acc.name}</h3>
                
                <div className="space-y-8">
                   <div>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Live Equity</p>
                      <p className="text-4xl font-black text-white font-mono tracking-tighter">${acc.balance.toLocaleString()}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                      <div>
                        <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Status</p>
                        <p className="text-sm font-black text-emerald-400 uppercase">Synchronized</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Type</p>
                        <p className="text-sm font-black text-white uppercase">{acc.type}</p>
                      </div>
                   </div>

                   <div className="flex justify-between items-center pt-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs text-gray-400">
                           <i className="fa-solid fa-server"></i>
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{acc.broker}</span>
                      </div>
                      <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors">Manage Link</button>
                   </div>
                </div>
             </div>
          </div>
        ))}

        {/* Add New Account Card */}
        <div 
          onClick={onAddAccount}
          className="border-2 border-dashed border-white/5 p-10 rounded-[4rem] flex flex-col items-center justify-center group cursor-pointer hover:bg-white/[0.01] hover:border-blue-500/20 transition-all"
        >
           <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-all mb-6">
              <i className="fa-solid fa-plus text-2xl"></i>
           </div>
           <p className="text-sm font-black text-white uppercase tracking-widest mb-2">Connect New Account</p>
           <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center px-8">Expand your portfolio terminal tracking capabilities</p>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="bg-gradient-to-r from-blue-600/5 to-transparent border border-white/5 p-8 rounded-[3rem] flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 animate-pulse">
               <i className="fa-solid fa-cloud-arrow-down"></i>
            </div>
            <div>
               <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Sync Service: Active</p>
               <p className="text-[10px] font-medium text-gray-600 uppercase">Last updated: Just now via Institutional Gateway</p>
            </div>
         </div>
         <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
            Refresh Gateway
         </button>
      </div>
    </div>
  );
};

export default Accounts;
