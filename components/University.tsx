
import React from 'react';

const University: React.FC = () => {
  const categories = ['All Resources', 'Execution', 'Risk', 'Psychology', 'Playbooks'];
  const modules = [
    { title: 'The Breakout Bible', duration: '45m', level: 'Beginner', category: 'Playbooks', color: 'blue' },
    { title: 'High Frequency Scalping', duration: '1h 20m', level: 'Expert', category: 'Execution', color: 'purple' },
    { title: 'Emotional EQ in Trading', duration: '30m', level: 'Intermediate', category: 'Psychology', color: 'rose' },
    { title: 'Position Sizing Math', duration: '2h', level: 'Intermediate', category: 'Risk', color: 'emerald' },
  ];

  return (
    <div className="space-y-12 animate-fadeIn pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Zella Academy</h1>
          <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Master the markets with institutional grade training</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat, i) => (
            <button key={cat} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${i === 0 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-[#12151a] border-white/5 text-gray-500 hover:border-white/20 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((m, idx) => (
          <div key={idx} className="bg-[#12151a] p-8 rounded-[2.5rem] border border-white/5 group cursor-pointer hover:bg-[#1a1d24] transition-all shadow-2xl">
             <div className={`w-14 h-14 bg-${m.color}-500/10 rounded-2xl flex items-center justify-center text-${m.color}-500 mb-8 group-hover:scale-110 transition-transform border border-${m.color}-500/20`}>
               <i className="fa-solid fa-play text-xl"></i>
             </div>
             <p className={`text-[9px] font-black text-${m.color}-500 uppercase tracking-[0.2em] mb-2`}>{m.category}</p>
             <h3 className="text-xl font-black text-white mb-8 leading-tight tracking-tight">{m.title}</h3>
             <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <i className="fa-regular fa-clock text-gray-600 text-[10px]"></i>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.duration}</span>
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">{m.level}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#12151a] to-[#0b0e11] p-12 rounded-[3.5rem] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full"></div>
         <div className="max-w-xl z-10">
            <h2 className="text-4xl font-black text-white uppercase mb-6 tracking-tighter leading-none">Global Trading <br/><span className="text-blue-500">Mentorship</span></h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 font-medium">
              Join 50,000+ traders in our weekly live audits. Get your performance analyzed by verified funded traders who treat journaling as a competitive advantage.
            </p>
            <div className="flex gap-4">
              <button className="px-10 py-5 bg-white text-black rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                Join Community
              </button>
              <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                View Schedule
              </button>
            </div>
         </div>
         <div className="hidden lg:grid grid-cols-2 gap-4 shrink-0 z-10">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-32 h-32 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse"></div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default University;
