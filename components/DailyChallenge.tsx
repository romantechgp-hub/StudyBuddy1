
import React, { useState } from 'react';
import { studyService } from '../services/gemini';

interface DailyChallengeProps {
  onBack: () => void;
  onComplete: () => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ onBack, onComplete }) => {
  const [input, setInput] = useState('');
  const [sentences, setSentences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  const [isClaimed, setIsClaimed] = useState(false);

  const handleCheck = async () => {
    if (!input.trim() || sentences.length >= 3) return;
    
    setLoading(true);
    setFeedback({ text: '', type: null });
    try {
      const result = await studyService.validateEnglishSentence(input);
      if (result.isValid) {
        setSentences(prev => [...prev, input]);
        setFeedback({ text: result.feedback || 'চমৎকার! সঠিক বাক্য।', type: 'success' });
        setInput('');
      } else {
        setFeedback({ 
          text: `ভুল হয়েছে! সঠিক হতে পারত: "${result.correction}"। আবার চেষ্টা করো।`, 
          type: 'error' 
        });
      }
    } catch (error) {
      setFeedback({ text: 'নেটওয়ার্ক সমস্যা, আবার ট্রাই করো।', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = () => {
    onComplete();
    setIsClaimed(true);
  };

  const isCompleted = sentences.length >= 3;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200 border border-slate-50 relative overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors"
            >
              ←
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-800">আজকের লক্ষ্য</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">স্পিকিং ও রাইটিং চ্যালেঞ্জ</p>
            </div>
          </div>
          <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2">
            REWARD: +10 pts
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-center items-center gap-6 mb-12 relative z-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div 
                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl transition-all duration-700 shadow-xl ${
                  sentences.length >= i 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white scale-110 shadow-green-200' 
                    : 'bg-slate-50 text-slate-200 border-2 border-dashed border-slate-200 shadow-none'
                }`}
              >
                {sentences.length >= i ? '★' : i}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${sentences.length >= i ? 'text-green-500' : 'text-slate-300'}`}>
                {sentences.length >= i ? 'Done' : `Step ${i}`}
              </span>
            </div>
          ))}
          <div className="absolute top-[32px] left-1/4 right-1/4 h-[2px] bg-slate-100 -z-10">
            <div 
              className="h-full bg-green-500 transition-all duration-700" 
              style={{ width: `${(sentences.length / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="relative z-10">
          {!isCompleted ? (
            <div className="space-y-6">
              <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 text-center">
                <p className="text-indigo-900 font-bold">৩টি সঠিক ইংরেজি বাক্য লিখলেই ১০ পয়েন্ট!</p>
                <p className="text-indigo-500 text-sm mt-1">প্রতিটি বাক্য অন্তত ৩টি শব্দের হতে হবে।</p>
              </div>

              <div className="relative">
                <textarea
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[2rem] p-8 outline-none h-40 text-xl text-center font-bold text-slate-800 placeholder:text-slate-200 transition-all duration-300 shadow-inner"
                  placeholder="এখানে লেখো..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button 
                  onClick={() => alert('ভয়েস ইনপুট ফিচারটি শীঘ্রই আসছে!')}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all"
                >
                  🎤
                </button>
              </div>

              {feedback.type && (
                <div className={`p-5 rounded-2xl text-sm font-bold animate-in fade-in zoom-in duration-300 ${
                  feedback.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-700'
                }`}>
                  {feedback.text}
                </div>
              )}

              <button
                onClick={handleCheck}
                disabled={loading || !input.trim()}
                className="w-full bg-indigo-600 text-white h-16 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all disabled:opacity-50"
              >
                {loading ? 'প্রসেসিং হচ্ছে...' : 'বাক্য চেক করো'}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-8 animate-in zoom-in duration-700">
              <div className="w-24 h-24 bg-amber-100 rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-2xl shadow-amber-100">
                🏆
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800">অসাধারণ কাজ!</h3>
                <p className="text-slate-500 font-medium">তুমি সফলভাবে আজকের ৩টি বাক্য চ্যালেঞ্জ পূর্ণ করেছ।</p>
              </div>
              
              <button
                onClick={handleClaim}
                disabled={isClaimed}
                className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 ${
                  isClaimed 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-200'
                }`}
              >
                {isClaimed ? 'পয়েন্ট সংগ্রহ করা হয়েছে ✓' : 'পুরস্কার গ্রহণ করো (+১০ পয়েন্ট)'}
              </button>
              
              {isClaimed && (
                <button 
                  onClick={onBack}
                  className="text-indigo-600 font-black text-sm uppercase tracking-widest hover:underline transition-all"
                >
                  ড্যাশবোর্ডে ফিরে যাও
                </button>
              )}
            </div>
          )}
        </div>

        {/* Decor */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-0"></div>
      </div>
    </div>
  );
};

// Fixed: Add default export
export default DailyChallenge;
