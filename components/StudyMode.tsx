
import React, { useState, useRef } from 'react';
import { studyService } from '../services/gemini';
import ImageCropper from './ImageCropper';

interface StudyModeProps {
  onBack: () => void;
}

const StudyMode: React.FC<StudyModeProps> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [level, setLevel] = useState<'basic' | 'standard'>('standard');
  const [mode, setMode] = useState<'brief' | 'detailed'>('detailed');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExplain = async () => {
    if (!topic.trim() && !capturedImage) return;
    setLoading(true);
    setResult('');
    try {
      let explanation = '';
      if (capturedImage) {
        explanation = await studyService.explainTopicWithImage(capturedImage, level, mode);
      } else {
        explanation = await studyService.explainTopic(topic, level, mode);
      }
      setResult(explanation || '');
    } catch (error) {
      setResult('দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করো।');
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
    setTopic('');
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      setTopic(prev => prev + ' ' + event.results[0][0].transcript);
      setCapturedImage(null);
    };
    recognition.start();
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-slate-100 max-w-3xl mx-auto">
      {cropperSrc && <ImageCropper image={cropperSrc} aspect={1.5} onCropComplete={onCropComplete} onCancel={() => setCropperSrc(null)} />}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 transition">←</button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">সহজ পড়া মোড</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">টপিক সহজে বুঝতে</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-[2rem] p-8 outline-none h-48 text-sm font-bold text-slate-800 placeholder:text-slate-200 transition-all resize-none shadow-inner" placeholder="যেমন: সালোকসংশ্লেষণ কী?" value={topic} onChange={(e) => { setTopic(e.target.value); setCapturedImage(null); }} />
            <button onClick={startListening} className={`absolute bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-indigo-600'}`}>{isRecording ? '⏹' : '🎤'}</button>
          </div>
          <div className={`h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative ${capturedImage ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`} onClick={() => fileInputRef.current?.click()}>
            {capturedImage ? <img src={capturedImage} className="w-full h-full object-cover p-2" alt="Selected" /> : <><div className="text-2xl">📷</div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ছবি আপলোড</span></>}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-3xl">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={level === 'basic'} onChange={() => setLevel('basic')} className="accent-indigo-600" />
              <span className="text-xs font-bold text-slate-600">বেসিক</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={level === 'standard'} onChange={() => setLevel('standard')} className="accent-indigo-600" />
              <span className="text-xs font-bold text-slate-600">সাধারণ</span>
            </label>
          </div>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button onClick={() => setMode('brief')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'brief' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>সংক্ষিপ্ত</button>
            <button onClick={() => setMode('detailed')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'detailed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>বিস্তারিত</button>
          </div>
        </div>

        <button onClick={handleExplain} disabled={loading || (!topic.trim() && !capturedImage)} className="w-full bg-indigo-600 text-white h-16 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl transition-all disabled:opacity-50">
          {loading ? 'প্রসেসিং...' : 'সহজে বুঝিয়ে দাও'}
        </button>

        {result && (
          <div className="mt-8 p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 animate-in zoom-in duration-500">
            <h4 className="font-black text-blue-800 flex items-center gap-2 mb-4"><span>💡</span> ব্যাখ্যা:</h4>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium bg-white p-6 rounded-2xl border border-blue-50 shadow-inner text-sm">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMode;
