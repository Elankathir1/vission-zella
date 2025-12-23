
import React, { useState } from 'react';
import { TradePlan, PlanStatus, TradeType } from '../types';
import { SETUPS } from '../constants';

interface TradePlannerProps {
  plans: TradePlan[];
  onAddPlan: (plan: TradePlan) => void;
}

const TradePlanner: React.FC<TradePlannerProps> = ({ plans, onAddPlan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'LONG' as TradeType,
    triggerPrice: '',
    stopLoss: '',
    takeProfit: '',
    plannedRisk: '0.5',
    logic: '',
    ifScenario: '',
    thenScenario: '',
    setup: SETUPS[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: TradePlan = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      triggerPrice: parseFloat(formData.triggerPrice),
      stopLoss: parseFloat(formData.stopLoss),
      takeProfit: parseFloat(formData.takeProfit),
      plannedRisk: parseFloat(formData.plannedRisk),
      logic: formData.logic,
      ifScenario: formData.ifScenario,
      thenScenario: formData.thenScenario,
      status: 'WATCHING',
      setup: formData.setup,
      createdAt: new Date().toISOString(),
      tags: []
    };
    onAddPlan(newPlan);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Trade <span className="text-blue-500">Planner</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">Execution Blueprints & Strategic Roadmaps</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-pen-nib"></i> Draft New Blueprint
        </button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map(plan => (
          <div key={plan.id} className="bg-[#12151a] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all">
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">{plan.symbol}</h3>
            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
              <span className="text-blue-200">IF</span> {plan.ifScenario} <br/>
              <span className="text-blue-200">THEN</span> {plan.thenScenario}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradePlanner;
