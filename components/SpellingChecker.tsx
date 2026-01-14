
import React, { useState, useRef } from 'react';
import { studyService } from '../services/gemini';
import ImageCropper from './ImageCropper';

interface SpellingCheckerProps {
  onBack: () => void;
}

const SpellingChecker: React.FC<SpellingCheckerProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [mode, setMode] = useState<'brief' | 'detailed'>('detailed');
  const [result, setResult] = useState<{ original: string, corrected: string, differences: string, explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheck = async () => {
    if (!text.trim() && !capturedImage) return;
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (capturedImage) {
        res = await studyService.checkSpellingWithImage(capturedImage, language, mode);
      } else {
        res = await studyService.checkSpelling(text, language, mode);
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

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      setText(prev => prev + ' ' + event.results[0][0].transcript);
      setCapturedImage(null);
    };
    recognition.start();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {cropperSrc && <ImageCropper image={cropperSrc} aspect={1.5} onCropComplete={onCropComplete} onCancel={() => setCropperSrc(null)} />}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 shadow-xl border border-slate-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">←</button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">বানান সংশোধন</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ভাষা ও বানান সংশোধন</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setMode('brief')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'brief' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>সংক্ষিপ্ত</button>
              <button onClick={() => setMode('detailed')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'detailed' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>বিস্তারিত</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center p-2 bg-slate-100 rounded-2xl w-fit mx-auto gap-2">
            <button onClick={() => setLanguage('bn')} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${language === 'bn' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>বাংলা</button>
            <button onClick={() => setLanguage('en')} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}>English</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] p-8 outline-none h-48 text-sm font-bold text-slate-800 shadow-inner resize-none" placeholder={language === 'bn' ? "যেমন: আমি ছিকসা নিতে ছাই..." : "example: i wants to study..."} value={text} onChange={(e) => { setText(e.target.value); setCapturedImage(null); }} />
              <button onClick={startListening} className={`absolute bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-indigo-600'}`}>🎤</button>
            </div>
            <div className={`h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative ${capturedImage ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`} onClick={() => fileInputRef.current?.click()}>
              {capturedImage ? <img src={capturedImage} className="w-full h-full object-cover p-2" alt="Captured" /> : <><div className="text-2xl">📷</div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ছবি আপলোড</span></>}
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </div>
          </div>

          <button onClick={handleCheck} disabled={loading || (!text.trim() && !capturedImage)} className="w-full bg-indigo-600 text-white h-16 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl transition-all disabled:opacity-50">
            {loading ? 'বানান চেক হচ্ছে...' : 'বানান সঠিক করো'}
          </button>

          {result && (
            <div className="space-y-6 animate-in zoom-in duration-500">
              <div className="p-6 bg-green-50 rounded-[2.5rem] border border-green-100 shadow-sm">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">সঠিক বাক্য:</p>
                <p className="text-lg font-black text-slate-800 leading-relaxed bg-white/50 p-6 rounded-2xl border border-green-100 shadow-inner">{result.corrected}</p>
                {result.differences && (
                  <div className="pt-4 border-t border-green-200 mt-6">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">সংশোধন:</p>
                    <p className="text-sm font-bold text-slate-600">{result.differences}</p>
                  </div>
                )}
              </div>
              {result.explanation && (
                <div className="p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100 shadow-sm">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">ব্যাখ্যা:</p>
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
