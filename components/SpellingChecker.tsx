
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
        res = await studyService.checkSpellingWithImage(capturedImage, language);
      } else {
        res = await studyService.checkSpelling(text, language);
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
      reader.onloadend = () => {
        setCropperSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedImage: string) => {
    setCapturedImage(croppedImage);
    setCropperSrc(null);
    setText(''); // Clear text if image is used
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
      setText(prev => prev + ' ' + transcript);
      setCapturedImage(null); // Clear image if text is used
    };
    recognition.start();
  };

  const copyCorrected = () => {
    if (result) {
      navigator.clipboard.writeText(result.corrected);
      alert('সঠিক বাক্য কপি করা হয়েছে!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {cropperSrc && (
        <ImageCropper 
          image={cropperSrc} 
          aspect={1.5} // Wider aspect for text lines
          onCropComplete={onCropComplete} 
          onCancel={() => setCropperSrc(null)} 
        />
      )}

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 shadow-xl shadow-slate-200 border border-slate-50">
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={onBack} 
            className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">সঠিক বানান শিখুন</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ভাষা ও বানান সংশোধন</p>
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
              আপনার লেখাটি এখানে দিন, মুখে বলুন অথবা ছবি তুলুন:
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <textarea
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[2rem] p-10 outline-none h-48 text-sm font-bold text-slate-800 placeholder:text-slate-200 transition-all duration-300 shadow-inner resize-none"
                  placeholder={language === 'bn' ? "যেমন: আমি ছিকসা নিতে ছাই..." : "example: i wants to study..."}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setCapturedImage(null);
                  }}
                />
                <button 
                  onClick={startListening}
                  className={`absolute bottom-6 right-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-indigo-600 hover:scale-110'}`}
                >
                  🎤
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
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCapturedImage(null); }}
                      className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full text-rose-500 flex items-center justify-center shadow-md hover:scale-110 transition-all"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-2xl shadow-sm text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                      📷
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">ছবি তুলুন বা আপলোড করুন</span>
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
            onClick={handleCheck}
            disabled={loading || (!text.trim() && !capturedImage)}
            className="w-full bg-indigo-600 text-white h-16 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'বানান চেক হচ্ছে...' : 'বানান সঠিক করো'}
          </button>

          {result && (
            <div className="space-y-6 animate-in zoom-in duration-500">
              {capturedImage && result.original && (
                <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-sm font-bold">
                  চিহ্নিত টেক্সট: "{result.original}"
                </div>
              )}
              
              <div className="p-6 sm:p-8 bg-green-50 rounded-[2.5rem] border border-green-100 relative shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">সঠিক বাক্য:</p>
                  <button onClick={copyCorrected} className="text-[9px] font-black uppercase text-green-600 hover:underline">Copy</button>
                </div>
                <p className="text-lg sm:text-xl font-black text-slate-800 leading-relaxed bg-white/50 p-5 sm:p-6 rounded-2xl border border-green-100 shadow-inner min-h-[200px] sm:min-h-fit">
                  {result.corrected}
                </p>
                {result.differences && (
                  <div className="pt-4 border-t border-green-200 mt-6">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">কী সংশোধন করা হয়েছে:</p>
                    <p className="text-sm font-bold text-slate-600">{result.differences}</p>
                  </div>
                )}
              </div>

              {result.explanation && (
                <div className="p-6 sm:p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 shadow-sm min-h-[150px] sm:min-h-fit">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">সহজ ব্যাখ্যা:</p>
                  <p className="text-base sm:text-sm font-bold text-slate-600 leading-relaxed">{result.explanation}</p>
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
