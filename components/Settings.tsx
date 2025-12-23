
import React, { useState, useEffect } from 'react';
import { SessionConfig } from '../types';

interface SettingsProps {
  propFirms: string[];
  onAddFirm: (name: string) => void;
  onRemoveFirm: (name: string) => void;
  sessionConfig: SessionConfig;
  onUpdateSessionConfig: (config: SessionConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  propFirms, 
  onAddFirm, 
  onRemoveFirm, 
  sessionConfig, 
  onUpdateSessionConfig 
}) => {
  const [newFirm, setNewFirm] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [localSessionConfig, setLocalSessionConfig] = useState<SessionConfig>(sessionConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const accessType = localStorage.getItem('access_type');
  const isAdmin = accessType === 'ADMIN';
  const isGuest = accessType === 'GUEST';

  useEffect(() => {
    setLocalSessionConfig(sessionConfig);
  }, [sessionConfig]);

  const handleAdd = () => {
    if (isGuest) return;
    if (newFirm.trim()) {
      onAddFirm(newFirm.trim());
      setNewFirm('');
    }
  };

  const handleForceSync = () => {
    if (isGuest) return;
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  const handleLocalSessionChange = (session: keyof SessionConfig, field: 'start' | 'end', value: string) => {
    if (isGuest) return;
    setLocalSessionConfig(prev => ({
      ...prev,
      [session]: {
        ...prev[session],
        [field]: value
      }
    }));
    setSaveSuccess(false);
  };

  const handleSaveSessions = () => {
    if (isGuest) return;
    setIsSaving(true);
    setSaveSuccess(false);
    onUpdateSessionConfig(localSessionConfig);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const hasChanges = JSON.stringify(localSessionConfig) !== JSON.stringify(sessionConfig);

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">System <span className="text-blue-500">Settings</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">Configure terminal environment</p>
        </div>
        
        {isGuest && (
          <div className="bg-rose-500/10 border border-rose-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
            <i className="fa-solid fa-eye text-rose-500"></i>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">View Only Mode – Admin access required</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <section className={`bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative ${isGuest ? 'opacity-70' : ''}`}>
             <div className="mb-10 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Trading <span className="text-blue-500">Sessions</span></h3>
                  <p className="text-[10px] font-black text-gray-500 mt-1 uppercase tracking-widest">Configuration for temporal intelligence</p>
                </div>
             </div>
             
             <div className="space-y-4 mb-10">
                {(Object.keys(localSessionConfig) as Array<keyof SessionConfig>).map((session) => (
                   <div key={session} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4 min-w-[140px]">
                         <span className="text-sm font-black text-white uppercase tracking-widest">{session}</span>
                      </div>
                      <div className="flex flex-1 items-center gap-4">
                         <input disabled={isGuest} type="text" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-mono font-bold outline-none" value={localSessionConfig[session].start} onChange={(e) => handleLocalSessionChange(session, 'start', e.target.value)} />
                         <span className="text-gray-600 font-bold">TO</span>
                         <input disabled={isGuest} type="text" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-mono font-bold outline-none" value={localSessionConfig[session].end} onChange={(e) => handleLocalSessionChange(session, 'end', e.target.value)} />
                      </div>
                   </div>
                ))}
             </div>

             <div className="flex justify-end pt-8 border-t border-white/5">
                <button 
                  onClick={handleSaveSessions}
                  disabled={isSaving || !hasChanges || isGuest}
                  className={`px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${!hasChanges || isGuest ? 'bg-white/5 text-gray-600' : 'bg-blue-600 text-white shadow-xl'}`}
                >
                  {isGuest ? 'Editing Locked' : 'Update Configuration'}
                </button>
             </div>
          </section>
        </div>

        <div className="space-y-8">
           <div className={`bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative ${isGuest ? 'opacity-70' : ''}`}>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Cloud Sync Status</p>
              <button disabled={isGuest} onClick={handleForceSync} className={`w-full py-4 border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isGuest ? 'bg-white/5 text-gray-600' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                {syncing ? 'Establishing Link...' : (isGuest ? 'Sync Locked' : 'Force Re-Sync')}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
