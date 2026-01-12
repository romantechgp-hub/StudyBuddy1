
import React, { useState, useRef, useEffect } from 'react';
import { studyService } from '../services/gemini';

interface TalkModeProps {
  onBack: () => void;
}

const TalkMode: React.FC<TalkModeProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([
    { sender: 'ai', text: "হাই বন্ধু! আমি 'রোমান' (Roman)। 😊 তোমার ইংরেজি বলার ভয় দূর করতে আমি এসেছি।\n\nতুমি আমার সাথে ইংরেজিতে কথা বলো, আর তোমার কোনো ভুল হলে আমি সেটা বাংলায় বুঝিয়ে সঠিক করে দেবো। চলো শুরু করি! তুমি আজ কেমন আছো? (How are you today?)" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: "Hello Roman!", text: "Hello Roman! How are you today?" },
    { label: "Practice English", text: "I want to practice speaking English with you." },
    { label: "Tell me a joke", text: "Can you tell me a joke in English?" },
    { label: "My hobbies", text: "Let's talk about my favorite hobbies." }
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const msgToProcess = textToSend || input;
    if (!msgToProcess.trim() || loading) return;

    const userMsg = msgToProcess;
    setInput('');
    
    const currentHistory = messages.map(msg => ({
      role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.text }]
    }));
    
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await studyService.chatWithFriend(currentHistory, userMsg);
      setMessages(prev => [...prev, { sender: 'ai', text: response || 'দুঃখিত বন্ধু, আমি বুঝতে পারিনি। আবার বলো তো!' }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'ওহ হো! আমার সার্ভারে একটু সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করো বন্ধু!' }]);
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

  const renderAiMessage = (text: string) => {
    // Check for the specific tip marker
    const tipMarker = "💡 Roman's Tip (শিখিয়ে দিচ্ছি):";
    if (text.includes(tipMarker)) {
      const parts = text.split("---");
      const tipContent = text.substring(text.indexOf(tipMarker) + tipMarker.length, parts.length > 1 ? text.indexOf("---") : text.length);
      const conversationPart = parts.length > 1 ? parts[1].trim() : "";

      return (
        <div className="space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-2xl rounded-tl-none shadow-sm animate-in slide-in-from-left-2 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💡</span>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Roman's Tip (শিখিয়ে দিচ্ছি)</p>
            </div>
            <p className="text-sm font-bold text-slate-700 leading-relaxed italic whitespace-pre-wrap">{tipContent.trim()}</p>
          </div>
          {conversationPart && (
             <p className="whitespace-pre-wrap font-medium leading-relaxed text-slate-800 px-2">{conversationPart}</p>
          )}
        </div>
      );
    }

    return <p className="whitespace-pre-wrap font-medium leading-relaxed">{text}</p>;
  };

  return (
    <div className="bg-white rounded-[2.5rem] flex flex-col h-[750px] shadow-2xl border border-slate-100 overflow-hidden max-w-2xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={onBack} className="hover:bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center transition">←</button>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xl animate-bounce">🤖</div>
          <div>
            <h2 className="font-black text-xl tracking-tight leading-none">Roman (রোমান)</h2>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">আপনার ইংরেজি শেখার বন্ধু</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-400/20 px-3 py-1.5 rounded-full border border-emerald-400/30 relative z-10">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-[9px] font-black uppercase tracking-widest">সহায়তায় আছি</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        <div className="text-center py-2">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] bg-white px-4 py-1.5 rounded-full border border-slate-100">আজকের কথোপকথন</span>
        </div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
            <div className="max-w-[85%] relative">
              <div className={`p-5 rounded-[1.8rem] shadow-sm transition-all ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                {msg.sender === 'ai' ? renderAiMessage(msg.text) : <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.text}</p>}
              </div>
              <button 
                onClick={() => copyMessage(msg.text)}
                className={`absolute top-0 ${msg.sender === 'user' ? '-left-10' : '-right-10'} p-2 text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110`}
                title="কপি করো"
              >
                📋
              </button>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-slate-200 p-5 rounded-[1.5rem] rounded-tl-none flex gap-3 items-center">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="italic text-slate-400 text-[10px] font-black uppercase tracking-widest">রোমান টাইপ করছে...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Footer / Input */}
      <div className="p-6 border-t border-slate-100 bg-white space-y-5">
        {/* Quick Prompts */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {quickPrompts.map((prompt, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(prompt.text)}
              className="whitespace-nowrap bg-slate-50 hover:bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-all active:scale-95 shadow-sm"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <button 
            onClick={startListening}
            className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 text-indigo-600 hover:bg-white border border-slate-100'}`}
            title="মুখে বলো (ইংরেজি)"
          >
            <span className="text-xl">🎤</span>
          </button>
          <div className="flex-grow relative">
            <input
              type="text"
              className="w-full border-2 border-slate-50 bg-slate-50 rounded-[1.5rem] px-8 py-5 focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold shadow-inner transition-all placeholder:text-slate-300"
              placeholder="এখানে ইংরেজিতে লেখো বা বলো..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-xl hover:bg-indigo-700 transition disabled:opacity-50 active:scale-95 group"
          >
            <span className="text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">➤</span>
          </button>
        </div>
        <p className="text-[9px] text-center font-bold text-slate-300 uppercase tracking-widest">ভুল করতে ভয় পেয়ো না, আমি তো আছি শেখানোর জন্য! ❤️</p>
      </div>
    </div>
  );
};

export default TalkMode;
