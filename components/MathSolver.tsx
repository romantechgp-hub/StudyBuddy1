
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
        solution = await studyService.solveMathWithImage(capturedImage);
      } else {
        solution = await studyService.solveMath(problem);
      }
      setResult(solution || '');
    } catch (error) {
      setResult('অংকটি সমাধান করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করো।');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedImage: string) => {
    setCapturedImage(croppedImage);
    setCropperSrc(null);
    setProblem(''); // Clear text problem if image is selected
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) {
      alert("দুঃখিত, আপনার ব্রাউজার স্পিচ রিকগনিশন সাপোর্ট করে না।");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setProblem(prev => prev + ' ' + transcript);
      setCapturedImage(null); // Clear image if text is used
    };
    recognition.start();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('টেক্সট কপি করা হয়েছে!');
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 shadow-xl shadow-slate-200 border border-slate-50 animate-in fade-in slide-in-from-top-4 duration-700 max-w-3xl mx-auto">
      {cropperSrc && (
        <ImageCropper 
          image={cropperSrc} 
          aspect={1} 
          onCropComplete={onCropComplete} 
          onCancel={() => setCropperSrc(null)} 
        />
      )}

      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack} 
          className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">অংক সমাধানকারী</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ধাপে ধাপে সহজ সমাধান</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
            অংকটি লিখুন, মুখে বলুন অথবা ছবি তুলুন:
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <textarea
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl p-6 h-32 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-200 transition-all duration-300 shadow-inner resize-none"
                placeholder="যেমন: 5x + 10 = 30 হলে x = ?"
                value={problem}
                onChange={(e) => {
                  setProblem(e.target.value);
                  setCapturedImage(null);
                }}
              />
              <button 
                onClick={startListening}
                className={`absolute bottom-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-emerald-600 hover:scale-110'}`}
              >
                {isRecording ? '⏹' : '🎤'}
              </button>
            </div>

            <div 
              className={`h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative group ${capturedImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {capturedImage ? (
                <>
                  <img src={capturedImage} className="w-full h-full object-cover opacity-50" alt="Captured" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-700">
                    <span className="text-2xl">📸</span>
                    <span className="text-[10px] font-black uppercase">ছবি পাল্টান</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCapturedImage(null); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full text-rose-500 flex items-center justify-center shadow-sm hover:scale-110 transition-all text-xs"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                    📷
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">ছবি তুলুন বা আপলোড করুন</span>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSolve}
          disabled={loading || (!problem.trim() && !capturedImage)}
          className="w-full bg-emerald-600 text-white h-16 rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'সমাধান করা হচ্ছে...' : 'অংক সমাধান করো'}
        </button>

        {result && (
          <div className="mt-6 sm:mt-8 space-y-6 animate-in zoom-in duration-500">
            <div className="p-5 sm:p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-sm">💡</span>
                  <h4 className="font-black text-emerald-800">সমাধান ও ব্যাখ্যা:</h4>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border border-emerald-100"
                >
                  কপি করো
                </button>
              </div>
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-bold bg-white/50 p-5 sm:p-6 rounded-2xl border border-emerald-50 shadow-inner min-h-[250px] sm:min-h-fit text-base sm:text-lg">
                {result}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathSolver;
