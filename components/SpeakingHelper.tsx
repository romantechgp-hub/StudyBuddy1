
import React, { useState, useRef } from 'react';
import { studyService } from '../services/gemini';
import ImageCropper from './ImageCropper';

interface SpeakingHelperProps {
  onBack: () => void;
}

const SpeakingHelper: React.FC<SpeakingHelperProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState<'bn-en' | 'en-bn'>('bn-en');
  const [mode, setMode] = useState<'brief' | 'detailed'>('detailed');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [result, setResult] = useState<{ translation: string, pronunciation: string, explanation?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (!text.trim() && !capturedImage) return;
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (capturedImage) {
        res = await studyService.translateAndPronounceWithImage(capturedImage, direction, mode);
      } else {
        res = await studyService.translateAndPronounce(text, direction, mode);
      }
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCropperSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedImage: string) => {
    setCapturedImage(croppedImage);
    setCropperSrc(null);
    setText('');
  };

  const playAudio = (txt: string) => {
    if (!txt) return;
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = direction === 'bn-en' ? 'en-US' : 'bn-BD';
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = direction === 'bn-en' ? 'bn-BD' : 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      setText(prev => prev + ' ' + event.results[0][0].transcript);
      setCapturedImage(null);
    };
    recognition.start();
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-slate-100 max-w-3xl mx-auto">
      {cropperSrc && <ImageCropper image={cropperSrc} aspect={1.5} onCropComplete={onCropComplete} onCancel={() => setCropperSrc(null)} />}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">←</button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">অনুবাদ ও স্পিকিং</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ভাষা শেখা সহজ</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-sm">
          <button onClick={() => setMode('brief')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'brief' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>সংক্ষিপ্ত</button>
          <button onClick={() => setMode('detailed')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'detailed' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>বিস্তারিত</button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center p-2 bg-slate-100 rounded-2xl w-full gap-2">
          <button onClick={() => { setDirection('bn-en'); setResult(null); }} className={`flex-grow px-4 py-3 rounded-xl font-black text-sm transition-all ${direction === 'bn-en' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>বাংলা → ইংরেজি</button>
          <button onClick={() => { setDirection('en-bn'); setResult(null); }} className={`flex-grow px-4 py-3 rounded-xl font-black text-sm transition-all ${direction === 'en-bn' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>English → Bengali</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <textarea className="w-full border-2 border-slate-100 bg-slate-50 rounded-[2rem] p-8 focus:border-purple-500 outline-none transition-all font-bold text-slate-800 text-sm shadow-inner h-48 resize-none" placeholder={direction === 'bn-en' ? "যেমন: আমি ভাত খাই।" : "e.g., I am eating rice."} value={text} onChange={(e) => { setText(e.target.value); setCapturedImage(null); }} />
            <button onClick={startListening} className={`absolute bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-purple-600'}`}>{isRecording ? '⏹' : '🎤'}</button>
          </div>
          <div className={`h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative ${capturedImage ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-slate-50'}`} onClick={() => fileInputRef.current?.click()}>
            {capturedImage ? <img src={capturedImage} className="w-full h-full object-cover p-2" alt="Captured" /> : <><div className="text-2xl">📷</div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ছবি আপলোড</span></>}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          </div>
        </div>

        <button onClick={handleProcess} disabled={loading || (!text.trim() && !capturedImage)} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-purple-700 shadow-xl transition-all disabled:opacity-50">
          {loading ? 'প্রসেসিং...' : 'অনুবাদ ও উচ্চারণ দেখুন'}
        </button>

        {result && (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="p-6 bg-purple-50 rounded-[2.5rem] border border-purple-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-1">Translation</p>
                  <p className="text-2xl font-black text-slate-800 leading-tight">{result.translation}</p>
                </div>
                <button onClick={() => playAudio(result.translation)} disabled={speaking} className="w-14 h-14 bg-white text-purple-600 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-purple-100 disabled:opacity-50">🔊</button>
              </div>
              <div className="pt-6 border-t border-purple-200 mt-6">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-1">Pronunciation</p>
                <p className="text-xl font-bold text-slate-700">{result.pronunciation}</p>
              </div>
            </div>
            {result.explanation && (
              <div className="p-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 shadow-sm">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">ব্যাখ্যা ({mode === 'brief' ? 'সংক্ষিপ্ত' : 'বিস্তারিত'}):</p>
                <p className="text-sm font-bold text-slate-600 leading-relaxed">{result.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingHelper;
