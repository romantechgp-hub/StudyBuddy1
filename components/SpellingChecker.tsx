
import React, { useState } from 'react';
import { studyService } from '../services/gemini';

interface SpellingCheckerProps {
  onBack: () => void;
}

const SpellingChecker: React.FC<SpellingCheckerProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [result, setResult] = useState<{ original: string, corrected: string, differences: string, explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await studyService.checkSpelling(text, language);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200 border border-slate-50">
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={onBack} 
            className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800">সঠিক বানান শিখুন</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ভাষা ও বানান সংশোধন</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Language Selection */}
          <div className="flex justify-center p-2 bg-slate-100 rounded-2xl w-fit mx-auto gap-2">
            <button
              onClick={() => setLanguage('bn')}
              className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${language === 'bn' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              বাংলা (Bengali)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              English
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest ml-1">
              আপনার লেখাটি এখানে দিন:
            </label>
            <textarea
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[2rem] p-8 outline-none h-40 text-lg font-bold text-slate-800 placeholder:text-slate-200 transition-all duration-300 shadow-inner"
              placeholder={language === 'bn' ? "যেমন: আমি ছিকসা নিতে ছাই..." : "example: i wants to study..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={loading || !text.trim()}
            className="w-full bg-indigo-600 text-white h-16 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {loading ? 'বানান চেক হচ্ছে...' : 'বানান সঠিক করো'}
          </button>

          {result && (
            <div className="space-y-6 animate-in zoom-in duration-500">
              <div className="p-8 bg-green-50 rounded-[2.5rem] border border-green-100">
                <div className="mb-4">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">সঠিক বাক্য:</p>
                  <p className="text-xl font-black text-slate-800 leading-relaxed">{result.corrected}</p>
                </div>
                {result.differences && (
                  <div className="pt-4 border-t border-green-200 mt-4">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">কী সংশোধন করা হয়েছে:</p>
                    <p className="text-sm font-bold text-slate-600">{result.differences}</p>
                  </div>
                )}
              </div>

              {result.explanation && (
                <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">সহজ ব্যাখ্যা:</p>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">{result.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellingChecker;
