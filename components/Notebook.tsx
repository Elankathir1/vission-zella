
import React from 'react';

const Notebook: React.FC = () => {
  return (
    <div className="space-y-10 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Trading Notebook</h1>
          <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Capture your market thoughts and macro context</p>
        </div>
        <button className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
          <i className="fa-solid fa-plus text-white"></i>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: 'Weekly Macro Outlook', date: 'Oct 12, 2023', preview: 'Focusing on CPI data release and its impact on tech volatility...' },
          { title: 'Psychology Reset', date: 'Oct 10, 2023', preview: 'Overtrading on Tuesday led to poor decisions. Need to stick to the plan...' },
          { title: 'Setup Refinement', date: 'Oct 08, 2023', preview: 'Adjusting the 15m breakout criteria to include volume confirmation...' }
        ].map((note, idx) => (
          <div key={idx} className="bg-[#12151a] p-8 rounded-[2.5rem] border border-white/5 cursor-pointer hover:border-blue-500/30 transition-all">
             <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{note.date}</span>
                <i className="fa-solid fa-ellipsis text-gray-700"></i>
             </div>
             <h3 className="text-lg font-black text-white mb-4 tracking-tight">{note.title}</h3>
             <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{note.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notebook;
