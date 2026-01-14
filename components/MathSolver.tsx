
import React, { useState, useRef } from 'react';
import { studyService } from '../services/gemini';
import ImageCropper from './ImageCropper';

interface MathSolverProps {
  onBack: () => void;
}

const MathSolver: React.FC<MathSolverProps> = ({ onBack }) => {
  const [problem, setProblem] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [mode, setMode] = useState<'brief' | 'detailed'>('detailed');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSolve = async () => {
    if (!problem.trim() && !capturedImage) return;
    setLoading(true);
    setResult('');
    try {
      let solution = '';
      if (capturedImage) {
        solution = await studyService.solveMathWithImage(capturedImage, mode);
      } else {
        solution = await studyService.solveMath(problem, mode);
      }
      setResult(solution || '');
    } catch (error) {
      setResult('অংকটি সমাধান করতে সমস্যা হয়েছে।');
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
    setProblem('');
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      setProblem(prev => prev + ' ' + event.results[0][0].transcript);
      setCapturedImage(null);
    };
    recognition.start();
  };

  return (
    <div className="bg-white rounded-[2rem] p-5 sm:p-10 shadow-2xl border border-slate-100 max-w-4xl mx-auto">
      {cropperSrc && <ImageCropper image={cropperSrc} aspect={1.5} onCropComplete={onCropComplete} onCancel={() => setCropperSrc(null)} />}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 transition-colors">←</button>
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">অংক সমাধানকারী</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Math Solver</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
          <button onClick={() => setMode('brief')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all duration-300 ${mode === 'brief' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>সংক্ষিপ্ত</button>
          <button onClick={() => setMode('detailed')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all duration-300 ${mode === 'detailed' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}>বিস্তারিত</button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <textarea 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl p-6 h-40 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300 resize-none shadow-inner transition-all" 
              placeholder="যেমন: x + 1 = 5 হলে x কত?" 
              value={problem} 
              onChange={(e) => { setProblem(e.target.value); setCapturedImage(null); }} 
            />
            <button onClick={startListening} className={`absolute bottom-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-emerald-600 border border-emerald-50 hover:scale-105'}`}>🎤</button>
          </div>
          <div className={`h-40 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative group ${capturedImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`} onClick={() => fileInputRef.current?.click()}>
            {capturedImage ? <img src={capturedImage} className="w-full h-full object-contain p-2" alt="Problem" /> : <><div className="text-2xl group-hover:scale-110 transition-transform">📷</div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ছবি আপলোড</span></>}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          </div>
        </div>

        <button onClick={handleSolve} disabled={loading || (!problem.trim() && !capturedImage)} className="w-full bg-emerald-600 text-white h-16 rounded-3xl font-black text-lg hover:bg-emerald-700 shadow-xl transition-all disabled:opacity-50 active:scale-[0.98]">
          {loading ? 'প্রসেসিং...' : 'সমাধান বের করো'}
        </button>

        {result && (
          <div className="mt-8 space-y-4 animate-in zoom-in duration-500">
            <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest">সমাধান:</h4>
            <div className="math-text whitespace-pre-wrap text-slate-800 leading-relaxed font-semibold bg-white p-6 sm:p-10 rounded-[2rem] border-2 border-emerald-50 shadow-inner text-sm sm:text-base">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathSolver;
