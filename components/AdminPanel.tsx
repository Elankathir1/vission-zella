
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const accessType = localStorage.getItem('access_type');
  const isAdmin = accessType === 'ADMIN';

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('admin_password') || 'admin123';

    if (currentPassword !== storedPassword) {
      setMsg({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    localStorage.setItem('admin_password', newPassword);
    setMsg({ type: 'success', text: 'Admin access key updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-fadeIn text-center p-6">
        <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mb-8 shadow-2xl shadow-rose-500/20">
          <i className="fa-solid fa-lock text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Access Denied</h2>
        <p className="text-xs font-bold text-gray-600 uppercase mt-3 tracking-widest max-w-sm">Admin credentials required to enter the institutional management terminal.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-10 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Admin <span className="text-blue-500">Panel</span></h1>
        <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">Institutional Platform Management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Active Operators', value: '1', icon: 'fa-user-check', color: 'blue' },
          { label: 'Uptime Reliability', value: '100%', icon: 'fa-bolt', color: 'emerald' },
          { label: 'System Health', value: 'Nominal', icon: 'fa-heartbeat', color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${stat.color}-500/5 blur-[60px] rounded-full`}></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{stat.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tight mb-2">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-[#12151a] p-10 rounded-[4rem] border border-rose-500/10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500"><i className="fa-solid fa-shield-halved"></i></div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Terminal <span className="text-rose-500">Security</span></h3>
              <p className="text-[10px] font-black text-gray-600 mt-1 uppercase tracking-widest">Rotate Admin Access Credentials</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block tracking-widest px-2">Operator ID (Fixed)</label>
              <input readOnly value="admin123" className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-gray-500 font-bold outline-none cursor-not-allowed uppercase tracking-widest text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block tracking-widest px-2">Current Access Key</label>
              <input type="password" required className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-rose-500/30 transition-all" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block tracking-widest px-2">New Access Key</label>
                <input type="password" required className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-rose-500/30 transition-all" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block tracking-widest px-2">Confirm Key</label>
                <input type="password" required className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-rose-500/30 transition-all" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            {msg.text && (
              <div className={`p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${msg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'}`}>
                <i className={`fa-solid ${msg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                <p className="text-[10px] font-black uppercase tracking-widest">{msg.text}</p>
              </div>
            )}

            <button type="submit" className="w-full py-5 bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] shadow-xl hover:scale-[1.01] transition-all">Commit Access Update</button>
          </form>
        </section>

        <section className="bg-[#12151a] p-10 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col justify-start">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Operator List</h3>
          <div className="flex items-center justify-between p-6 bg-blue-600/5 border border-blue-600/10 rounded-[2.5rem]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black text-lg uppercase shadow-inner">E</div>
              <div>
                <p className="text-lg font-black text-white uppercase tracking-tight">Elankathir</p>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Master Institutional Operator</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ACTIVE</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
