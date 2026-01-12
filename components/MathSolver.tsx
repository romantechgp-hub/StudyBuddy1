
import React, { useState } from 'react';
import { studyService } from '../services/gemini';

interface MathSolverProps {
  onBack: () => void;
}

const MathSolver: React.FC<MathSolverProps> = ({ onBack }) => {
  const [problem, setProblem] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSolve = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const solution = await studyService.solveMath(problem);
      // Double safety: remove $ signs even on component side
      setResult(solution?.replace(/\$/g, '') || '');
    } catch (error) {
      setResult('অংকটি সমাধান করতে সমস্যা হয়েছে। দয়া করে আবার টাইপ করো।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200 border border-slate-50 animate-in fade-in slide-in-from-top-4 duration-700 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack} 
          className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors"
        >
          ←
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800">অংক সমাধানকারী</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ধাপে ধাপে সহজ সমাধান</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
            অংকটি এখানে লিখুন:
          </label>
          <div className="relative group">
            <input
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl p-6 outline-none text-xl font-bold text-slate-800 placeholder:text-slate-200 transition-all duration-300 shadow-inner"
              placeholder="যেমন: 5x + 10 = 30 হলে x = ?"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-200 group-hover:text-emerald-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={handleSolve}
          disabled={loading || !problem.trim()}
          className="w-full bg-emerald-600 text-white h-16 rounded-[1.5rem] font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 hover:shadow-emerald-200 transition-all transform active:scale-95 disabled:opacity-50"
        >
          {loading ? 'সমাধান করা হচ্ছে...' : 'অংক সমাধান করো'}
        </button>

        {result && (
          <div className="mt-8 space-y-6 animate-in zoom-in duration-500">
            <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-sm">💡</span>
                <h4 className="font-black text-emerald-800">সমাধান ও ব্যাখ্যা:</h4>
              </div>
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-bold bg-white/50 p-6 rounded-2xl border border-emerald-50 shadow-inner">
                {result}
              </div>
            </div>
            
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
              <span className="text-2xl">📝</span>
              <p className="text-blue-800 text-xs font-bold leading-relaxed">টিপস: চিহ্নের ব্যবহার খেয়াল করো, এতে অংক ভুল হওয়ার সম্ভাবনা কমে যায়।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathSolver;
