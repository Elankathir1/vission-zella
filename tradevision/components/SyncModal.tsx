
import React, { useState } from 'react';

const SyncModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [syncing, setSyncing] = useState(false);
  const [mode, setMode] = useState<'broker' | 'csv'>('broker');

  const brokers = [
    { name: 'TD Ameritrade', logo: 'fa-building-columns' },
    { name: 'Interactive Brokers', logo: 'fa-globe' },
    { name: 'Robinhood', logo: 'fa-leaf' },
    { name: 'PropFirm X', logo: 'fa-shield-halved' }
  ];

  const handleSync = () => {
    setSyncing(true);
    // Simulate sync delay
    setTimeout(() => {
      setSyncing(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-fadeIn p-4">
      <div className="w-full max-w-xl bg-[#0b0e11] border border-white/10 rounded-[3.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
          <div className="flex bg-[#12151a] p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setMode('broker')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'broker' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >Broker Sync</button>
            <button 
              onClick={() => setMode('csv')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'csv' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >CSV Import</button>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className="p-10">
          {!syncing ? (
            <div className="space-y-8 animate-fadeIn">
              {mode === 'broker' ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Connect Terminal</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Establish a real-time data link with your broker</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {brokers.map(b => (
                      <button 
                        key={b.name}
                        onClick={handleSync}
                        className="p-6 bg-[#12151a] border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                      >
                        <i className={`fa-solid ${b.logo} text-2xl text-gray-500 group-hover:text-blue-500`}></i>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                   <div className="text-center">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Upload CSV</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Import history from unsupported platforms</p>
                  </div>

                  <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-file-csv text-2xl"></i>
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-widest mb-2">Drop execution file here</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Supports .csv, .xlsx, .txt</p>
                    <input type="file" className="hidden" />
                  </div>

                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Recent Imports</p>
                    <div className="text-[10px] font-bold text-gray-700 italic">No files imported in the last 30 days.</div>
                  </div>
                </div>
              )}

              <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                   <i className="fa-solid fa-shield-halved"></i> Privacy Secure
                 </p>
                 <p className="text-[9px] text-gray-600 leading-relaxed uppercase font-bold">
                   Data is processed locally for CSVs. Broker sync uses AES-256 bank-level encryption.
                 </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 animate-fadeIn">
               <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">Establishing Link</h3>
               <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">Authenticating with institutional gateway...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
