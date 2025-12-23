
import React, { useState, useEffect } from 'react';
import { Trade, AIInsight } from '../types';
import { analyzeTradePerformance } from '../services/geminiService';

interface AIAnalyticsProps {
  trades: Trade[];
}

const AIAnalytics: React.FC<AIAnalyticsProps> = ({ trades }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const getAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeTradePerformance(trades);
      setInsights(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trades.length > 0 && insights.length === 0) {
      getAnalysis();
    }
  }, [trades]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            AI Trading Coach 
            <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold uppercase tracking-widest animate-pulse">
              Gemini Pro
            </span>
          </h1>
          <p className="text-gray-500 mt-1">Advanced machine learning analysis of your trading patterns.</p>
        </div>
        <button 
          onClick={getAnalysis}
          disabled={loading}
          className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
            loading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          <i className={`fa-solid fa-wand-magic-sparkles ${loading ? 'animate-spin' : ''}`}></i>
          {loading ? 'ANALYZING...' : 'RE-RUN AUDIT'}
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#12151a] p-8 rounded-3xl border border-gray-800 animate-pulse">
              <div className="h-6 w-32 bg-gray-800 rounded-lg mb-4"></div>
              <div className="h-20 bg-gray-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div key={idx} className={`relative p-8 rounded-3xl border transition-all hover:-translate-y-1 ${
                insight.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20' :
                insight.type === 'negative' ? 'bg-rose-500/5 border-rose-500/20' :
                'bg-blue-500/5 border-blue-500/20'
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                  insight.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                  insight.type === 'negative' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  <i className={`fa-solid ${
                    insight.type === 'positive' ? 'fa-chart-line' :
                    insight.type === 'negative' ? 'fa-triangle-exclamation' :
                    'fa-lightbulb'
                  } text-xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{insight.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">{insight.content}</p>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-20 bg-[#12151a] rounded-3xl border border-dashed border-gray-800 flex flex-col items-center">
              <i className="fa-solid fa-robot text-gray-700 text-6xl mb-6"></i>
              <h3 className="text-xl font-bold text-gray-400">Ready to audit your performance?</h3>
              <p className="text-gray-600 mb-8">Import more trades to get a high-quality analysis.</p>
              <button onClick={getAnalysis} className="px-8 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 transition-colors">
                GENERATE FIRST REPORT
              </button>
            </div>
          )}
        </div>
      )}

      {/* Psychological Factor Summary */}
      <div className="bg-gradient-to-br from-[#12151a] to-[#1a1d21] p-10 rounded-[3rem] border border-gray-800/50 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <h3 className="text-2xl font-bold text-white mb-4">Sentiment Map</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Based on your trade notes, the AI has mapped your emotional state during trading sessions.
            </p>
            <div className="space-y-6">
              {[
                { label: 'Discipline', score: 85, color: 'blue' },
                { label: 'Risk Adherence', score: 92, color: 'emerald' },
                { label: 'FOMO Resistance', score: 64, color: 'rose' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white">{item.score}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${item.color}-500 transition-all duration-1000`} 
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-[#0b0e11] rounded-3xl p-8 border border-gray-800">
             <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <i className="fa-solid fa-message text-blue-500"></i>
               Strategic Recommendations
             </h4>
             <ul className="space-y-4">
               {[
                 "Review NVDA breakout setup; your entries are 2% late on average.",
                 "Decrease position size on 'Scalp' setups to manage volatility exposure.",
                 "Maintain the current dip-buying strategy on Apple; it's your highest EV setup.",
                 "Stop trading TSLA on heavy macro news days; it results in poor RR."
               ].map((rec, i) => (
                 <li key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-gray-400 group-hover:text-gray-200 transition-colors">{rec}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;
