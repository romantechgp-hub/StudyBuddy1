
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    
    // Store history for the API call
    const currentHistory = messages.map(msg => ({
      role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.text }]
    }));
    
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Pass the actual conversation history
      const response = await studyService.chatWithFriend(currentHistory, userMsg);
      setMessages(prev => [...prev, { sender: 'ai', text: response || 'Sorry, I missed that.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Oops, I had a little trouble. Try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl flex flex-col h-[600px] shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="hover:bg-indigo-500 p-1 rounded transition">←</button>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">🤖</div>
          <div>
            <h2 className="font-bold">এআই বন্ধু (Buddy)</h2>
            <p className="text-xs opacity-80">অনলাইন</p>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none italic text-slate-400 text-sm">
              Buddy লিখছে...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow border border-slate-200 rounded-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="কিছু লেখো বা বলো..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            ➤
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          ভুল করতে ভয় পেয়ো না, বাডি তোমাকে শিখিয়ে দেবে!
        </p>
      </div>
    </div>
  );
};

export default TalkMode;
