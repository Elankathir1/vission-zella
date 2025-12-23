
import React, { useState } from 'react';
import { signUpUser, signInUser } from '../services/firebase.js';

interface LandingPageProps {
  onAccessGranted: (accessType: 'ADMIN' | 'USER' | 'GUEST', email?: string) => void;
}

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'yopmail.com', 'temp-mail.org', '10minutemail.com', 
  'guerrillamail.com', 'sharklasers.com', 'dispostable.com', 'burnermail.io'
];

const LandingPage: React.FC<LandingPageProps> = ({ onAccessGranted }) => {
  const [view, setView] = useState<'CHOICE' | 'ADMIN_LOGIN' | 'SIGN_IN' | 'SIGN_UP'>('CHOICE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(''); // For Admin
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (emailStr: string) => {
    const domain = emailStr.split('@')[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return false;
    }
    return true;
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('admin_password') || 'admin123';
    if (username === 'admin123' && password === storedPassword) {
      onAccessGranted('ADMIN');
    } else {
      setError('Invalid terminal credentials!');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode('');
    if (!validateEmail(email)) {
      setError('Temporary email address not allowed. Please use a valid email.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signUpUser(email, password);
      onAccessGranted('USER', userCredential.user.email || email);
    } catch (err: any) {
      console.error("Firebase Auth Exception:", err.code, err.message);
      setErrorCode(err.code);
      
      if (err.code === 'auth/configuration-not-found') {
        setError('TERMINAL CONFIGURATION ERROR: Authentication Service not provisioned in Backend.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('PROVIDER DISABLED: Email/Password sign-in is not enabled in the Firebase Console.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('OPERATOR REGISTERED: This email is already in the system. Sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('SECURITY RISK: Access key must be at least 6 characters.');
      } else {
        setError(err.message || 'SYSTEM ERROR: The authentication pipeline has failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setLoading(true);
    try {
      const userCredential = await signInUser(email, password);
      onAccessGranted('USER', userCredential.user.email || email);
    } catch (err: any) {
      console.error("Firebase Auth Exception:", err.code, err.message);
      setErrorCode(err.code);

      if (err.code === 'auth/configuration-not-found') {
        setError('TERMINAL CONFIGURATION ERROR: Authentication Service missing in Backend.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('PROVIDER DISABLED: The Email/Password provider is disabled in your Firebase Console.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('ACCESS DENIED: Invalid operator email or access key.');
      } else {
        setError('SYSTEM ERROR: Terminal authentication failed. Check connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    onAccessGranted('GUEST');
  };

  const isConfigError = errorCode === 'auth/configuration-not-found' || errorCode === 'auth/operation-not-allowed';

  return (
    <div className="fixed inset-0 z-[200] bg-[#0b0e11] flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full"></div>
      
      <div className="relative w-full max-w-xl bg-[#12151a] border border-white/5 rounded-[4rem] p-12 shadow-2xl animate-slideInUp">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/40 mx-auto mb-8 animate-bounce">
            <i className="fa-solid fa-terminal text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Vision<span className="text-blue-500">Zella</span>
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Proprietary Trading Terminal</p>
        </div>

        {view === 'CHOICE' ? (
          <div className="space-y-4">
            <button 
              onClick={() => setView('SIGN_IN')}
              className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              Operator Sign In
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setView('ADMIN_LOGIN')}
                className="py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
              >
                Admin Terminal
              </button>
              <button 
                onClick={handleGuestAccess}
                className="py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
              >
                Guest View
              </button>
            </div>
            <p className="text-center pt-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
              Don't have an account? <button onClick={() => setView('SIGN_UP')} className="text-blue-500 hover:underline">Sign Up</button>
            </p>
          </div>
        ) : (
          <form onSubmit={view === 'ADMIN_LOGIN' ? handleAdminLogin : (view === 'SIGN_UP' ? handleSignUp : handleSignIn)} className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              {view === 'ADMIN_LOGIN' ? (
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block px-2">Operator ID</label>
                  <input autoFocus type="text" className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all" placeholder="admin123" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block px-2">Email Address</label>
                  <input autoFocus type="email" required className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all" placeholder="operator@firm.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block px-2">Access Key</label>
                <div className="relative flex items-center">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 pr-16 text-white font-bold outline-none focus:border-blue-500/50 transition-all" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 text-gray-500 hover:text-blue-500 transition-colors focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex flex-col gap-4 shadow-lg shadow-rose-500/5 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-triangle-exclamation text-rose-500 shrink-0 text-lg"></i>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-relaxed">
                    {error}
                  </p>
                </div>
                {isConfigError && (
                  <div className="space-y-4 bg-black/40 p-5 rounded-3xl border border-rose-500/10">
                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest border-b border-rose-500/10 pb-2">CRITICAL SYSTEM REPAIR REQ:</p>
                    <ol className="space-y-3">
                      <li className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed flex gap-3">
                        <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0 font-black">1</span>
                        <span>Open <strong className="text-white underline">Firebase Console</strong> for project <strong className="text-blue-400">tradetrack-pro-35138</strong>.</span>
                      </li>
                      <li className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed flex gap-3">
                        <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0 font-black">2</span>
                        <span>Navigate to <strong className="text-white">Authentication</strong> &rarr; <strong className="text-white">Sign-in method</strong>.</span>
                      </li>
                      <li className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed flex gap-3">
                        <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0 font-black">3</span>
                        <span>{errorCode === 'auth/configuration-not-found' ? 'Click "Get Started" to initialize Auth.' : 'Enable "Email/Password" and click Save.'}</span>
                      </li>
                      <li className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed flex gap-3">
                        <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0 font-black">4</span>
                        <span>Refresh this terminal and re-attempt {view === 'SIGN_UP' ? 'initialization' : 'link establishment'}.</span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button type="button" disabled={loading} onClick={() => setView('CHOICE')} className="flex-1 py-5 bg-white/5 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Back</button>
              <button type="submit" disabled={loading} className="flex-[2] py-5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-blue-500 transition-all disabled:opacity-50">
                {loading ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  view === 'SIGN_UP' ? 'Initialize Operator' : 'Establish Link'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
