
import React, { useState, useRef, useEffect, memo } from 'react';
import { useNavigate } from "react-router-dom";
import { useForceScrollTop } from '../useForceScrollTop';
import { Account } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  accounts: Account[];
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  user?: any;
  accessType?: 'ADMIN' | 'USER' | 'GUEST';
  onLoginRequest?: () => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(({ 
  activeTab, 
  setActiveTab, 
  selectedAccountId, 
  setSelectedAccountId,
  accounts,
  isOpen, 
  setIsOpen,
  user,
  accessType = 'GUEST',
  onLoginRequest,
  onLogout
}) => {
  const navigate = useNavigate();
  const scrollTop = useForceScrollTop();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const menuGroups = [
    {
      title: 'Analyze',
      items: [
        { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', to: '/dashboard' },
        { id: 'trades', icon: 'fa-list-ul', label: 'Trade Log', to: '/trades' },
        { id: 'temporal', icon: 'fa-clock-rotate-left', label: 'Temporal IQ', to: '/temporal' },
        { id: 'grading', icon: 'fa-award', label: 'Gradebook', to: '/grading' },
        { id: 'performance', icon: 'fa-chart-column', label: 'Audit', to: '/performance' },
        { id: 'risk', icon: 'fa-shield-halved', label: 'Risk Analytics', to: '/risk' },
        { id: 'psychology', icon: 'fa-brain', label: 'Psychology', to: '/psychology' },
        { id: 'analytics', icon: 'fa-bolt', label: 'Zella AI', to: '/analytics' },
        { id: 'calendar', icon: 'fa-calendar-days', label: 'Calendar', to: '/calendar' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { id: 'coach', icon: 'fa-comment-dots', label: 'Mindset AI', to: '/coach' },
        { id: 'planner', icon: 'fa-pen-ruler', label: 'Planner', to: '/planner' },
        { id: 'playbook', icon: 'fa-book-open', label: 'Playbooks', to: '/playbook' },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'accounts', icon: 'fa-wallet', label: 'Accounts', to: '/accounts' },
        { id: 'settings', icon: 'fa-gear', label: 'Settings', to: '/settings' },
      ]
    }
  ];

  const handleNavClick = (id: string, to: string) => {
    navigate(to);
    if (setIsOpen) setIsOpen(false);
    requestAnimationFrame(() => scrollTop());
  };

  const handleAuditWizardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (accessType === 'GUEST') {
      window.alert("Sign in required to enter trade data. Guest mode is view-only.");
    } else {
      window.dispatchEvent(new CustomEvent('openTradeWizard'));
    }
  };

  const handleAdminPanelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use the navigation helper to ensure consistent UI state
    handleNavClick('admin', '/admin');
  };

  return (
    <div className={`fixed inset-y-0 left-0 lg:static z-50 w-72 bg-[#0b0e11] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-8 pb-10 flex items-center justify-between">
        {/* Updated logo to navigate to Admin Panel instead of Dashboard */}
        <button onClick={() => handleNavClick('admin', '/admin')} className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 ring-4 ring-blue-600/10">
            <i className="fa-solid fa-terminal text-white text-lg"></i>
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">Vision<span className="text-blue-500">Zella</span></span>
        </button>
      </div>

      <div className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide pb-10">
        <div className="space-y-1">
          <p className="px-4 text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Core Actions</p>
          <button onClick={handleAuditWizardClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group border border-transparent hover:bg-blue-600/5 hover:border-blue-600/10 ${accessType === 'GUEST' ? 'opacity-70' : ''}`}>
            <i className={`fa-solid ${accessType === 'GUEST' ? 'fa-lock' : 'fa-plus'} w-5 text-center text-base ${accessType === 'GUEST' ? 'text-gray-600' : 'text-blue-500'}`}></i>
            <div className="flex-1 flex items-center justify-between">
              <span className="font-bold text-[11px] tracking-widest uppercase">Trade Audit Wizard</span>
              {accessType === 'GUEST' && <i className="fa-solid fa-shield text-[8px] text-gray-700"></i>}
            </div>
          </button>
        </div>

        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <p className="px-4 text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-4">{group.title}</p>
            {group.items.map((item) => (
              <button key={item.id} onClick={() => handleNavClick(item.id, item.to)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-white/[0.03] border border-white/5 text-white shadow-xl shadow-black/20' : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.02] border border-transparent'}`}>
                <i className={`fa-solid ${item.icon} w-5 text-center text-base ${activeTab === item.id ? 'text-blue-500' : 'text-gray-600 group-hover:text-gray-400'}`}></i>
                <div className="flex-1 flex items-center justify-between"><span className="font-bold text-[11px] tracking-widest uppercase">{item.label}</span></div>
              </button>
            ))}
          </div>
        ))}

        <ul className="space-y-1 mt-6">
          <li className="group">
            <p className="px-4 text-[9px] font-black text-rose-500 uppercase tracking-[0.4em] mb-4">Privileged</p>
            <a href="#/admin" onClick={handleAdminPanelClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 border border-transparent ${activeTab === 'admin' ? 'bg-rose-500/10 text-white border-rose-500/20 shadow-xl' : 'text-gray-500 hover:text-rose-400 hover:bg-rose-500/5'}`}>
              <i className={`fa-solid fa-user-shield w-5 text-center text-base ${activeTab === 'admin' ? 'text-rose-500' : 'text-gray-600 group-hover:text-rose-500'}`}></i>
              <div className="flex-1 flex items-center justify-between">
                <span className="font-bold text-[11px] tracking-widest uppercase">Admin Panel</span>
                {accessType !== 'ADMIN' && <i className="fa-solid fa-lock text-[8px] text-gray-700"></i>}
              </div>
            </a>
          </li>
        </ul>
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40" ref={dropdownRef}>
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.01] border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5 flex items-center justify-center font-black text-white shadow-lg shrink-0 uppercase text-xs">
            {accessType?.charAt(0) || 'G'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{accessType} Mode</p>
            <button onClick={onLogout} className="text-[8px] font-black text-rose-500 uppercase hover:text-rose-400 transition-colors">Sign Out / Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Sidebar;
