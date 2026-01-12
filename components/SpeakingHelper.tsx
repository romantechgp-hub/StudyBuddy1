
import React, { useState } from 'react';
import { studyService } from '../services/gemini';

interface SpeakingHelperProps {
  onBack: () => void;
}

const SpeakingHelper: React.FC<SpeakingHelperProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState<'bn-en' | 'en-bn'>('bn-en');
  const [result, setResult] = useState<{ translation: string, pronunciation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await studyService.translateAndPronounce(text, direction);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (txt: string) => {
    if (!txt) return;
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = direction === 'bn-en' ? 'en-US' : 'bn-BD';
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
          ←
        </button>
        <h2 className="text-xl font-bold text-slate-800">অনুবাদ ও স্পিকিং হেল্পার</h2>
      </div>

      <div className="space-y-6">
        {/* Language Selection */}
        <div className="flex justify-center p-2 bg-slate-100 rounded-2xl w-full gap-2">
          <button
            onClick={() => setDirection('bn-en')}
            className={`flex-grow px-4 py-3 rounded-xl font-black text-sm transition-all ${direction === 'bn-en' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            বাংলা → ইংরেজি
          </button>
          <button
            onClick={() => setDirection('en-bn')}
            className={`flex-grow px-4 py-3 rounded-xl font-black text-sm transition-all ${direction === 'en-bn' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            English → Bengali
          </button>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest ml-1">
            {direction === 'bn-en' ? 'বাংলায় বাক্য লিখুন:' : 'Write sentence in English:'}
          </label>
          <input
            type="text"
            className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-5 focus:border-purple-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
            placeholder={direction === 'bn-en' ? "যেমন: আমি ভাত খাই।" : "e.g., I am eating rice."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={loading || !text}
          className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-purple-700 shadow-xl shadow-purple-100 disabled:opacity-50 transition-all transform active:scale-95"
        >
          {loading ? 'প্রসেসিং...' : 'অনুবাদ ও উচ্চারণ দেখুন'}
        </button>

        {result && (
          <div className="space-y-4 animate-in zoom-in duration-500">
            <div className="p-8 bg-purple-50 rounded-3xl border border-purple-100 relative group overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="flex-grow pr-12">
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2">Translation</p>
                  <p className="text-3xl font-black text-slate-800 leading-tight">{result.translation}</p>
                </div>
                <button 
                  onClick={() => playAudio(result.translation)}
                  disabled={speaking}
                  className="w-14 h-14 bg-white text-purple-600 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-purple-100 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                  title="উচ্চারণ শুনুন"
                >
                  🔊
                </button>
              </div>
              <div className="pt-6 border-t border-purple-200 mt-6 relative z-10">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2">Pronunciation Guide</p>
                <p className="text-xl font-bold text-slate-700">{result.pronunciation}</p>
              </div>
              
              {/* Decorative blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 blur-3xl rounded-full"></div>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-center gap-4">
              <span className="text-2xl">🎤</span>
              <p className="text-amber-800 text-sm font-bold leading-relaxed">এবার ওপরের বাটন চেপে উচ্চারণ শোনো এবং নিজে কয়েকবার বলো! এতে তোমার জড়তা কাটবে।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingHelper;
