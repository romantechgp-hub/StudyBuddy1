
import React, { useState, useRef } from 'react';
import { studyService } from '../services/gemini';
import ImageCropper from './ImageCropper';

interface QAModeProps {
  onBack: () => void;
}

const QAMode: React.FC<QAModeProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAsk = async () => {
    if (!query.trim() && !capturedImage) return;
    setLoading(true);
    setResult('');
    try {
      let ans = '';
      if (capturedImage) {
        ans = await studyService.askQuestionWithImage(capturedImage);
      } else {
        ans = await studyService.askQuestion(query);
      }
      setResult(ans || '');
    } catch (error) {
      setResult('উত্তর খুঁজে পাওয়া যায়নি। আবার চেষ্টা করো।');
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
    setQuery('');
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
      setQuery(prev => prev + ' ' + transcript);
      setCapturedImage(null);
    };
    recognition.start();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('উত্তর কপি করা হয়েছে!');
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 max-w-3xl mx-auto">
      {cropperSrc && (
        <ImageCropper 
          image={cropperSrc} 
          aspect={1} 
          onCropComplete={onCropComplete} 
          onCancel={() => setCropperSrc(null)} 
        />
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 transition">
          ←
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">প্রশ্ন ও উত্তর</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">যেকোনো প্রশ্নের সহজ উত্তর</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">প্রশ্ন লেখো, বলো অথবা ছবি তোলো:</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <input
                type="text"
                className="w-full border-2 border-transparent bg-slate-50 rounded-2xl p-10 focus:border-rose-500 focus:bg-white outline-none text-sm font-bold text-slate-800 shadow-inner h-32"
                placeholder="যেমন: বাংলাদেশের রাজধানী কোথায়?"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCapturedImage(null);
                }}
              />
              <button 
                onClick={startListening}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-rose-600 hover:scale-110'}`}
              >
                {isRecording ? '⏹' : '🎤'}
              </button>
            </div>

            <div 
              className={`h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative group ${capturedImage ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-rose-400 hover:bg-rose-50/30'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {capturedImage ? (
                <>
                  <img src={capturedImage} className="w-full h-full object-cover opacity-50" alt="Captured" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-700">
                    <span className="text-2xl">📸</span>
                    <span className="text-[10px] font-black uppercase">ছবি পাল্টান</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-3xl flex items-center justify-center text-xl shadow-sm text-slate-400">📷</div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ছবি তুলুন বা আপলোড করুন</span>
                </>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </div>
          </div>
        </div>

        <button
          onClick={handleAsk}
          disabled={loading || (!query.trim() && !capturedImage)}
          className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'উত্তর খুঁজছি...' : 'উত্তর দাও'}
        </button>

        {result && (
          <div className="mt-8 p-8 bg-rose-50/50 rounded-[2.5rem] border border-rose-100 animate-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-rose-800 flex items-center gap-2">
                <span className="text-xl">✍️</span> উত্তর:
              </h4>
              <button onClick={copyToClipboard} className="bg-white text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">কপি করো</button>
            </div>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium bg-white p-6 rounded-2xl border border-rose-50 shadow-inner">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QAMode;
