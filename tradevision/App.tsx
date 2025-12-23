
import React, { useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ScrollToTop from "./ScrollToTop.tsx";
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TradeLog from './components/TradeLog';
import AIAnalytics from './components/AIAnalytics';
import Playbook from './components/Playbook';
import Calendar from './components/Calendar';
import Backtesting from './components/Backtesting';
import Notebook from './components/Notebook';
import Accounts from './components/Accounts';
import University from './components/University';
import PsychologyHub from './components/PsychologyHub';
import RiskAnalytics from './components/RiskAnalytics';
import PerformanceAudit from './components/PerformanceAudit';
import ExecutionGrading from './components/ExecutionGrading';
import TradePlanner from './components/TradePlanner';
import Settings from './components/Settings';
import MindsetCoach from './components/MindsetCoach';
import AdminPanel from './components/AdminPanel';
import TradeDetailModal from './components/TradeDetailModal';
import NewTradeModal from './components/NewTradeModal';
import NewAccountModal from './components/NewAccountModal';
import SyncModal from './components/SyncModal';
import TemporalPerformanceInsights from './components/TemporalPerformanceInsights';
import LandingPage from './components/LandingPage';
import { INITIAL_TRADES } from './constants';
import { Trade, Account, TradePlan, SessionConfig } from './types';
import { watchAuthStatus, logoutUser, syncUserTrades } from './services/firebase.js';

const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Apex Prop 1', type: 'PROP', balance: 50420, broker: 'Apex', maxTradesPerDay: 2 },
  { id: 'acc-2', name: 'Personal Cash', type: 'PERSONAL', balance: 12400, broker: 'IBKR', maxTradesPerDay: 5 },
  { id: 'acc-3', name: 'IRA Swing', type: 'IRA', balance: 85000, broker: 'Schwab', maxTradesPerDay: 1 }
];

const INITIAL_PROP_FIRMS = ['Apex', 'Topstep', 'MyFundedFX', 'FTMO', 'Earn2Trade'];

const DEFAULT_SESSIONS: SessionConfig = {
  Asian: { start: "00:00", end: "09:00" },
  London: { start: "08:00", end: "17:00" },
  NewYork: { start: "13:00", end: "22:00" }
};

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  
  // Default active tab to 'admin' if path is empty
  const activeTab = useMemo(() => location.pathname.split('/')[1] || 'admin', [location.pathname]);

  const [accessType, setAccessType] = useState<'ADMIN' | 'USER' | 'GUEST' | null>(() => {
    return (localStorage.getItem('access_type') as any) || null;
  });
  
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('current_user_email') || null;
  });

  const [trades, setTrades] = useState<Trade[]>([]);
  const [plans, setPlans] = useState<TradePlan[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [propFirms, setPropFirms] = useState<string[]>(INITIAL_PROP_FIRMS);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>(DEFAULT_SESSIONS);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-1');

  useEffect(() => {
    let unsubscribeTrades: (() => void) | undefined;

    const unsubscribeAuth = watchAuthStatus((user) => {
      if (user) {
        const currentType = localStorage.getItem('access_type');
        if (currentType !== 'ADMIN') {
          localStorage.setItem('access_type', 'USER');
          localStorage.setItem('current_user_email', user.email || '');
          setAccessType('USER');
          setCurrentUserEmail(user.email);
        }
        
        if (unsubscribeTrades) unsubscribeTrades();
        
        unsubscribeTrades = syncUserTrades(user.uid, (data) => {
          startTransition(() => {
            if (data) {
              setTrades(Object.values(data) as Trade[]);
            }
          });
        });
      } else {
        const currentType = localStorage.getItem('access_type');
        if (currentType === 'USER') {
          handleLogout();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTrades) unsubscribeTrades();
    };
  }, []);

  useEffect(() => {
    if (!accessType) return;
    startTransition(() => {
      if (accessType === 'GUEST') {
        setTrades(INITIAL_TRADES);
      } else if (accessType === 'ADMIN') {
        const savedTrades = localStorage.getItem('trades_admin');
        setTrades(savedTrades ? JSON.parse(savedTrades) : []);
      }
    });
  }, [accessType]);

  const handleAccessGranted = (type: 'ADMIN' | 'USER' | 'GUEST', email?: string) => {
    localStorage.setItem('access_type', type);
    localStorage.setItem('admin', type === 'ADMIN' ? 'yes' : 'no');
    localStorage.setItem('visionZella_access', 'granted');
    if (email) {
      localStorage.setItem('current_user_email', email);
      setCurrentUserEmail(email);
    }
    setAccessType(type);
    window.dispatchEvent(new Event('storage'));
    // Redirect to Admin Panel immediately after successful auth
    navigate('/admin', { replace: true });
  };

  const handleLogout = useCallback(async () => {
    try { await logoutUser(); } catch (e) {}
    localStorage.removeItem('access_type');
    localStorage.removeItem('current_user_email');
    setAccessType(null);
    setCurrentUserEmail(null);
    setTrades([]);
    navigate('/', { replace: true });
  }, [navigate]);

  const handleOpenAuditWizard = () => {
    if (accessType === 'GUEST') {
      window.alert("Sign in required to enter trade data.");
    } else {
      setIsNewTradeModalOpen(true);
    }
  };

  // Auth Guard: If not logged in, show Landing Page (Sign In)
  if (!accessType) return <LandingPage onAccessGranted={handleAccessGranted} />;

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="flex min-h-screen bg-[#0b0e11] text-slate-200 overflow-hidden">
      <ScrollToTop />
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { startTransition(() => navigate(`/${tab}`)); setIsSidebarOpen(false); }} 
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
        accounts={accounts}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        accessType={accessType}
        onLogout={handleLogout}
      />
      
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-opacity duration-200 ${isPending ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>
        <main className="flex-1 overflow-y-auto p-4 md:p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto pt-4">
            <div className="hidden lg:flex justify-end mb-10 items-center gap-4">
               <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black text-blue-400 bg-blue-500/5 px-4 py-3 rounded-xl border border-blue-500/10 hover:bg-blue-500/10 uppercase tracking-widest transition-all">
                 <i className="fa-solid fa-rotate"></i> Sync Broker
               </button>
               <button onClick={handleOpenAuditWizard} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-2 ${accessType === 'GUEST' ? 'bg-white/10 text-gray-500' : 'bg-white text-black hover:scale-105 active:scale-95'}`}>
                 <i className={`fa-solid ${accessType === 'GUEST' ? 'fa-lock' : 'fa-plus'}`}></i> 
                 {accessType === 'GUEST' ? 'Sign In' : 'New Journal Entry'}
               </button>
            </div>
            
            <Routes>
              {/* Force Admin Panel as the default home page */}
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/admin" element={<AdminPanel />} />
              
              <Route path="/dashboard" element={<Dashboard trades={trades} />} />
              <Route path="/trades" element={<TradeLog trades={trades} onSelectTrade={setSelectedTrade} />} />
              <Route path="/temporal" element={<TemporalPerformanceInsights trades={trades} />} />
              <Route path="/grading" element={<ExecutionGrading trades={trades} account={selectedAccount} />} />
              <Route path="/performance" element={<PerformanceAudit trades={trades} />} />
              <Route path="/coach" element={<MindsetCoach />} />
              <Route path="/risk" element={<RiskAnalytics trades={trades} />} />
              <Route path="/psychology" element={<PsychologyHub trades={trades} />} />
              <Route path="/analytics" element={<AIAnalytics trades={trades} />} />
              <Route path="/accounts" element={<Accounts accounts={accounts} onAddAccount={() => setIsNewAccountModalOpen(true)} />} />
              <Route path="/planner" element={<TradePlanner plans={plans} onAddPlan={(p) => setPlans(prev => [p, ...prev])} />} />
              <Route path="/calendar" element={<Calendar trades={trades} />} />
              <Route path="/playbook" element={<Playbook trades={trades} />} />
              <Route path="/settings" element={<Settings propFirms={propFirms} onAddFirm={f => setPropFirms(p => [...p, f])} onRemoveFirm={f => setPropFirms(p => p.filter(x => x !== f))} sessionConfig={sessionConfig} onUpdateSessionConfig={setSessionConfig} />} />
              
              {/* Fallback all routes to Admin Panel */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {selectedTrade && <TradeDetailModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />}
      {isNewTradeModalOpen && <NewTradeModal onClose={() => setIsNewTradeModalOpen(false)} onAdd={t => setTrades(p => [t, ...p])} existingTrades={trades} sessionConfig={sessionConfig} />}
      {isNewAccountModalOpen && <NewAccountModal onClose={() => setIsNewAccountModalOpen(false)} onAdd={a => setAccounts(p => [...p, a])} availablePropFirms={propFirms} />}
      {isSyncModalOpen && <SyncModal onClose={() => setIsSyncModalOpen(false)} />}
    </div>
  );
};

export default App;
