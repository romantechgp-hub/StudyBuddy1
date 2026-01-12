
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
        explanation = await studyService.explainTopicWithImage(capturedImage, level);
      } else {
        explanation = await studyService.explainTopic(topic, level);
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
      reader.onloadend = () => {
        setCropperSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedImage: string) => {
    setCapturedImage(croppedImage);
    setCropperSrc(null);
    setTopic(''); // Clear text if image is used
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
      setTopic(prev => prev + ' ' + transcript);
      setCapturedImage(null);
    };
    recognition.start();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert('টেক্সট কপি করা হয়েছে!');
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-slate-100 max-w-3xl mx-auto">
      {cropperSrc && (
        <ImageCropper 
          image={cropperSrc} 
          aspect={1.5} 
          onCropComplete={onCropComplete} 
          onCancel={() => setCropperSrc(null)} 
        />
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 transition">
          ←
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">সহজ পড়া মোড</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">টপিক সহজে বুঝতে</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">যেকোনো বিষয় লেখো, বলো অথবা ছবি তোলো:</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <textarea
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[2rem] p-10 outline-none h-48 text-sm font-bold text-slate-800 placeholder:text-slate-200 transition-all duration-300 shadow-inner resize-none"
                placeholder="যেমন: সালোকসংশ্লেষণ কী?"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setCapturedImage(null);
                }}
              />
              <button 
                onClick={startListening}
                className={`absolute bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-indigo-600 hover:scale-110'}`}
              >
                {isRecording ? '⏹' : '🎤'}
              </button>
            </div>

            <div 
              className={`h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative group ${capturedImage ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {capturedImage ? (
                <>
                  <img src={capturedImage} className="w-full h-full object-cover opacity-50" alt="Captured" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-700">
                    <span className="text-2xl">📸</span>
                    <span className="text-[10px] font-black uppercase">ছবি পাল্টান</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-2xl shadow-sm text-slate-400">📷</div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ছবি তুলুন বা আপলোড করুন</span>
                </>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </div>
          </div>
        </div>

        <div className="flex gap-6 justify-center">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" checked={level === 'basic'} onChange={() => setLevel('basic')} className="w-5 h-5 text-indigo-600 accent-indigo-600" />
            <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600">একদম বেসিক লেভেলে</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" checked={level === 'standard'} onChange={() => setLevel('standard')} className="w-5 h-5 text-indigo-600 accent-indigo-600" />
            <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600">সাধারণ লেভেলে</span>
          </label>
        </div>

        <button
          onClick={handleExplain}
          disabled={loading || (!topic.trim() && !capturedImage)}
          className="w-full bg-indigo-600 text-white h-16 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'বুঝিয়ে দিচ্ছি...' : 'সহজে বুঝিয়ে দাও'}
        </button>

        {result && (
          <div className="mt-6 sm:mt-10 p-5 sm:p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 relative group animate-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-blue-800 flex items-center gap-2">
                <span className="text-xl">💡</span> ব্যাখ্যা:
              </h4>
              <button onClick={copyToClipboard} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border border-blue-100">কপি করো</button>
            </div>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium bg-white p-5 sm:p-6 rounded-2xl border border-blue-50 shadow-inner min-h-[300px] sm:min-h-fit text-base sm:text-base">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMode;
