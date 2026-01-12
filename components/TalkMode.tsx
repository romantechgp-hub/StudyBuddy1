
import React, { useState, useRef, useEffect } from 'react';
import { studyService } from '../services/gemini';

interface TalkModeProps {
  onBack: () => void;
}

const TalkMode: React.FC<TalkModeProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([
    { sender: 'ai', text: 'Hi friend! I am Buddy. How are you today? Let\'s practice speaking in English together!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    
    const currentHistory = messages.map(msg => ({
      role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.text }]
    }));
    
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await studyService.chatWithFriend(currentHistory, userMsg);
      setMessages(prev => [...prev, { sender: 'ai', text: response || 'Sorry, I missed that.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Oops, I had a little trouble. Try again!' }]);
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
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('মেসেজ কপি করা হয়েছে!');
  };

  return (
    <div className="bg-white rounded-[2.5rem] flex flex-col h-[650px] shadow-2xl border border-slate-100 overflow-hidden max-w-2xl mx-auto">
      <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="hover:bg-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center transition">←</button>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-inner">🤖</div>
          <div>
            <h2 className="font-black text-xl tracking-tight leading-none">Buddy</h2>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">আপনার এআই বন্ধু</p>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}>
            <div className="max-w-[85%] relative">
              <div className={`p-5 rounded-[1.5rem] shadow-sm transition-all ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.text}</p>
              </div>
              <button 
                onClick={() => copyMessage(msg.text)}
                className={`absolute top-0 ${msg.sender === 'user' ? '-left-8' : '-right-8'} p-1 text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all`}
                title="কপি করো"
              >
                📋
              </button>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none italic text-slate-400 text-xs font-bold animate-pulse">
              Buddy লিখছে...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="flex gap-3">
          <button 
            onClick={startListening}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 text-indigo-600 hover:bg-white border border-slate-100'}`}
          >
            🎤
          </button>
          <input
            type="text"
            className="flex-grow border-2 border-slate-50 bg-slate-50 rounded-2xl px-8 py-5 focus:border-indigo-500 focus:bg-white outline-none text-xs font-bold shadow-inner transition-all"
            placeholder="কিছু লেখো বা বলো (English preferred)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl hover:bg-indigo-700 transition disabled:opacity-50 active:scale-95"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalkMode;
