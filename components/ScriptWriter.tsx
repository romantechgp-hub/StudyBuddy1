
import React, { useState } from 'react';
import { studyService } from '../services/gemini';

interface ScriptWriterProps {
  onBack: () => void;
}

const ScriptWriter: React.FC<ScriptWriterProps> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [mode, setMode] = useState<'brief' | 'detailed'>('detailed');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setScript('');
    try {
      const result = await studyService.generateScript(topic, language, mode);
      setScript(result || '');
    } catch (error) {
      setScript('দুঃখিত, স্ক্রিপ্টটি তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      setTopic(prev => prev + ' ' + event.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 shadow-xl border border-slate-50 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">←</button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">স্ক্রিপ্ট লিখে নাও</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ভিডিওর জন্য স্ক্রিপ্ট</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setMode('brief')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'brief' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>সংক্ষিপ্ত</button>
            <button onClick={() => setMode('detailed')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'detailed' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>বিস্তারিত</button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center p-2 bg-slate-100 rounded-2xl w-fit mx-auto gap-2">
          <button onClick={() => setLanguage('bn')} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${language === 'bn' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>বাংলা</button>
          <button onClick={() => setLanguage('en')} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>English</button>
        </div>

        <div className="relative">
          <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-[2rem] p-10 outline-none h-48 text-sm font-bold text-slate-800 placeholder:text-slate-200 shadow-inner resize-none transition-all" placeholder="যেমন: পরিবেশ দূষণ নিয়ে ভিডিও স্ক্রিপ্ট..." value={topic} onChange={(e) => setTopic(e.target.value)} />
          <button onClick={startListening} className={`absolute bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-teal-600'}`}>🎤</button>
        </div>

        <button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full bg-teal-600 text-white h-16 rounded-2xl font-black text-lg hover:bg-teal-700 shadow-xl transition-all disabled:opacity-50">
          {loading ? 'স্ক্রিপ্ট তৈরি হচ্ছে...' : 'স্ক্রিপ্ট তৈরি করো'}
        </button>

        {script && (
          <div className="mt-8 p-6 bg-teal-50 rounded-[2.5rem] border border-teal-100 animate-in zoom-in duration-500 shadow-sm">
            <h4 className="text-teal-800 font-black mb-6 flex items-center gap-2"><span>📝</span> আপনার স্ক্রিপ্ট:</h4>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium bg-white p-6 rounded-2xl shadow-inner border border-teal-50 min-h-[300px] text-sm">{script}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptWriter;
