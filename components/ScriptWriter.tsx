
import React, { useState } from 'react';
import { studyService } from '../services/gemini';

interface ScriptWriterProps {
  onBack: () => void;
}

const ScriptWriter: React.FC<ScriptWriterProps> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setScript('');
    try {
      const result = await studyService.generateScript(topic, language);
      setScript(result || '');
    } catch (error) {
      setScript('দুঃখিত, স্ক্রিপ্টটি তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো।');
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("দুঃখিত, আপনার ব্রাউজার স্পিচ রিকগনিশন সাপোর্ট করে না।");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTopic(prev => prev + ' ' + transcript);
    };
    recognition.start();
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 shadow-xl shadow-slate-200 border border-slate-50 animate-in fade-in slide-in-from-top-4 duration-700 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack} 
          className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">স্ক্রিপ্ট লিখে নাও</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">উপস্থাপনা বা ভিডিওর জন্য স্ক্রিপ্ট</p>
        </div>
      </div>

      <div className="space-y-8">
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
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
            আপনার বিষয় লিখুন বা বলুন:
          </label>
          <div className="relative">
            <textarea
              className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-[2rem] p-10 outline-none h-48 text-sm font-bold text-slate-800 placeholder:text-slate-200 transition-all duration-300 shadow-inner resize-none"
              placeholder="যেমন: পরিবেশ দূষণ নিয়ে ৩ মিনিটের একটি ভিডিও স্ক্রিপ্ট..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button 
              onClick={startListening}
              className={`absolute bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-teal-600 hover:scale-110'}`}
            >
              🎤
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="w-full bg-teal-600 text-white h-16 rounded-2xl font-black text-lg hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'স্ক্রিপ্ট তৈরি হচ্ছে...' : 'স্ক্রিপ্ট তৈরি করো'}
        </button>

        {script && (
          <div className="mt-6 sm:mt-8 p-6 sm:p-8 bg-teal-50 rounded-[2.5rem] border border-teal-100 animate-in zoom-in duration-500 shadow-sm">
            <h4 className="text-teal-800 font-black mb-6 flex items-center gap-2">
              <span className="text-2xl">📝</span> আপনার স্ক্রিপ্ট:
            </h4>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium bg-white p-5 sm:p-6 rounded-2xl shadow-inner border border-teal-50 min-h-[400px] sm:min-h-fit text-base sm:text-base">
              {script}
            </div>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(script);
                alert('স্ক্রিপ্টটি কপি করা হয়েছে!');
              }}
              className="mt-6 w-full py-4 bg-white text-teal-600 rounded-2xl font-black text-sm border-2 border-teal-100 hover:bg-teal-50 transition-all shadow-sm"
            >
              কপি করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptWriter;
